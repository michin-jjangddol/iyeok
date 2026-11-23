// 261123_2003 LAUDE: 원본 261123_1831_try_Laude.js. 설정의 '진행 방식'을 맛보기에도 적용(JJDD).
//   단계별 진행: 멈춘 뒤 다섯 장면(나누기·인시초 덜기·하늘 쪽 넷씩·땅 쪽 넷씩·윤시초 모으기)과 다시 모으기를 [다음 장면]으로 하나씩 넘긴다.
//   빠르게 진행: 이전처럼 자동으로 지나간다. 어느 쪽이든 계산은 멈춘 순간 한 번만 하며, 보여 주는 속도만 다르다.
// 261123_1831 LAUDE: 시초점 맛보기(실제로 한 괘 뽑기). JJDD 요청(SHANA 요청문).
//   흐름: 설정 확인 → 시작(쉰 가지 → 태시초 하나 따로) → [움직이기 시작]·[멈춤] × 세 차례 → 한 효 → … → 여섯 효 → [괘 보기] → 결과.
//   계산은 배우기와 같은 공용 모듈을 쓴다: 나누기 한 차례 계산(procedure), 효 판정·음양 대응·변효 기호(why-ko), 설정(settings),
//   본괘·지괘(app/iching.js), 괘사(assets 의 hexagram-texts). 이 파일에는 화면 흐름과 시초판 그림만 있다.
//   - 나누기는 '움직이다 멈추기'만. 멈추는 순간의 위치로 나뉘고 바로 확정된다(다시 뽑기·확인 버튼 없음, 무작위로 바꾸지 않음).
//   - 나눈 뒤의 인시초 덜기·넷씩 세기·윤시초 모으기는 자동으로 보여 준다. 그림·개수는 실제 계산 결과 그대로다.
//   - 시작할 때 설정 전체를 복사해 이번 괘 동안 고정한다(다른 탭에서 바꿔도 진행 중인 효·괘는 그대로).
//   - 진행은 저장하지 않는다(새로고침·페이지 닫기·처음부터 → 초기화).
import { TOTAL, WORK, ROUNDS, round as calcRound, minLeft, maxLeft, lineOf } from "../learn/261120_2155_procedure_Laude.js";
import { explainLine, readingText, appliedValue, headlineFor, lineLabel, movingMark, criterionText, LINE_INFO } from "../learn/261123_1036_why-ko_Laude.js";
import { LINE_NAMES } from "../learn/261123_1036_scenes-ko_Laude.js";
import { loadSettings, SIDE_LABELS, PACE_LABELS, READING_LABELS, mappingShort, SYMBOL_LABELS, MOTION_START_LABELS, MOTION_START_DESC, motionConfig } from "../261123_1036_settings_Laude.js";
import { lineTypeFromYangCount, primaryLines, changedLines, changingPositions, findHexagram, lineName } from "../../app/iching.js";
import { createTextLoader, fetchJson } from "../../assets/261123_1831_hexagram-texts_Laude.js";

const SVGNS = "http://www.w3.org/2000/svg";
const STALK_LEN = 116;
const ASIDE_ID = TOTAL - 1; // 태시초로 따로 두는 가지
const LINES_PER_HEX = 6;
const YANG_COUNT = { 6: 0, 7: 1, 8: 2, 9: 3 }; // 동전점 계산(app/iching.js)의 효 종류와 맞춘다(배우기와 같음)
const CONTENT_INDEX = "../../data/hexagrams/261119_1939_content-index_Shana.json";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STEP_MS = reduceMotion ? 160 : 700; // 자동 연출 한 장면의 시간
const ORD = ["첫째", "둘째", "셋째"];

const $ = (id) => document.getElementById(id);
const els = {
  setup: $("setup"), cast: $("cast"), result: $("result"), stepBtn: $("step"), sumPace: $("sum-pace"),
  sumSide: $("sum-side"), sumReading: $("sum-reading"), sumSymbols: $("sum-symbols"), sumMotion: $("sum-motion"),
  start: $("start"), title: $("cast-title"), step: $("cast-step"), fixed: $("cast-fixed"),
  svg: $("field"), counts: $("counts"), knob: $("motion-knob"), readout: $("motion-readout"),
  go: $("go"), next: $("next"), msg: $("msg"), board: $("board"),
  restart: $("restart"), confirm: $("restart-confirm"), confirmYes: $("restart-yes"), confirmNo: $("restart-no"),
  hexes: $("result-hexes"), moving: $("result-moving"), list: $("result-list"), how: $("result-how"),
  process: $("process"), texts: $("texts"), dataError: $("data-error"), again: $("again"),
};
const textLoader = createTextLoader(CONTENT_INDEX);

let data = null; // data/hexagrams.json(괘 이름)
let cfg = null; // 시작할 때 고정한 설정
let st = null; // 진행 상태
let token = 0; // 처음부터·새 괘마다 바뀐다. 예전 연출의 남은 타이머는 이 값이 다르면 아무것도 하지 않는다.
let seq = null; // 진행 중인 연출 { steps, at, timer, token, manual } — manual: 단계별(장면마다 [다음 장면])
let motionRaf = null, motionStart = 0, motionCfg = null;

// ---- 상태 ----
function fresh() {
  return {
    stage: "intro", // intro | ready | moving | auto | lineDone | hexDone
    aside: false,
    line: 0, round: 0,
    work: [...Array(WORK).keys()], // 이번 차례의 정시초(가지 번호)
    excluded: [], // 이번 효에서 윤시초 자리로 모은 가지(윤시초 + 인시초)
    rounds: [], // 이번 효의 차례 기록
    r: null, ids: null, sub: null, // 이번 차례 계산과 연출 단계(split·take·countL·countR·gather)
    preview: null, // 움직이는 동안의 위치(그림만)
    lines: [], // 완성한 효 { value(적용 효), calcValue(정시초 산수), final, rounds }
  };
}

// ---- 시초판 그림 ----
const stalks = [];
function buildField() {
  const g = document.createElementNS(SVGNS, "g");
  g.innerHTML =
    '<line x1="16" y1="50" x2="344" y2="50" class="zone-line"/>' +
    '<text x="22" y="22" class="zone-label">태시초</text>' +
    '<text id="lbl-ex" x="214" y="22" class="zone-label"></text>' +
    '<text x="20" y="66" class="zone-label">정시초</text>' +
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
    line.setAttribute("y1", String(-STALK_LEN / 2));
    line.setAttribute("x2", "0");
    line.setAttribute("y2", String(STALK_LEN / 2));
    line.setAttribute("class", "stalk");
    layer.appendChild(line);
    stalks.push(line);
  }
}
const tilt = (k) => (((k * 37) % 7) - 3) * 0.3;
const Y = 146;
function pile(ids, cx, width, put) {
  const w = Math.min(2.1, width / Math.max(ids.length, 1));
  ids.forEach((id, k) => put(id, { x: cx + (k - (ids.length - 1) / 2) * w, y: Y, r: tilt(id), c: "" }));
}
function grouped(core, rem, cx, put) {
  const s = 1.6, gap = 3.5, groups = core.length / 4;
  const width = groups * (4 * s + gap) + (rem.length ? 6 + rem.length * s : 0);
  let x = cx - width / 2;
  core.forEach((id, j) => put(id, { x: x + Math.floor(j / 4) * (4 * s + gap) + (j % 4) * s, y: Y, r: 0, c: "" }));
  x += groups * (4 * s + gap) + 6;
  rem.forEach((id, k) => put(id, { x: x + k * s, y: Y + 8, r: 0, c: "stalk-rem" }));
}
// 이번 차례의 가지 번호 나누기(배우기와 같은 배치: 하나는 고른 쪽 무더기의 가운데 쪽 끝에서 덜어 낸다)
function idsOf(work, r) {
  const L = work.slice(0, r.left), R = work.slice(r.left);
  const fromLeft = r.side === "left";
  const LR = fromLeft ? L.slice(0, -1) : L;
  const RR = fromLeft ? R : R.slice(1);
  return {
    left: L, right: R, temp: fromLeft ? L[L.length - 1] : R[0], leftRest: LR, rightRest: RR,
    remLeft: LR.slice(LR.length - r.remLeft), coreLeft: LR.slice(0, LR.length - r.remLeft),
    remRight: RR.slice(RR.length - r.remRight), coreRight: RR.slice(0, RR.length - r.remRight),
  };
}
function exSizes(s) {
  const sizes = [];
  let left = s.excluded.length;
  for (const r of s.rounds) {
    if (left <= 0) break;
    const k = Math.min(r.removed, left);
    sizes.push(k);
    left -= k;
  }
  if (left > 0) sizes.push(left);
  return sizes;
}
function layoutOf(s) {
  const pos = new Array(TOTAL);
  const put = (id, p) => (pos[id] = { o: 1, ...p });
  const labels = { left: "", right: "", temp: "", center: "", ex: "" };
  if (!s.aside) {
    pile([...Array(TOTAL).keys()], 180, 110, put);
    labels.center = `시초 ${TOTAL}가지`;
    return { pos, labels };
  }
  put(ASIDE_ID, { x: 88, y: 36, r: 90, c: "stalk-aside" });
  // 윤시초 자리: 차례마다 따로 짧은 묶음(이번 차례 모으기 전이면 지난 차례까지)
  const sizes = exSizes({ excluded: s.excluded, rounds: s.r && s.sub === "gather" ? [...s.rounds, s.r] : s.rounds });
  let at = 0;
  sizes.forEach((size, g) => {
    s.excluded.slice(at, at + size).forEach((id, j) => put(id, { x: 226 + g * 44, y: 30 + j * 1.4, r: 90, k: 0.3, c: "stalk-ex" }));
    at += size;
  });
  labels.ex = s.excluded.length ? `윤시초 ${sizes.join(" · ")}` : "윤시초";
  if (s.excluded.length) labels.exAria = `윤시초: 윤시초와 인시초 ${s.excluded.length}가지(차례마다 ${sizes.join(", ")}가지)`;
  const ex = new Set(s.excluded);
  if (s.stage === "moving" && s.preview != null) {
    pile(s.work.slice(0, s.preview), 95, 120, put);
    pile(s.work.slice(s.preview), 265, 120, put);
    return { pos, labels }; // 움직이는 동안 개수는 숨긴다
  }
  if (s.stage === "auto" && s.ids) {
    const id = s.ids, r = s.r, sub = s.sub;
    const took = sub !== "split";
    if (["countL", "countR", "gather"].includes(sub)) grouped(id.coreLeft, id.remLeft.filter((i) => !ex.has(i)), 95, put);
    else pile(took ? id.leftRest : id.left, 95, 120, put);
    labels.left = ["countL", "countR", "gather"].includes(sub) ? `정 ${r.coreLeft} · 윤 ${r.remLeft}` : `하늘 · 왼쪽 ${took ? r.leftRest : r.left}`;
    if (took && !ex.has(id.temp)) {
      put(id.temp, { x: 180, y: Y, r: 0, c: "stalk-temp" });
      labels.temp = "인시초 1";
    }
    if (["countR", "gather"].includes(sub)) grouped(id.coreRight, id.remRight.filter((i) => !ex.has(i)), 265, put);
    else pile(took ? id.rightRest : id.right, 265, 120, put);
    labels.right = ["countR", "gather"].includes(sub) ? `정 ${r.coreRight} · 윤 ${r.remRight}` : `땅 · 오른쪽 ${took ? r.rightRest : r.right}`;
    return { pos, labels };
  }
  if (["lineDone", "hexDone"].includes(s.stage)) {
    grouped(s.work, [], 180, put);
    labels.center = cfg.readingMethod === "yun" ? `정시초 ${s.work.length}` : `정시초 4 × ${s.work.length / 4}`;
  } else {
    pile(s.work, 180, 110, put);
    labels.center = `정시초 ${s.work.length}가지`;
  }
  return { pos, labels };
}
function paint(animate = true) {
  const { pos, labels } = layoutOf(st);
  stalks.forEach((el, i) => {
    const p = pos[i] ?? { x: 180, y: Y, r: 0, o: 0, c: "" };
    el.setAttribute("class", `stalk ${p.c || ""}${animate ? "" : " no-anim"}`.trim());
    el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg) scale(1, ${p.k ?? 1})`;
    el.style.opacity = String(p.o);
  });
  for (const k of ["left", "right", "temp", "center", "ex"]) $("lbl-" + k).textContent = labels[k];
  const parts = [];
  if (st.stage === "moving") parts.push("태시초 1가지", "두 무더기의 양이 바뀌는 중입니다");
  else {
    if (st.aside) parts.push("태시초 1가지");
    if (labels.exAria) parts.push(labels.exAria);
    for (const k of ["left", "temp", "right", "center"]) if (labels[k]) parts.push(labels[k]);
  }
  els.svg.setAttribute("aria-label", parts.join(", ") + ".");
  const inWork = st.aside ? TOTAL - 1 - st.excluded.length : TOTAL;
  els.counts.textContent = st.aside ? `태시초 1 · 정시초 ${inWork} · 윤시초 ${st.excluded.length} · 모두 ${TOTAL}` : `시초 ${TOTAL}가지`;
}

// ---- 글·버튼 ----
function settingsText(s) {
  return {
    side: SIDE_LABELS[s.takeSide],
    pace: PACE_LABELS[s.pace],
    reading: `${READING_LABELS[s.readingMethod]} · ${mappingShort(s.readingMethod, s.yunMapping)}`,
    symbols: SYMBOL_LABELS[s.symbols],
    motion: `${MOTION_START_LABELS[s.motionStart]}(${MOTION_START_DESC[s.motionStart]}) · 빠르기 ${s.motionSpeed}`,
  };
}
function renderSetup() {
  const t = settingsText(loadSettings());
  els.sumSide.textContent = t.side;
  els.sumPace.textContent = t.pace;
  els.sumReading.textContent = t.reading;
  els.sumSymbols.textContent = t.symbols;
  els.sumMotion.textContent = t.motion;
}
function renderBoard() {
  for (let k = 0; k < LINES_PER_HEX; k++) {
    const row = els.board.querySelector(`[data-line="${k + 1}"]`);
    const ln = st.lines[k];
    row.className = "board-line";
    row.querySelector(".board-mark").textContent = "";
    if (ln) {
      const info = LINE_INFO[ln.value];
      row.classList.add(info.yang ? "is-yang" : "is-yin");
      row.querySelector(".board-label").textContent = `${LINE_NAMES[k]} · ${lineLabel(ln.value, cfg.readingMethod, cfg.yunMapping)}`;
      row.querySelector(".board-mark").textContent = movingMark(ln.value, cfg.symbols);
    } else {
      const now = k === st.line && st.stage !== "hexDone";
      row.querySelector(".board-label").textContent = `${LINE_NAMES[k]} · ${now ? "만드는 중" : "아직"}`;
      if (now) row.classList.add("is-now");
    }
  }
}
function setMsg(lines) {
  els.msg.replaceChildren(...lines.map((t) => Object.assign(document.createElement("p"), { textContent: t })));
}
function render(animate = true) {
  const s = st;
  const lineNo = Math.min(s.line, LINES_PER_HEX - 1);
  els.title.textContent = s.stage === "hexDone" ? "여섯 효 완성" : `${LINE_NAMES[lineNo]} 만들기`;
  els.step.textContent = s.stage === "hexDone" ? "6/6 효" : `${lineNo + 1}/6 효 · ${Math.min(s.round, 2) + 1}/3 차례`;
  // 주된 동작 버튼
  const go = els.go, next = els.next;
  const manual = s.stage === "auto" && seq?.manual;
  go.hidden = !["intro", "ready", "moving", "auto"].includes(s.stage) || manual;
  els.stepBtn.hidden = !manual;
  els.stepBtn.disabled = !manual;
  go.disabled = s.stage === "intro" || s.stage === "auto";
  go.textContent = s.stage === "moving" ? "멈춤" : s.stage === "auto" || s.stage === "intro" ? "진행 중…" : "움직이기 시작";
  go.setAttribute("aria-pressed", String(s.stage === "moving"));
  next.hidden = !["lineDone", "hexDone"].includes(s.stage);
  next.textContent = s.stage === "hexDone" ? "괘 보기" : "다음 효";
  // 선택바
  const n = s.work.length;
  if (s.stage === "moving") els.readout.textContent = "두 무더기의 양이 바뀌고 있어요. 원하는 순간에 [멈춤]을 눌러 주세요.";
  else if (s.stage === "ready") {
    els.knob.style.left = `${motionCfg.start * 100}%`;
    els.readout.textContent = `${ORD[s.round]} 차례 · 정시초 ${n}가지를 나눕니다. [움직이기 시작]을 누르고, 원하는 순간에 멈춰 주세요.`;
  } else if (s.stage === "auto" && s.r) {
    els.knob.style.left = `${((s.r.left - minLeft(n, cfg.takeSide)) / Math.max(1, maxLeft(n, cfg.takeSide) - minLeft(n, cfg.takeSide))) * 100}%`;
    els.readout.textContent = `멈췄습니다 · 왼쪽 ${s.r.left} · 오른쪽 ${s.r.right} · 합계 ${s.r.n}`;
  } else els.readout.textContent = "";
  els.knob.parentElement.hidden = !["ready", "moving", "auto"].includes(s.stage);
  els.readout.hidden = !els.readout.textContent; // 효를 마친 뒤에는 빈 줄을 남기지 않는다
  renderBoard();
  paint(animate);
}

// ---- 움직이다 멈추기(배우기와 같은 위치 계산, 시작 자리·방향·빠르기는 고정한 설정) ----
function motionPhase(elapsed) {
  const x = ((elapsed % motionCfg.period) / motionCfg.period + motionCfg.offset) % 1;
  return x < 0.5 ? x * 2 : 2 - x * 2;
}
function motionLeft(n, ph) {
  const lo = minLeft(n, cfg.takeSide), hi = maxLeft(n, cfg.takeSide);
  return Math.round(lo + ph * (hi - lo));
}
function motionFrame(now) {
  motionRaf = null;
  if (st.stage !== "moving") return;
  if (document.hidden) return cancelMotion();
  const ph = motionPhase(now - motionStart);
  els.knob.style.left = `${ph * 100}%`;
  const left = motionLeft(st.work.length, ph);
  if (left !== st.preview) {
    st.preview = left;
    paint(false);
  }
  motionRaf = requestAnimationFrame(motionFrame);
}
function startMotion() {
  if (st.stage !== "ready") return;
  st.stage = "moving";
  st.preview = null;
  motionStart = performance.now();
  render(false);
  els.go.focus();
  motionRaf = requestAnimationFrame(motionFrame);
}
// 화면이 숨겨지면 움직임만 멈춘다. 나누지 않은 상태로 돌아가며, 임의로 나누지 않는다.
function cancelMotion() {
  if (motionRaf) cancelAnimationFrame(motionRaf);
  motionRaf = null;
  if (st?.stage === "moving") {
    st.stage = "ready";
    st.preview = null;
    render(false);
    setMsg(["화면을 떠나 있는 동안 움직임을 멈췄습니다. 나누지는 않았으니 다시 [움직이기 시작]을 눌러 주세요."]);
  }
}
function stopMotion() {
  if (st.stage !== "moving") return;
  if (motionRaf) cancelAnimationFrame(motionRaf);
  motionRaf = null;
  const n = st.work.length;
  const left = motionLeft(n, motionPhase(performance.now() - motionStart)); // 멈춘 순간의 위치 = 나누는 자리(확정)
  st.preview = null;
  runRound(left);
}

// ---- 한 차례 자동 연출: 계산은 멈춘 순간 한 번만 하고, 연출은 그 결과를 차례로 보여 준다 ----
function runRound(left) {
  const r = calcRound(st.work.length, left, cfg.takeSide);
  st.stage = "auto";
  st.r = r;
  st.ids = idsOf(st.work, r);
  const sideName = r.side === "left" ? "하늘 쪽(왼쪽)" : "땅 쪽(오른쪽)";
  const steps = [
    () => { st.sub = "split"; setMsg([`멈춘 자리에서 나눴습니다: 왼쪽(하늘) ${r.left}가지 · 오른쪽(땅) ${r.right}가지.`]); },
    () => { st.sub = "take"; setMsg([`${sideName} 무더기에서 인시초 하나를 덜어 둡니다.`]); },
    () => { st.sub = "countL"; setMsg([`하늘 쪽 ${r.leftRest}가지를 넷씩 셉니다: 정시초 ${r.coreLeft} · 윤시초 ${r.remLeft}.`]); },
    () => { st.sub = "countR"; setMsg([`땅 쪽 ${r.rightRest}가지를 넷씩 셉니다: 정시초 ${r.coreRight} · 윤시초 ${r.remRight}.`]); },
    () => {
      st.sub = "gather";
      st.excluded.push(st.ids.temp, ...st.ids.remLeft, ...st.ids.remRight);
      setMsg([`윤시초와 인시초 ${r.removed}가지(${r.remLeft} + ${r.remRight} + 1)를 윤시초 자리에 모읍니다.`]);
    },
    () => finishRound(),
  ];
  seq = { steps, at: 0, timer: null, token, manual: cfg.pace === "step" };
  render(false);
  advance();
  if (seq?.manual) els.stepBtn.focus();
}
function advance() {
  if (!seq || seq.token !== token) return;
  const step = seq.steps[seq.at++];
  step();
  if (seq && seq.at < seq.steps.length) {
    render();
    if (!seq.manual) seq.timer = setTimeout(advance, STEP_MS); // 빠르게: 자동으로 다음 장면. 단계별: [다음 장면]을 기다린다
  }
}
// 단계별: [다음 장면]. 계산은 이미 멈춘 순간에 정해졌고, 여기서는 다음 장면을 보여 줄 뿐이다.
function nextScene() {
  if (!seq?.manual || st?.stage !== "auto") return;
  advance();
  if (seq?.manual) els.stepBtn.focus();
}
// 화면이 숨겨지면 남은 자동 연출을 바로 끝낸다(결과는 이미 정해져 있어 다시 계산하지 않는다).
// 단계별은 사람이 넘기는 중이므로 그대로 둔다(돌아와서 [다음 장면]으로 이어 간다).
function finishSequenceNow() {
  if (!seq || seq.token !== token || seq.manual) return;
  clearTimeout(seq.timer);
  while (seq && seq.at < seq.steps.length) seq.steps[seq.at++]();
}
function finishRound() {
  const r = st.r;
  st.work = [...st.ids.coreLeft, ...st.ids.coreRight];
  st.rounds.push({ ...r });
  st.r = null; st.ids = null; st.sub = null; seq = null;
  if (st.round < ROUNDS - 1) {
    st.round++;
    st.stage = "ready";
    setMsg([`정시초 ${st.work.length}가지를 다시 모았습니다. ${ORD[st.round]} 차례를 나눠 주세요.`]);
    render();
    return;
  }
  // 세 차례 끝: 효 판정(정시초 산수와 적용 효를 나눠 기록)
  const final = st.work.length;
  const calcValue = lineOf(final).value;
  const value = appliedValue(calcValue, cfg.readingMethod, cfg.yunMapping);
  st.lines.push({ value, calcValue, final, rounds: st.rounds.map((x) => ({ ...x })) });
  const info = lineOf(value * 4);
  const mark = movingMark(value, cfg.symbols);
  const e = explainLine(st.rounds.map((x) => x.removed), final);
  const why = readingText(e, cfg.readingMethod, cfg.yunMapping, cfg.symbols);
  const k = st.lines.length - 1;
  setMsg([
    headlineFor(value, cfg.readingMethod, cfg.yunMapping),
    `${LINE_NAMES[k]}는 ${lineLabel(value, cfg.readingMethod, cfg.yunMapping)}(${info.desc})${mark ? ` ${mark} · 변효` : ""}입니다.`,
    cfg.readingMethod === "yun" ? why[3] : why[2].replace(/ \([^()]*\)$/, ""), // 끝의 '(홀=…·… 방식)'만 뺀다(위 설정 줄에 이미 있음)
  ]);
  st.stage = st.lines.length === LINES_PER_HEX ? "hexDone" : "lineDone";
  render();
  els.next.focus();
}
function nextLine() {
  if (st.stage === "hexDone") return showResult();
  if (st.stage !== "lineDone") return;
  // 태시초는 그대로 두고, 나머지 마흔아홉 가지를 다시 모아 다음 효를 시작한다.
  st.line++;
  st.round = 0;
  st.rounds = [];
  st.excluded = [];
  st.work = [...Array(WORK).keys()];
  st.stage = "ready";
  setMsg([`태시초는 그대로 두고, 나머지 ${WORK}가지를 다시 모았습니다. ${LINE_NAMES[st.line]}의 첫째 차례를 나눠 주세요.`]);
  render();
  els.go.focus();
}

// ---- 결과 ----
function hexagramsOf(values) {
  const types = values.map((v) => lineTypeFromYangCount(YANG_COUNT[v]));
  const pLines = primaryLines(types), cLines = changedLines(types);
  return { types, pLines, cLines, moving: changingPositions(types), primary: findHexagram(data, pLines), changed: findHexagram(data, cLines) };
}
function hexBlock(title, h, linesArr, values) {
  const wrap = document.createElement("figure");
  wrap.className = "result-hex";
  const bars = document.createElement("div");
  bars.className = "result-bars";
  bars.setAttribute("aria-hidden", "true");
  for (let k = LINES_PER_HEX - 1; k >= 0; k--) {
    const row = document.createElement("div");
    row.className = `result-bar ${linesArr[k] ? "is-yang" : "is-yin"}`;
    const mark = document.createElement("span");
    mark.className = "result-mark";
    if (values) mark.textContent = movingMark(values[k], cfg.symbols);
    const bar = document.createElement("span");
    bar.className = "result-line";
    row.append(bar, mark);
    bars.appendChild(row);
  }
  const cap = document.createElement("figcaption");
  const label = document.createElement("span");
  label.className = "result-kind";
  label.textContent = title;
  const nm = document.createElement("span");
  nm.className = "result-name";
  nm.textContent = h ? `제${h.number}괘 ${h.titleKo} ${h.title}` : "";
  cap.append(label, nm);
  wrap.append(bars, cap);
  wrap.setAttribute("aria-label", `${title}: ${nm.textContent}`);
  return wrap;
}
async function ensureData() {
  if (data) return true;
  try {
    data = await fetchJson("../../data/hexagrams.json");
    return true;
  } catch {
    return false;
  }
}
async function showResult() {
  if (st.stage !== "hexDone") return;
  const my = token;
  els.next.disabled = true;
  const ok = await ensureData();
  els.next.disabled = false;
  if (my !== token) return;
  if (!ok) {
    els.dataError.hidden = false;
    return;
  }
  els.dataError.hidden = true;
  const values = st.lines.map((l) => l.value);
  const r = hexagramsOf(values);
  els.hexes.replaceChildren(hexBlock("본괘", r.primary, r.pLines, values));
  if (r.moving.length) els.hexes.appendChild(hexBlock("지괘", r.changed, r.cLines, null));
  els.hexes.classList.toggle("no-change", !r.moving.length);
  els.moving.textContent = r.moving.length
    ? `변효 ${r.moving.length}개: ${r.moving.map((i) => `${lineName(i, r.types[i].yang)}(${LINE_NAMES[i]}, ${r.types[i].name} ${movingMark(values[i], cfg.symbols)})`).join(", ")}. 변효를 뒤집어 지괘를 얻었습니다.`
    : "변효가 없어 본괘와 지괘가 같습니다.";
  els.list.replaceChildren(...[...st.lines.keys()].reverse().map((k) => {
    const ln = st.lines[k], l = lineOf(ln.value * 4), mark = movingMark(ln.value, cfg.symbols);
    return Object.assign(document.createElement("li"), { textContent: `${LINE_NAMES[k]}: ${lineLabel(ln.value, cfg.readingMethod, cfg.yunMapping)}(${l.desc})${mark ? " " + mark : ""}` });
  }));
  const t = settingsText(cfg);
  els.how.textContent = `이번 괘의 방식: 하나를 덜어 내는 쪽 — ${t.side} · ${t.pace} · 효 읽기 — ${criterionText(cfg.readingMethod, cfg.yunMapping)} · 변효 기호 ${t.symbols} · 나누기 ${t.motion}`;
  renderProcess();
  els.cast.hidden = true;
  els.result.hidden = false;
  $("result-title").focus();
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  textLoader.renderTexts(els.texts, { primary: r.primary, changed: r.changed, types: r.types, moving: r.moving, isCurrent: () => my === token });
}
// [과정 보기]: 효마다 세 차례 기록과 적용 기준
function renderProcess() {
  const box = els.process;
  box.replaceChildren(Object.assign(document.createElement("p"), { className: "process-criterion", textContent: `적용 기준: ${criterionText(cfg.readingMethod, cfg.yunMapping)} · 변효 기호 ${SYMBOL_LABELS[cfg.symbols]}` }));
  for (let k = LINES_PER_HEX - 1; k >= 0; k--) {
    const ln = st.lines[k];
    const item = document.createElement("div");
    item.className = "process-line";
    const h = document.createElement("h4");
    const mark = movingMark(ln.value, cfg.symbols);
    h.textContent = `${LINE_NAMES[k]} → ${lineLabel(ln.value, cfg.readingMethod, cfg.yunMapping)}${mark ? " " + mark : ""}`;
    const ol = document.createElement("ol");
    let n = WORK;
    ln.rounds.forEach((r, i) => {
      ol.append(Object.assign(document.createElement("li"), {
        textContent: `${ORD[i]} 차례: 정시초 ${n} → 왼쪽 ${r.left} · 오른쪽 ${r.right} → 인시초 1 · 윤시초 ${r.remLeft} + ${r.remRight} → 모은 수 ${r.removed} → 남은 정시초 ${r.next}`,
      }));
      n = r.next;
    });
    const e = explainLine(ln.rounds.map((r) => r.removed), ln.final);
    const p = Object.assign(document.createElement("p"), { textContent: readingText(e, cfg.readingMethod, cfg.yunMapping, cfg.symbols).join(" ") });
    item.append(h, ol, p);
    box.append(item);
  }
}

// ---- 시작·처음부터 ----
function begin() {
  token++;
  cancelTimers();
  cfg = { ...loadSettings() }; // 이번 괘 동안 고정
  motionCfg = motionConfig(cfg);
  st = fresh();
  const t = settingsText(cfg);
  els.fixed.textContent = `${t.side} · ${t.pace} · ${t.reading} · 변효 기호 ${t.symbols}`;
  els.setup.hidden = true;
  els.result.hidden = true;
  els.cast.hidden = false;
  els.dataError.hidden = true;
  els.texts.replaceChildren();
  setMsg([`시초 ${TOTAL}가지를 펼쳤습니다.`]);
  render(false);
  els.title.focus();
  // 쉰 가지 중 하나를 태시초로 따로 두고 마흔아홉 가지로 시작한다.
  const my = token;
  setTimeout(() => {
    if (my !== token) return;
    st.aside = true;
    st.stage = "ready";
    setMsg([`하나를 태시초로 따로 두고, 정시초 ${WORK}가지로 시작합니다.`, `${LINE_NAMES[0]}의 첫째 차례: [움직이기 시작]을 누르고, 원하는 순간에 [멈춤]을 눌러 나눕니다.`]);
    render();
  }, STEP_MS);
}
function cancelTimers() {
  if (seq) clearTimeout(seq.timer);
  seq = null;
  if (motionRaf) cancelAnimationFrame(motionRaf);
  motionRaf = null;
}
function toSetup() {
  token++;
  cancelTimers();
  st = null;
  els.cast.hidden = true;
  els.result.hidden = true;
  els.setup.hidden = false;
  els.texts.replaceChildren();
  renderSetup();
  els.start.focus();
}
function askRestart() {
  // 확인 중에는 선택바를 멈춘다(나누지 않음). 남은 연출은 바로 끝낸다.
  cancelMotion();
  finishSequenceNow();
  if (typeof els.confirm.showModal === "function") els.confirm.showModal();
  else if (window.confirm("처음부터 다시 할까요? 지금까지 만든 효가 모두 지워집니다.")) toSetup();
}

// ---- 이벤트 ----
els.start.addEventListener("click", begin);
els.go.addEventListener("click", () => (st?.stage === "moving" ? stopMotion() : startMotion()));
els.next.addEventListener("click", nextLine);
els.stepBtn.addEventListener("click", nextScene);
els.restart.addEventListener("click", askRestart);
els.again.addEventListener("click", toSetup);
els.confirmNo.addEventListener("click", () => els.confirm.close());
els.confirmYes.addEventListener("click", () => { els.confirm.close(); toSetup(); });
$("data-retry").addEventListener("click", () => showResult());
document.addEventListener("visibilitychange", () => {
  if (!document.hidden || !st) return;
  cancelMotion();
  finishSequenceNow();
});
window.addEventListener("pageshow", () => { if (!els.setup.hidden) renderSetup(); });
window.addEventListener("storage", () => { if (!els.setup.hidden) renderSetup(); });

buildField();
renderSetup();
ensureData();
