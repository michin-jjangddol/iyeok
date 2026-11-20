// 시초점 배우기 4차: 여섯 효를 쌓아 괘 하나를 완성한다.
// 준비(쉰 가지 → 처음의 하나 따로 두기) → 효마다 [나누기 → 하나 덜기 → 왼쪽 넷씩 → 오른쪽 넷씩 → 남은 것 모으기 → 다시 모으기] × 3
// → 네 가지씩 묶기 → 효 그리기 → (다음 효: 49가지로 복원) … 상효까지 → 본괘·지괘 완성.
// 실제 점치기·괘사 풀이·음성·저장은 없다.
// 이전 판: 261120_2220_learn_Laude.js. 이번 판(261120_2247): 화면 안의 설정 양식을 없애고 시초점 [옵션] 화면(../options/)과
//   공용 설정 모듈(../261120_2247_settings_Laude.js)을 쓴다. 준비 단계에서는 저장된 옵션을 다시 읽어 따른다.
//   [같은 과정 요약해서 보기] 버튼을 없애고 옵션의 진행 방식(단계별 진행 | 빠르게 진행)으로 정한다.
//   진행 방식은 장면 수만 바꾸고 계산과 무관하므로 배우기 중에도 다음 나누기부터 따른다.
// 그 앞 판(2220): 넷씩 장면 이름 구분.
// 그 앞 판(2155): 왼쪽=하늘·오른쪽=땅 표시, '하나를 덜어 내는 쪽' 배우기 설정.
//   설정은 이 기기에만 저장한다(localStorage, 개인정보 없음). 한 번의 배우기 동안 쪽은 state.side 로 고정되고,
//   진행 중에 바꾼 설정은 준비 단계(쉰 가지·하나 따로 두기)에 있을 때만 바로 적용되며 그 뒤에는 다음 배우기부터 적용된다.
// 그 앞 판들: 1301 움직이다 멈추기, 0718 「계사전」 원문 연결.
import { SCENES, NOTICE, LINE_TABLE, LINE_NAMES, SIDE_LABELS } from "./261120_2247_scenes-ko_Laude.js";
import { XICI_SOURCE, XICI_CREDIT, VERSES, VERSE_ORDER, SCENE_VERSE, LAYOUT_NOTE } from "./261120_2155_xici-ko_Laude.js";
import { loadSettings, PACE_LABELS } from "../261120_2247_settings_Laude.js";
import { TOTAL, WORK, ROUNDS, round as calcRound, minLeft as minLeftOf, maxLeft as maxLeftOf, lineOf, exampleLeft } from "./261120_2155_procedure_Laude.js";
import { lineTypeFromYangCount, primaryLines, changedLines, changingPositions, findHexagram, lineName } from "../../app/iching.js";

const SVGNS = "http://www.w3.org/2000/svg";
const STALK_LEN = 116;
const ASIDE_ID = TOTAL - 1;
const LINES_PER_HEX = 6;
const ROUND_STEPS = ["split", "take", "countL", "countR", "gather", "merge"];
const AFTER_LINE = ["bundles", "line", "between", "result"]; // 세 차례가 끝난 뒤의 장면
const YANG_COUNT = { 6: 0, 7: 1, 8: 2, 9: 3 }; // 동전점 계산(app/iching.js)의 효 종류와 맞춘다

const $ = (id) => document.getElementById(id);

// ---- 시초점 옵션(공용 모듈, 이 기기에만 저장). 바꾸기는 시초점 메뉴의 [옵션] 화면(../options/)에서 한다. ----
let settings = loadSettings();
const PREP_STEPS = ["mat", "fifty", "aside"]; // 아직 아무것도 나누지 않은 준비 단계
// 이번 배우기에 고정된 쪽 기준의 나누기 범위
const minLeft = (n) => minLeftOf(n, state.side);
const maxLeft = (n) => maxLeftOf(n, state.side);
const els = {
  svg: $("field"), title: $("scene-title"), step: $("scene-step"), story: $("story"), counts: $("counts"),
  action: $("action"), panel: $("split-panel"), range: $("split-range"), readout: $("split-readout"),
  example: $("split-example"), exampleHint: $("split-example-hint"), minus: $("split-minus"), plus: $("split-plus"),
  confirm: $("split-confirm"), hint: $("split-hint"), prev: $("prev"), replay: $("replay"),
  next: $("next"), notice: $("notice"), endLinks: $("end-links"), restart: $("restart"), board: $("board"), table: $("line-table"),
  result: $("result"), review: $("review-toggle"), reviewBox: $("review"), confirmBox: $("restart-confirm"),
  confirmYes: $("restart-yes"), confirmNo: $("restart-no"), mat: $("mat"),
  settingsNow: $("settings-now"), settingsStatus: $("settings-status"),
  verseBtn: $("verse-toggle"), verseBox: $("verse"),
  modeManual: $("mode-manual"), modeMotion: $("mode-motion"), modeDesc: $("mode-desc"), manualBox: $("manual-box"),
  motionBox: $("motion-box"), knob: $("motion-knob"), motionReadout: $("motion-readout"), motionGo: $("motion-go"), motionAgain: $("motion-again"),
};

// ---- 움직이다 멈추기 ----
// 선택바는 허용 범위(왼쪽 1..N-2)의 가운데에서 시작해, 왼쪽 무더기가 커지는 쪽으로 먼저 움직이고 끝에서 돌아온다.
// 한 번 왕복에 3.2초: 대략의 양은 눈으로 볼 수 있지만 정확한 개수를 노려 멈추기는 어렵게 한 속도다.
// 화면 주사율과 상관없이 흐른 시간으로 위치를 정한다. 멈춘 순간의 위치가 그대로 분할이 된다(무작위 추첨이 아니다).
const MOTION_PERIOD_MS = 3200;
function motionPhase(elapsed) {
  const x = ((elapsed % MOTION_PERIOD_MS) / MOTION_PERIOD_MS + 0.25) % 1; // 0.25에서 시작 → 가운데, 커지는 방향
  return x < 0.5 ? x * 2 : 2 - x * 2; // 0..1 삼각파
}
function motionLeft(n, phase) {
  return Math.round(minLeft(n) + phase * (maxLeft(n) - minLeft(n)));
}
let motionRaf = null;
let motionStart = 0;
function motionAllowed() {
  return state.step === "split" && state.panel && state.splitMode === "motion" && state.motion === "moving" && !document.hidden;
}
function motionFrame(now) {
  motionRaf = null;
  if (!motionAllowed()) return cancelMotion(true);
  const n = state.work.length;
  const phase = motionPhase(now - motionStart);
  els.knob.style.left = `${phase * 100}%`;
  const left = motionLeft(n, phase);
  if (left !== state.preview) {
    state.preview = left;
    paint(state, false); // 개수는 그리지 않고 무더기 양만 바꾼다
  }
  motionRaf = requestAnimationFrame(motionFrame);
}
function startMotion() {
  if (state.step !== "split" || !state.panel || state.splitMode !== "motion" || state.motion === "moving") return;
  state.motion = "moving";
  state.preview = null;
  motionStart = performance.now();
  render(false);
  els.motionGo.focus();
  motionRaf = requestAnimationFrame(motionFrame);
}
function stopMotion() {
  if (state.motion !== "moving") return;
  if (motionRaf) cancelAnimationFrame(motionRaf);
  motionRaf = null;
  const n = state.work.length;
  state.preview = motionLeft(n, motionPhase(performance.now() - motionStart));
  state.motion = "stopped";
  render(false);
  (els.confirm.hidden ? els.motionAgain : els.confirm).focus();
}
// 장면 이동·방식 바꾸기·화면 숨김: 움직임을 멈추고 아무 분할도 남기지 않는다.
function cancelMotion(redraw) {
  if (motionRaf) cancelAnimationFrame(motionRaf);
  motionRaf = null;
  if (state.motion === "moving") {
    state.motion = "idle";
    state.preview = null;
    if (redraw) render(false);
  }
}

// ---- 상태: 화면은 언제나 이 값으로만 그린다(그리기가 상태를 바꾸지 않는다) ----
const clone = (s) => JSON.parse(JSON.stringify(s));
function fresh() {
  return {
    step: "mat", done: false, aside: false,
    line: 0, round: 0, // 지금 만드는 효(0=초효)와 차례(0..2)
    work: [], excluded: [], // 가지 번호 목록
    split: null, preview: null, panel: false, summary: settings.pace === "fast", // summary: 빠르게 진행(옵션)
    final: null,
    rounds: [], // 지금 효의 차례 기록
    lines: [], // 완성한 효: { value, rounds }
    review: false,
    verse: false, // 원문과 뜻 펼침(보기 상태일 뿐 계산과 무관)
    splitMode: "manual", // 나누기 방식(보기 선택): manual 직접 조절 | motion 움직이다 멈추기
    motion: "idle", // idle | moving | stopped
    side: settings.takeSide, // 하나를 덜어 내는 쪽. 이번 배우기 동안 고정(준비 단계에서만 설정을 따라간다)
  };
}
let state = fresh();
let entry = clone(state); // 지금 장면에 들어올 때의 상태
let history = []; // [이전]: 지나온 장면에 들어올 때의 상태
let data = null; // data/hexagrams.json (괘 이름)

// 이번 차례의 계산과 가지 배치(번호)를 상태에서 구한다.
function current(s = state) {
  const n = s.work.length;
  const left = s.split ?? s.preview;
  const base = { line: s.line, round: s.round, n, excluded: s.excluded.length };
  // 다시 모으기를 마친 뒤에는 작업 가지 수가 이미 줄었으므로, 이번 차례의 분할로 다시 계산하지 않는다.
  if ((s.step === "merge" || s.step === "summary") && s.done) return { ...base, next: n };
  if (left == null || !s.aside || n < 3 || !ROUND_STEPS.concat("summary").includes(s.step)) return base;
  const c = { ...base, ...calcRound(n, left, s.side) };
  const L = s.work.slice(0, left);
  const R = s.work.slice(left);
  // 하나는 고른 쪽 무더기의 가운데 쪽 끝에서 덜어 낸다.
  const fromLeft = c.side === "left";
  const LR = fromLeft ? L.slice(0, -1) : L;
  const RR = fromLeft ? R : R.slice(1);
  c.ids = {
    left: L, right: R, temp: fromLeft ? L[L.length - 1] : R[0], leftRest: LR, rightRest: RR,
    remLeft: LR.slice(LR.length - c.remLeft), coreLeft: LR.slice(0, LR.length - c.remLeft),
    remRight: RR.slice(RR.length - c.remRight), coreRight: RR.slice(0, RR.length - c.remRight),
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
  const merged = ((s.step === "merge" || s.step === "summary") && s.done) || AFTER_LINE.includes(s.step);
  if (!c.ids || merged || ph < 0) {
    const work = s.work.length ? s.work : [...Array(WORK).keys()];
    if ((s.step === "bundles" && s.done) || ["line", "between", "result"].includes(s.step)) {
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
  // 왼쪽(하늘)
  if (ph >= 3) grouped(id.coreLeft, id.remLeft.filter((i) => !ex.has(i)), 95, put);
  else pile(ph >= 2 ? id.leftRest : id.left, 95, 120, put);
  labels.left = ph >= 3 ? `본체 ${c.coreLeft} · 남김 ${c.remLeft}` : `하늘 · 왼쪽 ${ph >= 2 ? c.leftRest : c.left}`;
  // 사람을 상징하는 하나(가운데)
  if (ph >= 2 && !ex.has(id.temp)) {
    put(id.temp, { x: 180, y: Y, r: 0, c: "stalk-temp" });
    labels.temp = "사람 · 하나";
  }
  // 오른쪽(땅)
  if (ph >= 4) grouped(id.coreRight, id.remRight.filter((i) => !ex.has(i)), 265, put);
  else pile(ph >= 2 ? id.rightRest : id.right, 265, 120, put);
  labels.right = ph >= 4 ? `본체 ${c.coreRight} · 남김 ${c.remRight}` : `땅 · 오른쪽 ${ph >= 2 ? c.rightRest : c.right}`;
  return { pos, labels };
}
function paint(s, animate = true) {
  const { pos, labels } = layoutOf(s);
  stalks.forEach((el, i) => {
    const p = pos[i] ?? { x: 180, y: Y, r: 0, o: 0, c: "" };
    el.setAttribute("class", `stalk ${p.c || ""}${animate ? "" : " no-anim"}`.trim());
    el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)`;
    el.style.opacity = String(p.o);
  });
  if (s.motion === "moving") {
    labels.left = "";
    labels.right = "";
  }
  for (const k of ["left", "right", "temp", "center", "ex"]) $("lbl-" + k).textContent = labels[k];
  els.svg.setAttribute("aria-label", s.motion === "moving" ? "처음 따로 둔 시초 1가지. 두 무더기의 양이 바뀌는 중입니다." : describe(s, labels));
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
const inRound = (s) => ROUND_STEPS.includes(s.step) || s.step === "summary";
function countsText(s) {
  if (s.step === "mat") return "";
  if (!s.aside) return `시초 ${TOTAL}가지`;
  const e = s.excluded.length;
  const head = inRound(s) ? `${LINE_NAMES[s.line]} · ${s.round + 1}/${ROUNDS} 차례 · ` : "";
  return `${head}처음 따로 둔 것 1 · 작업 ${TOTAL - 1 - e} · 모아 둔 것 ${e} · 모두 ${TOTAL}`;
}
function stageText(s) {
  if (["mat", "fifty", "aside"].includes(s.step)) return "준비";
  if (s.step === "result") return "완성";
  if (inRound(s)) return `${LINE_NAMES[s.line]} · ${s.round + 1}/${ROUNDS} 차례`;
  return `${LINE_NAMES[s.line]} (${s.line + 1}/${LINES_PER_HEX})`;
}
const label = (v, c) => (typeof v === "function" ? v(c) : v);
function renderSettings() {
  els.settingsNow.textContent = `하나를 덜어 내는 쪽: ${SIDE_LABELS[state.side]} · ${PACE_LABELS[state.summary ? "fast" : "step"]}`;
  els.settingsStatus.textContent = PREP_STEPS.includes(state.step)
    ? ""
    : settings.takeSide !== state.side
      ? `이번 배우기는 ‘${SIDE_LABELS[state.side]}’으로 진행 중이라 그대로 계속합니다. 옵션에서 바꾼 방식은 다음 배우기부터 적용됩니다.`
      : "배우기 중에 옵션 화면으로 가면, 진행 중인 배우기가 처음부터 다시 시작될 수 있습니다.";
}
// 준비 단계에서는 아직 나눈 것이 없으므로 설정을 바로 따른다. 그 뒤로는 이번 배우기의 쪽을 바꾸지 않는다.
function followSettingsIfPrep() {
  settings = loadSettings();
  // 진행 방식은 계산과 무관하므로 언제나 옵션을 따른다(다음 나누기부터 적용).
  state.summary = settings.pace === "fast";
  entry.summary = state.summary;
  if (PREP_STEPS.includes(state.step)) {
    state.side = settings.takeSide;
    entry.side = settings.takeSide;
  }
}
function render(animate = true) {
  followSettingsIfPrep();
  renderSettings();
  const sc = SCENES[state.step];
  const c = context();
  els.title.textContent = sc.title(c);
  els.step.textContent = stageText(state);
  const lines = state.done && sc.done ? sc.done(c) : sc.text(c);
  els.story.innerHTML = "";
  for (const t of lines) {
    const p = document.createElement("p");
    if (typeof t === "object") { p.className = "learn-tale"; p.textContent = t.tale; }
    else p.textContent = t;
    els.story.appendChild(p);
  }
  els.counts.textContent = countsText(state);
  els.counts.hidden = state.step === "mat" || state.step === "result"; // 완성 화면에서는 마지막 효의 작업 수를 보이지 않는다

  const isSplit = state.step === "split";
  const isResult = state.step === "result";
  els.action.hidden = !sc.action || (isSplit && state.panel) || isResult;
  els.action.textContent = label(sc.action, c) || "";
  els.action.disabled = state.done;

  // 두 번째 차례부터, 그리고 둘째 효부터는 자세히/요약을 고를 수 있다.

  els.panel.hidden = !(isSplit && state.panel);
  if (!els.panel.hidden) renderPanel();

  els.prev.disabled = history.length === 0;
  els.replay.disabled = state.step === "mat";
  els.next.hidden = isSplit || isResult || state.step === "between";
  els.next.disabled = !!sc.action && !state.done;
  els.next.textContent = state.step === "mat" ? "배우기 시작" : "다음";
  els.endLinks.hidden = !isResult;
  els.mat.hidden = isResult;
  els.table.hidden = !(["line", "between", "result"].includes(state.step));
  renderBoard();
  renderResult();
  renderVerse();
  paint(state, animate);
}
// 「계사전」 원문과 뜻: 관련 장면에서는 그 구절, 처음과 완성 화면에서는 대목 전체.
function verseKeys(s) {
  if (s.step === "mat" || s.step === "result") return VERSE_ORDER;
  const k = SCENE_VERSE[s.step];
  return k ? [k] : [];
}
function renderVerse() {
  const keys = verseKeys(state);
  const all = keys.length > 1;
  els.verseBtn.hidden = keys.length === 0;
  els.verseBtn.setAttribute("aria-expanded", String(state.verse && keys.length > 0));
  els.verseBtn.textContent = state.verse ? "원문과 뜻 접기" : all ? "원문 전체와 뜻 보기" : "원문과 뜻 보기";
  els.verseBox.hidden = !(state.verse && keys.length);
  if (els.verseBox.hidden) return;
  const box = els.verseBox;
  box.innerHTML = "";
  const src = document.createElement("p");
  src.className = "verse-source";
  src.textContent = XICI_SOURCE;
  box.appendChild(src);
  for (const k of keys) {
    const v = VERSES[k];
    const item = document.createElement("div");
    item.className = "verse-item";
    const t = document.createElement("p");
    t.className = "verse-text";
    t.lang = "zh-Hant";
    t.textContent = v.text;
    const r = document.createElement("p");
    r.className = "verse-reading";
    r.textContent = v.reading;
    const m = document.createElement("p");
    m.className = "verse-meaning";
    m.textContent = v.meaning;
    item.append(t, r, m);
    if (v.note) {
      const n = document.createElement("p");
      n.className = "verse-note";
      n.textContent = "해설 · " + v.note;
      item.appendChild(n);
    }
    box.appendChild(item);
  }
  for (const text of [LAYOUT_NOTE, XICI_CREDIT]) {
    const p = document.createElement("p");
    p.className = "verse-credit";
    p.textContent = text;
    box.appendChild(p);
  }
}
function renderBoard() {
  const drawing = state.step === "line" && state.done;
  const shown = state.lines.length > 0 || state.step === "line";
  els.board.hidden = !shown || state.step === "result";
  for (let k = 0; k < LINES_PER_HEX; k++) {
    const row = els.board.querySelector(`[data-line="${k + 1}"]`);
    const l = state.lines[k] ? lineOf(state.lines[k].value * 4) : null;
    row.className = "board-line";
    row.querySelector(".board-mark").textContent = "";
    if (l) {
      row.classList.add(l.yang ? "is-yang" : "is-yin");
      row.querySelector(".board-label").textContent = `${LINE_NAMES[k]} · ${l.value} ${l.name}`;
      row.querySelector(".board-mark").textContent = l.mark;
    } else {
      const isNow = k === state.line && !drawing;
      row.querySelector(".board-label").textContent = `${LINE_NAMES[k]} · ${isNow ? "만드는 중" : "아직"}`;
      if (isNow) row.classList.add("is-now");
    }
  }
}
// 여섯 효의 수(6·7·8·9)로 본괘·지괘를 구한다. 계산은 동전점과 같은 함수(app/iching.js)를 쓴다.
function hexagramsFrom(values, hexData) {
  const types = values.map((v) => lineTypeFromYangCount(YANG_COUNT[v]));
  const pLines = primaryLines(types);
  const cLines = changedLines(types);
  const moving = changingPositions(types);
  return {
    types, pLines, cLines, moving,
    primary: hexData ? findHexagram(hexData, pLines) : null,
    changed: hexData ? findHexagram(hexData, cLines) : null,
  };
}
function hexBlock(title, h, linesArr, values) {
  const wrap = document.createElement("figure");
  wrap.className = "result-hex";
  const bars = document.createElement("div");
  bars.className = "result-bars";
  for (let k = LINES_PER_HEX - 1; k >= 0; k--) {
    const row = document.createElement("div");
    row.className = `result-bar ${linesArr[k] ? "is-yang" : "is-yin"}`;
    const mark = document.createElement("span");
    mark.className = "result-mark";
    if (values) mark.textContent = lineOf(values[k] * 4).mark;
    const bar = document.createElement("span");
    bar.className = "result-line";
    row.append(bar, mark);
    bars.appendChild(row);
  }
  const cap = document.createElement("figcaption");
  cap.innerHTML = "";
  const t = document.createElement("span");
  t.className = "result-kind";
  t.textContent = title;
  const nm = document.createElement("strong");
  nm.textContent = h ? `제${h.number}괘 ${h.titleKo} ${h.title}` : "괘 이름을 불러오지 못했습니다";
  cap.append(t, nm);
  wrap.setAttribute("aria-label", `${title}: ${nm.textContent}`);
  bars.setAttribute("aria-hidden", "true");
  wrap.append(bars, cap);
  return wrap;
}
function renderResult() {
  const show = state.step === "result" && state.lines.length === LINES_PER_HEX;
  els.result.hidden = !show;
  els.review.hidden = !show;
  els.reviewBox.hidden = !(show && state.review);
  els.review.setAttribute("aria-expanded", String(show && state.review));
  els.review.textContent = state.review ? "만든 과정 접기" : "만든 과정 돌아보기";
  if (!show) return;
  const values = state.lines.map((l) => l.value);
  const r = hexagramsFrom(values, data);
  const box = els.result;
  box.innerHTML = "";
  const hexes = document.createElement("div");
  hexes.className = "result-hexes";
  hexes.appendChild(hexBlock("본괘", r.primary, r.pLines, values));
  if (r.moving.length) hexes.appendChild(hexBlock("지괘", r.changed, r.cLines, null));
  box.appendChild(hexes);
  const p = document.createElement("p");
  p.className = "result-moving";
  p.textContent = r.moving.length
    ? `변효 ${r.moving.length}개: ${r.moving.map((i) => `${lineName(i, r.types[i].yang)}(${LINE_NAMES[i]}, ${r.types[i].name} ${r.types[i].yang ? "×" : "○"})`).join(", ")}. 변효를 뒤집어 지괘를 얻었습니다.`
    : "변효가 없어 본괘와 지괘가 같습니다.";
  box.appendChild(p);
  const how = document.createElement("p");
  how.className = "result-side";
  how.textContent = `이번 배우기의 방식: 하나를 덜어 내는 쪽 — ${SIDE_LABELS[state.side]}`;
  box.appendChild(how);
  const list = document.createElement("ul");
  list.className = "result-list";
  for (let k = LINES_PER_HEX - 1; k >= 0; k--) {
    const l = lineOf(values[k] * 4);
    const li = document.createElement("li");
    li.textContent = `${LINE_NAMES[k]}: ${l.value} ${l.name}(${l.desc})${l.mark ? " " + l.mark : ""}`;
    list.appendChild(li);
  }
  box.appendChild(list);
  if (!data) {
    const warn = document.createElement("p");
    warn.className = "result-warn";
    warn.textContent = "괘 이름 자료를 불러오지 못해 효의 모양만 보여 드립니다.";
    box.appendChild(warn);
  }
  if (state.review) renderReview();
}
function renderReview() {
  const box = els.reviewBox;
  box.innerHTML = "";
  const how = document.createElement("p");
  how.className = "review-side";
  how.textContent = `사람을 상징하는 하나를 덜어 낸 쪽: ${SIDE_LABELS[state.side]} (모든 차례에 같게 적용)`;
  box.appendChild(how);
  state.lines.forEach((ln, k) => {
    const sec = document.createElement("section");
    sec.className = "review-line";
    const h = document.createElement("h3");
    const l = lineOf(ln.value * 4);
    h.textContent = `${LINE_NAMES[k]} → ${ln.value} ${l.name}`;
    const ol = document.createElement("ol");
    ln.rounds.forEach((rd) => {
      const li = document.createElement("li");
      li.textContent = `시작 ${rd.n} → 왼쪽 ${rd.left} · 오른쪽 ${rd.right} → 모아 둔 것 ${rd.removed} (1 + ${rd.remLeft} + ${rd.remRight}) → ${rd.next}`;
      ol.appendChild(li);
    });
    const last = ln.rounds.at(-1);
    const fin = document.createElement("p");
    fin.textContent = `남은 ${last.next}가지 ÷ 4 = ${ln.value}`;
    sec.append(h, ol, fin);
    box.appendChild(sec);
  });
}
function renderPanel() {
  const motion = state.splitMode === "motion";
  els.modeManual.setAttribute("aria-pressed", String(!motion));
  els.modeMotion.setAttribute("aria-pressed", String(motion));
  els.modeDesc.textContent = motion
    ? "움직이다 멈추기: 무더기의 양을 보다가 원하는 순간에 멈춰 봅니다."
    : "직접 조절: 개수를 보며 천천히 나누어 봅니다.";
  els.manualBox.hidden = motion;
  els.motionBox.hidden = !motion;
  if (motion) updateMotion();
  else updateReadout();
  els.confirm.hidden = motion && state.motion !== "stopped";
  els.confirm.disabled = state.preview == null;
}
function updateMotion() {
  const n = state.work.length;
  const m = state.motion;
  els.motionGo.hidden = m === "stopped";
  els.motionGo.textContent = m === "moving" ? "멈춤" : "움직이기 시작";
  els.motionAgain.hidden = m !== "stopped";
  if (m === "moving") {
    els.motionReadout.textContent = "자, 두 무더기의 양이 바뀌고 있어요. 이쯤에서 나누고 싶다면 [멈춤]을 눌러 주세요.";
  } else if (m === "stopped") {
    const left = state.preview;
    els.knob.style.left = `${((left - minLeft(n)) / Math.max(1, maxLeft(n) - minLeft(n))) * 100}%`;
    els.motionReadout.textContent = `멈췄습니다 · 왼쪽 ${left} · 오른쪽 ${n - left} · 합계 ${n}`;
  } else {
    els.knob.style.left = "50%";
    els.motionReadout.textContent = "[움직이기 시작]을 눌러 보세요.";
  }
}
function setMode(mode) {
  if (state.step !== "split" || !state.panel || state.splitMode === mode) return;
  cancelMotion(false);
  state.splitMode = mode;
  entry.splitMode = mode; // 보기 방식은 [이전]으로 되돌리지 않는다
  state.motion = "idle";
  const n = state.work.length;
  state.preview = mode === "manual" ? randomStart(n) : null;
  render(false);
  (mode === "manual" ? els.range : els.motionGo).focus();
}
function randomStart(n) {
  return Math.max(minLeft(n), Math.min(maxLeft(n), Math.floor(n * 0.2) + Math.floor(Math.random() * Math.floor(n * 0.6))));
}
function updateReadout() {
  const n = state.work.length;
  const left = state.preview;
  els.range.min = String(minLeft(n));
  els.range.max = String(maxLeft(n));
  els.range.value = String(left);
  els.range.setAttribute("aria-valuetext", `왼쪽(하늘) ${left}가지, 오른쪽(땅) ${n - left}가지`);
  els.readout.textContent = `왼쪽 ${left} · 오른쪽 ${n - left} · 합계 ${n}`;
  els.hint.textContent =
    state.side === "left"
      ? `왼쪽은 ${minLeft(n)}~${maxLeft(n)}가지로 정할 수 있고, 하나를 덜어 낼 왼쪽에는 언제나 두 가지 이상 남습니다.`
      : `왼쪽은 ${minLeft(n)}~${maxLeft(n)}가지로 정할 수 있고, 오른쪽에는 언제나 두 가지 이상 남습니다.`;
  els.minus.disabled = left <= minLeft(n);
  els.plus.disabled = left >= maxLeft(n);
  const ex = state.line === 0 ? exampleLeft(state.round, n, state.side) : null;
  els.example.disabled = ex == null;
  els.example.textContent = ex == null ? "예시 따라가기" : `예시 따라가기 (${ex} · ${n - ex})`;
  els.exampleHint.textContent =
    state.line > 0
      ? "예시는 첫 효(초효)에만 있습니다. 이번 효는 자유롭게 나눠 주세요."
      : ex == null
        ? "예시(49 → 40 → 36)는 첫 차례부터 예시대로 나눴을 때만 이어집니다. 이번 차례는 자유롭게 나눠 주세요."
        : state.round === 0
          ? "예시를 고르면 이번 차례만 예시 수로 맞춥니다. 다음 차례에도 예시를 이어 갈 수 있습니다."
          : "지금까지 예시와 같은 수입니다. 예시를 고르면 이번 차례에 예시 수를 씁니다.";
}

// ---- 이동과 동작 ----
function goTo(s) {
  cancelMotion(false);
  s.motion = "idle";
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
  s.verse = false;
  const after = { mat: "fifty", fifty: "aside", aside: "split", take: "countL", countL: "countR", countR: "gather", gather: "merge", bundles: "line" };
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
  } else if (s.step === "line") s.step = s.lines.length < LINES_PER_HEX ? "between" : "result";
  else s.step = after[s.step];
  return s;
}
// 다음 효: 모아 둔 가지를 되돌려 49가지로 시작한다. 처음 따로 둔 하나와 완성한 효는 그대로.
function nextLineState() {
  const s = clone(state);
  Object.assign(s, {
    step: "split", done: false, line: s.lines.length, round: 0,
    work: [...Array(WORK).keys()], excluded: [], split: null, preview: null, panel: false, final: null, rounds: [], verse: false,
  });
  return s;
}
function next() {
  const sc = SCENES[state.step];
  if (["split", "between", "result"].includes(state.step)) return;
  if (sc.action && !state.done) return;
  goTo(nextState());
}
function prev() {
  if (!history.length) return;
  cancelMotion(false);
  const mode = state.splitMode;
  state = history.pop();
  state.splitMode = mode;
  state.motion = "idle";
  entry = clone(state);
  render();
  els.title.focus();
}
function record(c) {
  state.rounds.push({ n: c.n, side: c.side, left: c.left, right: c.right, remLeft: c.remLeft, remRight: c.remRight, removed: c.removed, next: c.next });
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
      break;
    case "gather":
      state.excluded.push(c.ids.temp, ...c.ids.remLeft, ...c.ids.remRight);
      record(c);
      break;
    case "merge":
      state.work = [...c.ids.coreLeft, ...c.ids.coreRight];
      break;
    case "summary":
      state.excluded.push(c.ids.temp, ...c.ids.remLeft, ...c.ids.remRight);
      state.work = [...c.ids.coreLeft, ...c.ids.coreRight];
      record(c);
      break;
    case "line":
      // 지금 효를 한 번만 효판에 올린다(여섯 개를 넘지 않는다).
      if (state.lines.length !== state.line || state.lines.length >= LINES_PER_HEX) return;
      state.lines.push({ value: lineOf(state.final).value, rounds: clone(state.rounds) });
      break;
    case "between":
      if (state.lines.length >= LINES_PER_HEX) return;
      return goTo(nextLineState());
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
  state.motion = "idle";
  // 자유 나누기: 처음 손이 가는 자리를 정해 두지 않으려고 가운데 근처 아무 곳에서 시작한다.
  if (state.splitMode === "manual" && state.preview == null) state.preview = randomStart(n);
  if (state.splitMode === "motion") state.preview = null;
  render();
  (state.splitMode === "manual" ? els.range : els.motionGo).focus();
}
function setPreview(v) {
  if (state.splitMode !== "manual") return;
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
  if (state.splitMode === "motion" && state.motion !== "stopped") return; // 움직이는 중에는 확정하지 않는다
  const n = state.work.length;
  const left = state.preview;
  if (!Number.isInteger(left) || left < minLeft(n) || left > maxLeft(n)) return;
  busy = true;
  const s = clone(state);
  s.split = left;
  s.panel = false;
  s.verse = false;
  s.done = false;
  s.step = (s.round >= 1 || s.line >= 1) && s.summary ? "summary" : "take";
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
// 처음부터 다시: 진행을 지우기 전에 한 번 확인한다.
let confirmOpener = null;
function askRestart(e) {
  confirmOpener = e.currentTarget;
  if (state.step === "mat" && !history.length) return;
  els.confirmBox.showModal();
  els.confirmNo.focus();
}
function restart() {
  cancelMotion(false);
  const mode = state.splitMode;
  state = fresh();
  state.splitMode = mode;
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
els.restart.addEventListener("click", askRestart);
// 옵션 화면에서 돌아오거나(뒤로 가기 캐시 포함) 다른 탭에서 옵션을 바꾼 경우: 준비 단계면 새 옵션을 따르고, 아니면 안내만 바꾼다.
function refreshSettings() {
  if (state.motion === "moving") {
    settings = loadSettings();
    renderSettings();
  } else render(false);
}
window.addEventListener("pageshow", (e) => { if (e.persisted) refreshSettings(); });
window.addEventListener("storage", refreshSettings);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshSettings(); });
els.confirmYes.addEventListener("click", () => {
  els.confirmBox.close();
  restart();
});
els.confirmNo.addEventListener("click", () => els.confirmBox.close());
els.confirmBox.addEventListener("close", () => {
  if (state.step !== "mat" && confirmOpener) confirmOpener.focus();
});
els.verseBtn.addEventListener("click", () => {
  state.verse = !state.verse;
  entry.verse = state.verse;
  render(false);
});
els.review.addEventListener("click", () => {
  state.review = !state.review;
  entry.review = state.review;
  render(false);
});
els.svg.addEventListener("click", () => {
  if (state.step === "aside") act();
  else if (state.step === "split" && state.split == null) openPanel();
});
els.range.addEventListener("input", () => setPreview(els.range.value));
els.minus.addEventListener("click", () => setPreview(state.preview - 1));
els.plus.addEventListener("click", () => setPreview(state.preview + 1));
els.example.addEventListener("click", () => {
  const ex = state.line === 0 ? exampleLeft(state.round, state.work.length, state.side) : null;
  if (ex != null) setPreview(ex);
});
els.confirm.addEventListener("click", confirmSplit);
els.modeManual.addEventListener("click", () => setMode("manual"));
els.modeMotion.addEventListener("click", () => setMode("motion"));
els.motionGo.addEventListener("click", () => (state.motion === "moving" ? stopMotion() : startMotion()));
els.motionAgain.addEventListener("click", () => {
  if (state.motion !== "stopped") return;
  state.motion = "idle";
  startMotion();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancelMotion(true); // 돌아왔을 때 저절로 분할이 정해지지 않게 처음 상태로 돌린다
});
render(false);
fetch("../../data/hexagrams.json")
  .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
  .then((d) => {
    data = d;
    if (state.step === "result") render(false);
  })
  .catch(() => {}); // 괘 이름 없이도 효 모양과 수는 보여 준다
