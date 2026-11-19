// 시초점 배우기 2차: 장면 1~4(자리 펴기 → 쉰 가지 → 처음의 하나 따로 두기 → 마흔아홉 가지 나누기).
// 하나 덜기·넷씩 세기·효 만들기는 아직 없다. 실제 점을 치지 않는다.
import { SCENES, NOTICE } from "./261119_2027_scenes-ko_Laude.js";

const TOTAL = 50;
const WORK = TOTAL - 1; // 처음의 하나를 따로 둔 뒤 작업할 가지 수
const MIN_LEFT = 1; // 오른쪽에 최소 2가지가 남도록 왼쪽은 1..WORK-2
const MAX_LEFT = WORK - 2;
const EXAMPLE_LEFT = 24;
const SVGNS = "http://www.w3.org/2000/svg";
const STALK_LEN = 116;

const $ = (id) => document.getElementById(id);
const els = {
  svg: $("field"),
  title: $("scene-title"),
  step: $("scene-step"),
  story: $("story"),
  counts: $("counts"),
  action: $("action"),
  panel: $("split-panel"),
  range: $("split-range"),
  readout: $("split-readout"),
  example: $("split-example"),
  minus: $("split-minus"),
  plus: $("split-plus"),
  confirm: $("split-confirm"),
  prev: $("prev"),
  replay: $("replay"),
  next: $("next"),
  notice: $("notice"),
  endLinks: $("end-links"),
};

// 학습 상태. 화면은 언제나 이 값으로만 다시 그린다(그리기가 상태를 바꾸지 않는다).
let state = { scene: 0, aside: false, split: null, preview: null, panel: false };
let entry = clone(state); // 현재 장면에 들어올 때의 상태
const history = []; // [이전]용: 지나온 장면에 들어올 때의 상태
let busy = false; // 확정 동작 연타 막기

function clone(s) {
  return JSON.parse(JSON.stringify(s));
}

// ---- 그림 ----
const stalks = [];
function buildField() {
  const zone = document.createElementNS(SVGNS, "g");
  zone.setAttribute("class", "zones");
  zone.innerHTML =
    '<line x1="16" y1="50" x2="344" y2="50" class="zone-line"/>' +
    '<text x="20" y="34" class="zone-label">처음 따로 둔 것</text>' +
    '<text x="20" y="72" class="zone-label">작업하는 자리</text>' +
    '<text id="lbl-left" x="100" y="226" class="pile-label" text-anchor="middle"></text>' +
    '<text id="lbl-right" x="260" y="226" class="pile-label" text-anchor="middle"></text>';
  els.svg.appendChild(zone);
  const layer = document.createElementNS(SVGNS, "g");
  els.svg.appendChild(layer);
  for (let i = 0; i < TOTAL; i++) {
    const line = document.createElementNS(SVGNS, "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", String(-STALK_LEN / 2)); // 가운데를 축으로 살짝 기울인다
    line.setAttribute("x2", "0");
    line.setAttribute("y2", String(STALK_LEN / 2));
    line.setAttribute("class", i === TOTAL - 1 ? "stalk stalk-aside" : "stalk");
    layer.appendChild(line);
    stalks.push(line);
  }
}

// 가지 하나의 자리: 묶음은 가운데에 촘촘히, 무더기는 왼쪽·오른쪽에, 따로 둔 것은 위 칸에 눕혀 둔다.
const tilt = (k) => (((k * 37) % 7) - 3) * 0.3;
function spread(cx, k, n, width) {
  const w = Math.min(2.1, width / Math.max(n, 1));
  return cx + (k - (n - 1) / 2) * w;
}
function layout(view) {
  const out = [];
  for (let i = 0; i < TOTAL; i++) {
    const isAside = i === TOTAL - 1;
    let p;
    if (view.mode === "hidden") p = { x: 180, y: 146, r: 0, o: 0 };
    else if (view.mode === "scatter") p = { x: 40 + ((i * 53) % 280), y: 128 + ((i * 29) % 40), r: ((i * 41) % 60) - 30, o: 1 };
    else if (isAside && view.aside) p = { x: 272, y: 28, r: 90, o: 1 };
    else if (view.mode === "bundle") {
      const n = view.aside ? WORK : TOTAL;
      p = { x: spread(180, i, n, 110), y: 146, r: tilt(i), o: 1 };
    } else {
      const left = view.left;
      if (i < left) p = { x: spread(100, i, left, 120), y: 146, r: tilt(i), o: 1 };
      else p = { x: spread(260, i - left, WORK - left, 120), y: 146, r: tilt(i), o: 1 };
    }
    out.push(p);
  }
  return out;
}
function paint(view, animate = true) {
  const pos = layout(view);
  stalks.forEach((s, i) => {
    s.classList.toggle("no-anim", !animate);
    s.style.transform = `translate(${pos[i].x}px, ${pos[i].y}px) rotate(${pos[i].r}deg)`;
    s.style.opacity = String(pos[i].o);
  });
  const piles = view.mode === "piles";
  $("lbl-left").textContent = piles ? `왼쪽 ${view.left}` : "";
  $("lbl-right").textContent = piles ? `오른쪽 ${WORK - view.left}` : "";
  els.svg.setAttribute("aria-label", describe(view));
}
function describe(view) {
  if (view.mode === "hidden") return "펼쳐 놓은 천. 아직 시초가 없습니다.";
  if (view.mode === "piles") return `처음 따로 둔 시초 1가지, 왼쪽 무더기 ${view.left}가지, 오른쪽 무더기 ${WORK - view.left}가지.`;
  if (view.aside) return `처음 따로 둔 시초 1가지와 작업할 시초 ${WORK}가지 묶음.`;
  return `시초 ${TOTAL}가지 묶음.`;
}
function viewOf(s) {
  if (s.scene === 0) return { mode: "hidden" };
  if (s.scene >= 3 && (s.split || s.preview)) return { mode: "piles", aside: true, left: s.split ?? s.preview };
  return { mode: "bundle", aside: s.aside };
}
// [다시 보기]: 장면 직전 모습에서 지금 모습으로 한 번 더 움직여 보여 준다(상태는 그대로).
function priorViewOf(s) {
  if (s.scene === 1) return { mode: "scatter" };
  if (s.scene === 2) return { mode: "bundle", aside: false };
  if (s.scene >= 3) return { mode: "bundle", aside: true };
  return { mode: "hidden" };
}

// ---- 글과 버튼 ----
function countsText(s) {
  if (s.scene === 0) return "";
  if (s.scene >= 3 && s.split) return `처음 따로 둔 것 1 · 왼쪽 ${s.split} · 오른쪽 ${WORK - s.split} · 모두 ${TOTAL}`;
  if (s.aside) return `처음 따로 둔 것 1 · 작업할 시초 ${WORK} · 모두 ${TOTAL}`;
  return `시초 ${TOTAL}가지`;
}
function render(animate = true) {
  const scene = SCENES[state.scene];
  els.step.textContent = `${state.scene + 1} / ${SCENES.length}`;
  els.title.textContent = scene.title;
  const lines = state.scene === 2 && state.aside ? scene.done : scene.text;
  els.story.innerHTML = "";
  for (const t of lines) {
    const p = document.createElement("p");
    p.textContent = t;
    els.story.appendChild(p);
  }
  els.counts.textContent = countsText(state);
  els.counts.hidden = state.scene === 0;

  // 장면마다 동작 버튼 하나
  if (state.scene === 2) {
    els.action.hidden = false;
    els.action.textContent = "하나 따로 두기";
    els.action.disabled = state.aside;
  } else if (state.scene === 3) {
    els.action.hidden = state.panel;
    els.action.textContent = "나누기 조절";
    els.action.disabled = false;
  } else els.action.hidden = true;

  els.panel.hidden = !(state.scene === 3 && state.panel);
  if (!els.panel.hidden) updateReadout();

  els.prev.disabled = history.length === 0;
  els.replay.disabled = state.scene === 0;
  els.next.hidden = state.scene >= 3;
  els.next.disabled = state.scene === 2 && !state.aside;
  els.next.textContent = state.scene === 0 ? "배우기 시작" : "다음";
  els.endLinks.hidden = state.scene !== 4;

  paint(viewOf(state), animate);
}
function updateReadout() {
  const left = state.preview;
  els.range.value = String(left);
  els.range.setAttribute("aria-valuetext", `왼쪽 ${left}가지, 오른쪽 ${WORK - left}가지`);
  els.readout.textContent = `왼쪽 ${left} · 오른쪽 ${WORK - left} · 합계 ${WORK}`;
  els.minus.disabled = left <= MIN_LEFT;
  els.plus.disabled = left >= MAX_LEFT;
}

// ---- 동작 ----
function goTo(nextState) {
  history.push(entry);
  state = nextState;
  entry = clone(state);
  render();
  els.title.focus();
}
function next() {
  if (state.scene >= 3) return;
  if (state.scene === 2 && !state.aside) return;
  goTo({ ...clone(state), scene: state.scene + 1, panel: false });
}
function prev() {
  if (!history.length) return;
  state = history.pop();
  entry = clone(state);
  render();
  els.title.focus();
}
function setAside() {
  if (state.scene !== 2 || state.aside) return; // 여러 번 눌러도 한 번만
  state.aside = true;
  render();
}
function openPanel() {
  if (state.scene !== 3 || state.panel) return;
  state.panel = true;
  // 자유 나누기: 처음 손이 가는 자리를 정해 두지 않으려고 가운데 근처 아무 곳에서 시작한다.
  if (state.preview == null) state.preview = 10 + Math.floor(Math.random() * 30);
  render();
  els.range.focus();
}
function setPreview(left) {
  const v = Math.min(MAX_LEFT, Math.max(MIN_LEFT, Math.round(Number(left))));
  if (!Number.isFinite(v)) return;
  state.preview = v;
  updateReadout();
  paint(viewOf(state));
}
function confirmSplit() {
  if (state.scene !== 3 || state.split || busy) return;
  const left = state.preview;
  if (!Number.isInteger(left) || left < MIN_LEFT || left > MAX_LEFT) return;
  busy = true;
  const done = { ...clone(state), split: left, panel: false, scene: 4 };
  history.push(entry);
  state = done;
  entry = clone(state);
  render();
  els.title.focus();
  busy = false;
}
function replay() {
  if (state.scene === 0) return;
  paint(priorViewOf(state), false);
  void els.svg.getBoundingClientRect(); // 직전 모습을 먼저 그리게 한다
  requestAnimationFrame(() => requestAnimationFrame(() => paint(viewOf(state), true)));
  els.story.focus();
}

// ---- 연결 ----
buildField();
els.notice.textContent = NOTICE;
els.next.addEventListener("click", next);
els.prev.addEventListener("click", prev);
els.replay.addEventListener("click", replay);
els.action.addEventListener("click", () => (state.scene === 2 ? setAside() : openPanel()));
els.svg.addEventListener("click", () => (state.scene === 2 ? setAside() : state.scene === 3 && !state.split ? openPanel() : null));
els.range.min = String(MIN_LEFT);
els.range.max = String(MAX_LEFT);
els.range.addEventListener("input", () => setPreview(els.range.value));
els.minus.addEventListener("click", () => setPreview(state.preview - 1));
els.plus.addEventListener("click", () => setPreview(state.preview + 1));
els.example.addEventListener("click", () => setPreview(EXAMPLE_LEFT));
els.confirm.addEventListener("click", confirmSplit);
render(false);
