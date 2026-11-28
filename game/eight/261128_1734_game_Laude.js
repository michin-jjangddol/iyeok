// 261128_1734 LAUDE: 원본 261128_1731_game_Laude.js. 노음 보너스로 상대 말이 3칸 뒤로 밀리는 움직임(JJDD).
// 261128_1731 LAUDE: 원본 261128_1722_game_Laude.js. 인에 딱 맞지 않으면 갔다가 되돌아오는 움직임(JJDD).
// 261128_1722 LAUDE: 원본 261128_1705_game_Laude.js. 건 위·곤 아래 배치, 목표 = 반대쪽 인(JJDD).
// 261128_1705 LAUDE: 8괘 1단 게임 화면. 규칙 계산은 261128_1705_rules_Laude.js.
//   모드: 혼자 / 컴퓨터와 / 둘이서. 가위바위보로 이긴 사람이 땅(곤)·하늘(건) 출발을 고르고 먼저 던진다.
//   설정(모드·판 길이·말 잡기)은 이 브라우저에만 저장한다.
import { ORDER, CODE, RESULT_NAME, STEP, newGame, play, sideInfo } from "./261128_1734_rules_Laude.js";

const $ = (id) => document.getElementById(id);
const span = (text, cls = "") => Object.assign(document.createElement("span"), { textContent: text, className: cls });
const NAMES = { kun: ["곤", "땅"], zhen: ["진", "우레"], kan: ["감", "물"], dui: ["태", "못"], gen: ["간", "산"], li: ["리", "불"], xun: ["손", "바람"], qian: ["건", "하늘"] };
const COLORS = { kun: "#c9a36b", zhen: "#e6b422", kan: "#3b6fb6", dui: "#4fb3a9", gen: "#9a7b5b", li: "#e0673f", xun: "#7bbf6a", qian: "#6fa8dc" };
const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));

// ---- 설정 ----
const KEY = "iyeok.game8.v1";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = (o) => { try { localStorage.setItem(KEY, JSON.stringify({ ...load(), ...o })); } catch { /* 저장 못 해도 놀이는 된다 */ } };
const form = $("game-setup");
function readSetup() {
  const f = new FormData(form);
  return { mode: f.get("mode") || "cpu", len: f.get("len") || "normal", capture: f.get("capture") === "on" };
}
(function restore() {
  const s = load();
  for (const [name, val] of [["mode", s.mode], ["len", s.len]]) if (val) { const r = form.querySelector(`input[name="${name}"][value="${val}"]`); if (r) r.checked = true; }
  if (s.capture === false) form.querySelector('input[name="capture"]').checked = false;
})();

// ---- 동전 (시험용: window.__iyeokGameRig 에 [앞뒤,앞뒤,앞뒤] 목록을 넣으면 그 순서대로) ----
function throwCoins() {
  const rig = window.__iyeokGameRig;
  if (Array.isArray(rig) && rig.length) return rig.shift();
  return [0, 1, 2].map(() => Math.random() < 0.5);
}

// ---- 화면 단계 ----
const show = (id) => { for (const s of document.querySelectorAll(".g-step")) s.hidden = s.id !== id; };
let state = null, players = [], busy = false;
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const s = readSetup();
  save(s);
  if (s.mode === "solo") { players = [{ name: "나", kind: "human", label: "1" }]; askSide(0); }
  else {
    players = s.mode === "cpu" ? [{ name: "나", kind: "human", label: "1" }, { name: "컴퓨터", kind: "cpu", label: "2" }] : [{ name: "1번", kind: "human", label: "1" }, { name: "2번", kind: "human", label: "2" }];
    startRps();
  }
});

// 가위바위보: 1번(나) → 2번(사람 또는 컴퓨터)
const RPS = ["가위", "바위", "보"];
let rpsPick = [];
function startRps() {
  rpsPick = [];
  show("step-rps");
  rpsPrompt();
}
function rpsPrompt() {
  const who = rpsPick.length, p = players[who];
  $("rps-who").replaceChildren(span(p.name, "g-name"), " ", span("가위바위보를 고르세요."));
  $("rps-result").replaceChildren();
  $("rps-buttons").hidden = false;
}
for (const b of document.querySelectorAll("[data-rps]")) b.addEventListener("click", async () => {
  rpsPick.push(Number(b.dataset.rps));
  if (rpsPick.length === 1 && players[1].kind === "cpu") rpsPick.push(Math.floor(Math.random() * 3));
  if (rpsPick.length < 2) { rpsPrompt(); return; }
  $("rps-buttons").hidden = true;
  const [a, c] = rpsPick, out = $("rps-result");
  out.replaceChildren(span(players[0].name, "g-name"), " ", span(RPS[a]), " · ", span(players[1].name, "g-name"), " ", span(RPS[c]), " → ");
  if (a === c) { out.append(span("비겼어요. 다시!")); rpsPick = []; await sleep(900); rpsPrompt(); return; }
  const winner = (a - c + 3) % 3 === 1 ? 0 : 1; // 바위(1)가 가위(0)를, 보(2)가 바위를 이긴다
  out.append(span(players[winner].name, "g-name"), " ", span("승리!"));
  await sleep(900);
  askSide(winner);
});

// 출발 고르기: 이긴 사람이 땅·하늘 중 고르고 먼저 던진다(컴퓨터는 무작위)
let chooser = 0;
function askSide(who) {
  chooser = who;
  show("step-side");
  $("side-who").replaceChildren(span(players[who].name, "g-name"), " ", span("출발할 곳을 고르세요."));
  if (players[who].kind === "cpu") { $("side-buttons").hidden = true; setTimeout(() => begin(Math.random() < 0.5 ? "earth" : "heaven"), 700); }
  else $("side-buttons").hidden = false;
}
for (const b of document.querySelectorAll("[data-side]")) b.addEventListener("click", () => begin(b.dataset.side));
function begin(side) {
  const s = readSetup();
  const ordered = [chooser, ...players.keys()].filter((v, i, a) => a.indexOf(v) === i); // 고른 사람이 먼저
  const ps = ordered.map((i, n) => ({ ...players[i], side: n === 0 ? side : side === "earth" ? "heaven" : "earth" }));
  state = newGame({ players: ps, len: s.len, capture: s.capture });
  $("game-log").replaceChildren();
  show("step-play");
  drawBoard();
  coinsView(null);
  $("game-result").replaceChildren();
  nextTurn();
}

// ---- 말판 그리기(뱀길) ----
const NS = "http://www.w3.org/2000/svg";
const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p?.append(e); return e; };
const COLS = 9, G = 40, PADX = 26, ROWH = 66, TOP = 30;
// 261128_1722: 건이 위, 곤이 아래(JJDD). 하늘 쪽 인은 건 바로 위, 땅 쪽 인은 곤 바로 아래.
let BN = 0;
const snake = (t) => { const r = Math.floor(t / COLS), c = t % COLS; return [r, r % 2 === 0 ? c : COLS - 1 - c]; };
function spot(pos) { // 자리 -1..N+1 → 화면 좌표
  let r, c;
  if (pos === BN + 1) { [, c] = snake(0); r = -1; } // 하늘 쪽 인
  else if (pos === -1) { [r, c] = snake(BN); r += 1; } // 땅 쪽 인
  else [r, c] = snake(BN - pos); // 건(자리 N) 부터 곤(자리 0) 까지 위에서 아래로
  return [PADX + c * G + G / 2, TOP + (r + 1) * ROWH + G / 2];
}
let shown = [];
function drawBoard() {
  const b = state.board;
  BN = b.N;
  const rows = Math.ceil((b.N + 1) / COLS) + 2;
  const W = PADX * 2 + COLS * G, H = TOP + rows * ROWH - 8;
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "g-board-svg", role: "img", "aria-labelledby": "board-title" });
  const pts = Array.from({ length: b.N + 3 }, (_, i) => spot(b.N + 1 - i)); // 위(하늘 쪽 인) → 아래(땅 쪽 인)
  el("polyline", { points: pts.map((p) => p.join(",")).join(" "), class: "g-path" }, svg);
  for (let pos = -1; pos <= b.N + 1; pos++) {
    const [x, y] = spot(pos), c = b.cells[pos];
    if (pos === -1 || pos === b.N + 1) {
      el("circle", { cx: x, cy: y, r: 15, class: "g-in" }, svg);
      el("text", { x, y: y + 5, class: "g-in-text", "text-anchor": "middle" }, svg).textContent = "인";
    } else if (c.station) {
      el("circle", { cx: x, cy: y, r: 16, fill: COLORS[c.station], class: "g-station" }, svg);
      [...CODE[c.station]].forEach((bit, j) => {
        const yy = y - 8 + j * 5.6;
        if (bit === "1") el("rect", { x: x - 9, y: yy, width: 18, height: 3.4, class: "g-bar" }, svg);
        else for (const xx of [x - 9, x + 1.6]) el("rect", { x: xx, y: yy, width: 7.4, height: 3.4, class: "g-bar" }, svg);
      });
      const t = el("text", { x, y: y - 21, class: "g-st-name", "text-anchor": "middle" }, svg);
      t.append(el("tspan", {}), " ", el("tspan", {}));
      t.children[0].textContent = NAMES[c.station][0];
      t.children[1].textContent = NAMES[c.station][1];
    } else el("circle", { cx: x, cy: y, r: c.stone === 3 ? 5.5 : 4.5, class: `g-stone d${c.stone}` }, svg);
  }
  const tokens = el("g", { class: "g-tokens" }, svg);
  $("game-board").replaceChildren(svg);
  shown = state.players.map((p) => p.pos);
  drawTokens(tokens);
}
function drawTokens(g = document.querySelector(".g-tokens")) {
  if (!g) return;
  g.replaceChildren();
  shown.forEach((pos, i) => {
    const same = shown.filter((q) => q === pos).length > 1, [x, y] = spot(pos), dx = same ? (i === 0 ? -8 : 8) : 0;
    const P = state.players[i];
    const t = el("g", { class: `g-token c${P.label}${state.turn === i && state.winner === null ? " is-turn" : ""}`, "data-who": i, transform: `translate(${x + dx} ${y + 22})` }, g);
    el("circle", { r: 9 }, t);
    el("text", { y: 4, "text-anchor": "middle" }, t).textContent = P.label;
  });
  // 말 위치(시험·화면 읽기용)
  $("game-board").dataset.pos = shown.join(",");
}
async function animate(who, from, to, jump) {
  if (jump) {
    $("game-board").classList.add("is-door");
    await sleep(380);
    shown[who] = to; drawTokens();
    await sleep(380);
    $("game-board").classList.remove("is-door");
    return;
  }
  const step = to > from ? 1 : -1;
  for (let p = from; p !== to; p += step) { shown[who] = p + step; drawTokens(); await sleep(140); }
}

// ---- 동전·결과 보이기 ----
function coinsView(coins) {
  const box = $("game-coins");
  box.replaceChildren(...[0, 1, 2].map((i) => {
    const c = Object.assign(document.createElement("span"), { className: `g-coin${coins ? (coins[i] ? " is-head" : " is-tail") : ""}` });
    c.textContent = coins ? (coins[i] ? "3" : "2") : "?";
    return c;
  }));
}
const ACTION = { youngYang: "앞으로 1칸", youngYin: "앞으로 2칸", oldYang: "앞으로 3칸", oldYin: "뒤로 3칸" };
function logLine(...parts) {
  const li = document.createElement("li");
  li.append(...parts);
  const log = $("game-log");
  log.prepend(li);
  while (log.children.length > 8) log.lastChild.remove();
}

// ---- 차례 ----
function nextTurn() {
  const me = state.players[state.turn];
  drawTokens();
  $("game-turn").replaceChildren(span("차례:"), " ", span(me.name, `g-name c${me.label}`));
  const btn = $("game-throw");
  btn.textContent = state.phase === "bonus" ? "한 번 더 던지기" : "동전 던지기";
  btn.hidden = state.winner !== null;
  btn.disabled = me.kind === "cpu";
  if (me.kind === "cpu" && state.winner === null) setTimeout(turn, 800);
}
async function turn() {
  if (busy || state.winner !== null) return;
  busy = true;
  $("game-throw").disabled = true;
  const coins = throwCoins();
  const before = state.players.map((p) => p.pos);
  const events = play(state, coins);
  const out = $("game-result");
  out.replaceChildren();
  for (const e of events) {
    const name = span(state.players[e.who]?.name ?? "", `g-name c${state.players[e.who]?.label}`);
    if (e.type === "throw") {
      coinsView(e.coins);
      const bonus = e.phase === "bonus";
      out.append(span(RESULT_NAME[e.result], "g-result-name"), " — ", span(bonus && e.result === "oldYang" ? "반대괘로 점프!" : bonus && e.result === "oldYin" ? "상대 말을 3칸 뒤로!" : bonus ? (STEP[e.result] === 1 ? "앞으로 1칸" : "앞으로 2칸") : ACTION[e.result]));
      logLine(name, " ", span(RESULT_NAME[e.result]));
      await sleep(350);
    } else if (e.type === "push") {
      const victim = () => span(state.players[e.victim].name, `g-name c${state.players[e.victim].label}`); // 결과 줄·기록에 따로
      await animate(e.victim, before[e.victim], e.to, false);
      before[e.victim] = e.to;
      out.append(" ", victim(), " ", span("말이 뒤로 밀려납니다!", "g-bad"));
      logLine(name, " ", span("노음!"), " ", victim(), " ", span("말이 뒤로 밀려납니다!"));
    } else if (e.type === "push-none") {
      out.append(" ", span("혼자라서 밀 상대가 없어요."));
    } else if (e.type === "bounce") {
      // 인까지 갔다가 넘친 만큼 되돌아오기
      await animate(e.who, before[e.who], e.via, false);
      before[e.who] = e.via;
      out.append(" ", span("인에는 딱 맞게! 넘친 만큼 되돌아갑니다.", "g-bonus"));
      logLine(name, " ", span("인에는 딱 맞게! 넘친 만큼 되돌아갑니다."));
    } else if (e.type === "move") {
      await animate(e.who, before[e.who], e.to, false);
      before[e.who] = e.to;
    } else if (e.type === "clamp") {
      logLine(name, " ", span("출발점이라 더 뒤로 못 갑니다."));
    } else if (e.type === "door") {
      const msg = e.good ? "징—! 인생역전!" : "징—! 망했다!";
      out.append(" ", span(msg, e.good ? "g-good" : "g-bad"));
      logLine(name, " ", span(msg, e.good ? "g-good" : "g-bad"));
    } else if (e.type === "jump") {
      await animate(e.who, before[e.who], e.to, true);
      before[e.who] = e.to;
    } else if (e.type === "capture") {
      shown[e.victim] = e.to;
      before[e.victim] = e.to;
      drawTokens();
      const victim = () => span(state.players[e.victim].name, `g-name c${state.players[e.victim].label}`);
      out.append(" ", span("잡았다!", "g-good"), " ", victim(), " ", span("출발점으로 돌아갑니다."));
      logLine(name, " ", span("잡았다!", "g-good"), " ", victim(), " ", span("출발점으로 돌아갑니다."));
    } else if (e.type === "bonus") {
      out.append(" ", span("8괘 자리! 한 번 더 던지세요.", "g-bonus"));
    } else if (e.type === "win") {
      finish(e.who);
    }
  }
  busy = false;
  if (state.winner === null) nextTurn();
}
$("game-throw").addEventListener("click", turn);

function finish(who) {
  const p = state.players[who], box = $("game-win");
  box.replaceChildren();
  if (state.players.length === 1) {
    const best = load().best?.[state.board.len];
    box.append(span("도착!"), " ", span("던진 횟수"), " ", span(String(p.throws), "g-num"));
    if (!best || p.throws < best) { save({ best: { ...(load().best || {}), [state.board.len]: p.throws } }); box.append(" · ", span("새 최고 기록!", "g-good")); }
    else box.append(" · ", span("최고 기록"), " ", span(String(best), "g-num"));
  } else box.append(span(p.name, `g-name c${p.label}`), " ", span("승리!"), " 🎉");
  box.hidden = false;
  $("game-throw").hidden = true;
  $("game-turn").replaceChildren(span("끝!"));
  $("game-board").dataset.winner = String(who);
  drawTokens();
}
for (const b of document.querySelectorAll("[data-again]")) b.addEventListener("click", () => {
  $("game-win").hidden = true;
  if (b.dataset.again === "same" && state) {
    const s = readSetup();
    state = newGame({ players: state.players.map((p) => ({ name: p.name, kind: p.kind, label: p.label, side: p.side })), len: s.len, capture: s.capture });
    $("game-log").replaceChildren();
    $("game-result").replaceChildren();
    coinsView(null);
    show("step-play");
    drawBoard();
    nextTurn();
  } else { state = null; show("step-setup"); }
});
show("step-setup");
