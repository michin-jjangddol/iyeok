// 시초점 배우기 3차: 첫 효 하나를 끝까지 만든다.
// 자리 펴기 → 쉰 가지 → 처음의 하나 따로 두기 → [나누기 → 하나 덜기 → 왼쪽 넷씩 → 오른쪽 넷씩 → 남은 것 모으기 → 다시 모으기] × 3
// → 네 가지씩 묶기 → 첫 효 그리기. 2~6효와 실제 점치기는 아직 없다. 음성 없음.
// 이전 판: 261119_2027_learn_Laude.js (2차, 장면 1~4)
import { SCENES, NOTICE, LINE_TABLE } from "./261119_2114_scenes-ko_Laude.js";
import { TOTAL, WORK, ROUNDS, round as calcRound, minLeft, maxLeft, lineOf, exampleLeft } from "./261119_2114_procedure_Laude.js";

const SVGNS = "http://www.w3.org/2000/svg";
const STALK_LEN = 116;
const ASIDE_ID = TOTAL - 1;
const ROUND_STEPS = ["split", "take", "countL", "countR", "gather", "merge"];

const $ = (id) => document.getElementById(id);
const els = {
  svg: $("field"), title: $("scene-title"), step: $("scene-step"), story: $("story"), counts: $("counts"),
  action: $("action"), panel: $("split-panel"), range: $("split-range"), readout: $("split-readout"),
  example: $("split-example"), exampleHint: $("split-example-hint"), minus: $("split-minus"), plus: $("split-plus"),
  confirm: $("split-confirm"), hint: $("split-hint"), summary: $("summary-toggle"), prev: $("prev"), replay: $("replay"),
  next: $("next"), notice: $("notice"), endLinks: $("end-links"), restart: $("restart"), board: $("board"), table: $("line-table"),
};

// ---- 상태: 화면은 언제나 이 값으로만 그린다(그리기가 상태를 바꾸지 않는다) ----
const clone = (s) => JSON.parse(JSON.stringify(s));
function fresh() {
  return {
    step: "mat", done: false, aside: false, round: 0,
    work: [], excluded: [], // 가지 번호 목록
    split: null, preview: null, panel: false, summary: false,
    final: null,
  };
}
let state = fresh();
let entry = clone(state); // 지금 장면에 들어올 때의 상태
let history = []; // [이전]: 지나온 장면에 들어올 때의 상태

// 이번 차례의 계산과 가지 배치(번호)를 상태에서 구한다.
function current(s = state) {
  const n = s.work.length;
  const left = s.split ?? s.preview;
  const base = { round: s.round, n, excluded: s.excluded.length };
  // 다시 모으기를 마친 뒤에는 작업 가지 수가 이미 줄었으므로, 이번 차례의 분할로 다시 계산하지 않는다.
  if ((s.step === "merge" || s.step === "summary") && s.done) return { ...base, next: n };
  if (left == null || !s.aside || n < 3) return base;
  const c = { ...base, ...calcRound(n, left) };
  const L = s.work.slice(0, left);
  const R = s.work.slice(left);
  c.ids = {
    left: L, right: R, temp: R[0], rightRest: R.slice(1),
    remLeft: L.slice(L.length - c.remLeft), coreLeft: L.slice(0, L.length - c.remLeft),
    remRight: R.slice(1).slice(R.length - 1 - c.remRight), coreRight: R.slice(1).slice(0, R.length - 1 - c.remRight),
  };
  return c;
}
function phase(s = state) {
  const i = ROUND_STEPS.indexOf(s.step);
  if (s.step === "summary") return s.done ? 6 : 1;
  return i < 0 ? -1 : i + (s.done ? 1 : 0);
}
function context(s = state) {
  const c = current(s);
  if (s.final != null) Object.assign(c, { final: s.final, ...lineOf(s.final) });
  return c;
}

// ---- 그림 ----
const stalks = [];
function buildField() {
  const g = document.createElementNS(SVGNS, "g");
  g.innerHTML =
    '<line x1="16" y1="50" x2="344" y2="50" class="zone-line"/>' +
    '<text x="22" y="22" class="zone-label">처음 따로 둔 것</text>' +
    '<text id="lbl-ex" x="214" y="22" class="zone-label"></text>' +
    '<text x="20" y="66" class="zone-label">작업하는 자리</text>' +
    '<text id="lbl-left" x="95" y="226" class="pile-label" text-anchor="middle"></text>' +
    '<text id="lbl-temp" x="180" y="226" class="pile-label pile-temp" text-anchor="middle"></text>' +
    '<text id="lbl-right" x="265" y="226" class="pile-label" text-anchor="middle"></text>' +
    '<text id="lbl-center" x="180" y="226" class="pile-label" text-anchor="middle"></text>';
  els.svg.appendChild(g);
  const layer = document.createElementNS(SVGNS, "g");
  els.svg.appendChild(layer);
  for (let i = 0; i < TOTAL; i++) {
    const line = document.createElementNS(SVGNS, "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", String(-STALK_LEN / 2)); // 가운데를 축으로 살짝 기울인다
    line.setAttribute("x2", "0");
    line.setAttribute("y2", String(STALK_LEN / 2));
    line.setAttribute("class", "stalk");
    layer.appendChild(line);
    stalks.push(line);
  }
}
const tilt = (k) => (((k * 37) % 7) - 3) * 0.3;
const Y = 146;
function pile(ids, cx, width, put, cls = "") {
  const w = Math.min(2.1, width / Math.max(ids.length, 1));
  ids.forEach((id, k) => put(id, { x: cx + (k - (ids.length - 1) / 2) * w, y: Y, r: tilt(id), c: cls }));
}
// 넷씩 센 본체는 네 개씩 묶음 사이를 띄우고, 남긴 것은 조금 떨어뜨려 옅게 그린다.
function grouped(core, rem, cx, put) {
  const s = 1.6, gap = 3.5, groups = core.length / 4;
  const width = groups * (4 * s + gap) + (rem.length ? 6 + rem.length * s : 0);
  let x = cx - width / 2;
  core.forEach((id, j) => put(id, { x: x + Math.floor(j / 4) * (4 * s + gap) + (j % 4) * s, y: Y, r: 0, c: "" }));
  x += groups * (4 * s + gap) + 6;
  rem.forEach((id, k) => put(id, { x: x + k * s, y: Y + 8, r: 0, c: "stalk-rem" }));
}
function layoutOf(s) {
  const pos = new Array(TOTAL);
  const put = (id, p) => (pos[id] = { o: 1, ...p });
  const labels = { left: "", right: "", temp: "", center: "", ex: "" };
  if (s.step === "mat") {
    for (let i = 0; i < TOTAL; i++) put(i, { x: 180, y: Y, r: 0, o: 0, c: "" });
    return { pos, labels };
  }
  if (!s.aside) {
    pile([...Array(TOTAL).keys()], 180, 110, put);
    labels.center = `시초 ${TOTAL}가지`;
    return { pos, labels };
  }
  put(ASIDE_ID, { x: 88, y: 36, r: 90, c: "stalk-aside" });
  const ex = new Set(s.excluded);
  s.excluded.forEach((id, k) => put(id, { x: 272, y: 28 + k * 0.7, r: 90, c: "stalk-ex" }));
  if (s.excluded.length) labels.ex = `모아 둔 것 ${s.excluded.length}`;
  const ph = phase(s);
  const c = current(s);
  const merged = ((s.step === "merge" || s.step === "summary") && s.done) || ["bundles", "line", "end"].includes(s.step);
  if (!c.ids || merged || ph < 0) {
    const work = s.work.length ? s.work : [...Array(WORK).keys()];
    if ((s.step === "bundles" && s.done) || s.step === "line" || s.step === "end") {
      grouped(work, [], 180, put);
      labels.center = `4 × ${work.length / 4}`;
    } else {
      pile(work, 180, 110, put);
      labels.center = `작업 ${work.length}`;
    }
    return { pos, labels };
  }
  const id = c.ids;
  // 왼쪽
  if (ph >= 3) grouped(id.coreLeft, id.remLeft.filter((i) => !ex.has(i)), 95, put);
  else pile(id.left, 95, 120, put);
  labels.left = ph >= 3 ? `본체 ${c.coreLeft} · 남김 ${c.remLeft}` : `왼쪽 ${c.left}`;
  // 덜어 둔 하나와 오른쪽
  if (ph >= 2) {
    if (!ex.has(id.temp)) {
      put(id.temp, { x: 180, y: Y, r: 0, c: "stalk-temp" });
      labels.temp = "덜어 둔 하나";
    }
    if (ph >= 4) grouped(id.coreRight, id.remRight.filter((i) => !ex.has(i)), 265, put);
    else pile(id.rightRest, 265, 120, put);
    labels.right = ph >= 4 ? `본체 ${c.coreRight} · 남김 ${c.remRight}` : `오른쪽 ${c.rightRest}`;
  } else {
    pile(id.right, 265, 120, put);
    labels.right = `오른쪽 ${c.right}`;
  }
  return { pos, labels };
}
function paint(s, animate = true) {
  const { pos, labels } = layoutOf(s);
  stalks.forEach((el, i) => {
    const p = pos[i] ?? { x: 180, y: Y, r: 0, o: 0, c: "" };
    el.classList.toggle("no-anim", !animate);
    el.setAttribute("class", `stalk ${p.c || ""}${animate ? "" : " no-anim"}`.trim());
    el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)`;
    el.style.opacity = String(p.o);
  });
  for (const k of ["left", "right", "temp", "center", "ex"]) $("lbl-" + k).textContent = labels[k];
  els.svg.setAttribute("aria-label", describe(s, labels));
}
function describe(s, labels) {
  if (s.step === "mat") return "펼쳐 놓은 천. 아직 시초가 없습니다.";
  const parts = [];
  if (s.aside) parts.push("처음 따로 둔 시초 1가지");
  if (labels.ex) parts.push(labels.ex + "가지");
  for (const k of ["left", "temp", "right", "center"]) if (labels[k]) parts.push(labels[k]);
  return parts.join(", ") + ".";
}

// ---- 글·버튼 ----
function countsText(s) {
  if (s.step === "mat") return "";
  if (!s.aside) return `시초 ${TOTAL}가지`;
  const e = s.excluded.length;
  const head = ROUND_STEPS.includes(s.step) || s.step === "summary" ? `${s.round + 1}/${ROUNDS} 차례 · ` : "";
  return `${head}처음 따로 둔 것 1 · 작업 ${TOTAL - 1 - e} · 모아 둔 것 ${e} · 모두 ${TOTAL}`;
}
function stageText(s) {
  if (["mat", "fifty", "aside"].includes(s.step)) return "준비";
  if (["bundles", "line", "end"].includes(s.step)) return "첫 효";
  return `${s.round + 1} / ${ROUNDS} 차례`;
}
function render(animate = true) {
  const sc = SCENES[state.step];
  const c = context();
  els.title.textContent = sc.title(c);
  els.step.textContent = stageText(state);
  const lines = state.done && sc.done ? sc.done(c) : sc.text(c);
  els.story.innerHTML = "";
  for (const t of lines) {
    const p = document.createElement("p");
    p.textContent = t;
    els.story.appendChild(p);
  }
  els.counts.textContent = countsText(state);
  els.counts.hidden = state.step === "mat";

  const isSplit = state.step === "split";
  els.action.hidden = !sc.action || (isSplit && state.panel) || state.step === "end";
  els.action.textContent = sc.action || "";
  els.action.disabled = state.done;

  els.summary.hidden = !(isSplit && state.round >= 1);
  els.summary.setAttribute("aria-pressed", String(state.summary));
  els.summary.textContent = state.summary ? "같은 과정 요약해서 보기: 켜짐" : "같은 과정 요약해서 보기";

  els.panel.hidden = !(isSplit && state.panel);
  if (!els.panel.hidden) updateReadout();

  els.prev.disabled = history.length === 0;
  els.replay.disabled = state.step === "mat";
  els.next.hidden = isSplit || state.step === "end";
  els.next.disabled = !!sc.action && !state.done;
  els.next.textContent = state.step === "mat" ? "배우기 시작" : "다음";
  els.endLinks.hidden = state.step !== "end";
  els.table.hidden = !["line", "end"].includes(state.step);
  renderBoard();
  paint(state, animate);
}
function renderBoard() {
  const show = (state.step === "line" && state.done) || state.step === "end";
  els.board.hidden = !(state.step === "line" || state.step === "end");
  const first = els.board.querySelector('[data-line="1"]');
  first.className = "board-line";
  first.querySelector(".board-label").textContent = "초효 · 아직 그리지 않음";
  first.querySelector(".board-mark").textContent = "";
  if (show && state.final != null) {
    const l = lineOf(state.final);
    first.classList.add(l.yang ? "is-yang" : "is-yin");
    first.querySelector(".board-label").textContent = `초효 · ${l.value} ${l.name}`;
    first.querySelector(".board-mark").textContent = l.mark;
  }
}
function updateReadout() {
  const n = state.work.length;
  const left = state.preview;
  els.range.min = String(minLeft(n));
  els.range.max = String(maxLeft(n));
  els.range.value = String(left);
  els.range.setAttribute("aria-valuetext", `왼쪽 ${left}가지, 오른쪽 ${n - left}가지`);
  els.readout.textContent = `왼쪽 ${left} · 오른쪽 ${n - left} · 합계 ${n}`;
  els.hint.textContent = `왼쪽은 ${minLeft(n)}~${maxLeft(n)}가지로 정할 수 있고, 오른쪽에는 언제나 두 가지 이상 남습니다.`;
  els.minus.disabled = left <= minLeft(n);
  els.plus.disabled = left >= maxLeft(n);
  const ex = exampleLeft(state.round, n);
  els.example.disabled = ex == null;
  els.example.textContent = ex == null ? "예시 따라가기" : `예시 따라가기 (${ex} · ${n - ex})`;
  els.exampleHint.textContent =
    ex == null
      ? "예시(49 → 40 → 36)는 첫 차례부터 예시대로 나눴을 때만 이어집니다. 이번 차례는 자유롭게 나눠 주세요."
      : state.round === 0
        ? "예시를 고르면 이번 차례만 예시 수로 맞춥니다. 다음 차례에도 예시를 이어 갈 수 있습니다."
        : "지금까지 예시와 같은 수입니다. 예시를 고르면 이번 차례에 예시 수를 씁니다.";
}

// ---- 이동과 동작 ----
function goTo(s) {
  history.push(entry);
  state = s;
  entry = clone(state);
  render();
  els.title.focus();
}
function nextState() {
  const s = clone(state);
  s.done = false;
  s.panel = false;
  const after = { mat: "fifty", fifty: "aside", aside: "split", take: "countL", countL: "countR", countR: "gather", gather: "merge", bundles: "line", line: "end" };
  if (s.step === "merge" || s.step === "summary") {
    if (s.round < ROUNDS - 1) {
      s.round += 1;
      s.step = "split";
      s.split = null;
      s.preview = null;
    } else {
      s.final = s.work.length;
      s.step = "bundles";
    }
  } else s.step = after[s.step];
  return s;
}
function next() {
  const sc = SCENES[state.step];
  if (state.step === "split" || state.step === "end") return;
  if (sc.action && !state.done) return;
  goTo(nextState());
}
function prev() {
  if (!history.length) return;
  state = history.pop();
  entry = clone(state);
  render();
  els.title.focus();
}
function act() {
  if (state.done) return; // 여러 번 눌러도 한 번만
  const c = current();
  switch (state.step) {
    case "aside":
      state.aside = true;
      state.work = [...Array(WORK).keys()];
      break;
    case "split":
      return openPanel();
    case "take":
    case "countL":
    case "countR":
    case "bundles":
    case "line":
      break;
    case "gather":
      state.excluded.push(c.ids.temp, ...c.ids.remLeft, ...c.ids.remRight);
      break;
    case "merge":
      state.work = [...c.ids.coreLeft, ...c.ids.coreRight];
      break;
    case "summary":
      state.excluded.push(c.ids.temp, ...c.ids.remLeft, ...c.ids.remRight);
      state.work = [...c.ids.coreLeft, ...c.ids.coreRight];
      break;
    default:
      return;
  }
  state.done = true;
  render();
}
function openPanel() {
  if (state.step !== "split" || state.panel) return;
  const n = state.work.length;
  state.panel = true;
  // 자유 나누기: 처음 손이 가는 자리를 정해 두지 않으려고 가운데 근처 아무 곳에서 시작한다.
  if (state.preview == null) state.preview = Math.max(minLeft(n), Math.min(maxLeft(n), Math.floor(n * 0.2) + Math.floor(Math.random() * Math.floor(n * 0.6))));
  render();
  els.range.focus();
}
function setPreview(v) {
  const n = state.work.length;
  const left = Math.min(maxLeft(n), Math.max(minLeft(n), Math.round(Number(v))));
  if (!Number.isFinite(left)) return;
  state.preview = left;
  updateReadout();
  paint(state);
}
let busy = false;
function confirmSplit() {
  if (state.step !== "split" || state.split != null || busy) return;
  const n = state.work.length;
  const left = state.preview;
  if (!Number.isInteger(left) || left < minLeft(n) || left > maxLeft(n)) return;
  busy = true;
  const s = clone(state);
  s.split = left;
  s.panel = false;
  s.done = false;
  s.step = s.round >= 1 && s.summary ? "summary" : "take";
  goTo(s);
  busy = false;
}
function replay() {
  if (state.step === "mat") return;
  const from = state.done ? entry : history.at(-1) ?? entry;
  paint(from, false);
  void els.svg.getBoundingClientRect(); // 직전 모습을 먼저 그리게 한다
  requestAnimationFrame(() => requestAnimationFrame(() => paint(state, true)));
  els.story.focus();
}
function restart() {
  state = fresh();
  entry = clone(state);
  history = [];
  render(false);
  els.title.focus();
}

// ---- 연결 ----
buildField();
els.notice.textContent = NOTICE;
els.table.textContent = LINE_TABLE;
els.next.addEventListener("click", next);
els.prev.addEventListener("click", prev);
els.replay.addEventListener("click", replay);
els.action.addEventListener("click", act);
els.restart.addEventListener("click", restart);
els.svg.addEventListener("click", () => {
  if (state.step === "aside") act();
  else if (state.step === "split" && state.split == null) openPanel();
});
els.summary.addEventListener("click", () => {
  state.summary = !state.summary;
  entry.summary = state.summary; // 보기 방식은 [이전]으로 되돌리지 않는다
  render(false);
});
els.range.addEventListener("input", () => setPreview(els.range.value));
els.minus.addEventListener("click", () => setPreview(state.preview - 1));
els.plus.addEventListener("click", () => setPreview(state.preview + 1));
els.example.addEventListener("click", () => {
  const ex = exampleLeft(state.round, state.work.length);
  if (ex != null) setPreview(ex);
});
els.confirm.addEventListener("click", confirmSplit);
render(false);
