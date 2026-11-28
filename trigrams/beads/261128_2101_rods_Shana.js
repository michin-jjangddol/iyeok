// 261128_2101 SHANA: x 음수 면(곤·진·감·태)이 앞에 보이는 초기 시점.
// 261128_2032 SHANA: 이진수 왼쪽부터 x·y·z, 1은 +1, 0은 −1.
import { positionFromCode, BASE_VIEW } from "./261128_2101_coordinates_Shana.mjs";
// 261127_0708 LAUDE: 원본 261126_2242_rods_Laude.js. 길이 눈금을 배율 눈금으로(×0.2 ~ ×1 가운데 ~ ×5), 반대 짝이 맞닿으면 알림(견우와 직녀, JJDD).
// 261126_2242 LAUDE: 원본 261126_2206_rods_Laude.js. 반대 짝 막대 4개(건–곤·감–리·태–간·진–손, 가운데를 지나는 대각선) 추가 + 넣기/빼기(JJDD).
//   반대 짝 막대를 넣으면 뼈대가 단단해져, 막대 하나를 바꾸면 다른 막대들이 모두 조금씩 버틴다.
// 261126_2206 LAUDE: 8구슬 여의봉 — 고무줄 대신 여의봉 12개(한 효 차이끼리). 막대를 골라 마음대로 늘이고 줄인다(JJDD).
//   여의봉 = 밀기도 당기기도 하는 막대(양쪽 용수철). 막대마다 제 길이가 있고, 고른 막대의 길이를 바꾼다.
//   '다른 막대 변형'은 고르지 않은 막대가 제 길이에서 얼마나 늘거나 줄었는지(%) — 정육면체 뼈대는 모서리만으로는 단단하지 않아
//   막대 하나를 바꿔도 다른 막대는 그대로인 채 상자가 비틀린다.

const $ = (id) => document.getElementById(id);
const canvas = $("rods");
const ctx = canvas.getContext("2d");
let data = null;
const tr = (s) => {
  const L = window.iyeokLanguage;
  try { return L?.t && L.getLanguage?.() !== "ko" ? L.t(L.keyFor(s), {}, s) : s; } catch { return s; }
};
const COLORS = { qian: "#6fa8dc", dui: "#4fb3a9", li: "#e0673f", zhen: "#e6b422", xun: "#7bbf6a", kan: "#3b6fb6", gen: "#9a7b5b", kun: "#c9a36b" };
const KS = 12, BASE_LEN = 2, RAD = 0.35, HARD = 150, DT = 0.02, SUB = 8, DAMP = 0.93, MIN = 0.2, MAX = 5; // 0.2 × 5 = 1: 배율 눈금에서 ×1 이 가운데
let B = [], RODS = [], sel = new Set();
const code = (k) => [...data.trigrams[k].lines].reverse().join("");
const hd = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((c) => c / l); };
const LINE_OF = ["위 효", "가운데 효", "아래 효", "반대 짝"]; // 위 효부터 읽은 자리, 3 = 반대 짝(가운데를 지나는 대각선)
let useOpp = true; // 반대 짝 막대 넣기(기본)
function build() {
  B = Object.keys(data.trigrams).map((k, i) => {
    const c = code(k), home = positionFromCode(c);
    return { k, code: c, home, p: [...home], v: [0, 0, 0], f: norm(home), spin: i * 0.7 };
  });
  RODS = [];
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
    const d = hd(B[i].code, B[j].code);
    if (d === 1) RODS.push({ i, j, line: [...B[i].code].findIndex((c, n) => c !== B[j].code[n]), mul: 1, base: BASE_LEN, id: `${B[i].k}-${B[j].k}` }); // 0 위 효, 1 가운데, 2 아래
    if (d === 3) RODS.push({ i, j, line: 3, mul: 1, base: BASE_LEN * Math.sqrt(3), opp: true, id: `${B[i].k}-${B[j].k}` }); // 반대 짝
  }
}
const len = (r) => Math.hypot(...B[r.j].p.map((c, a) => c - B[r.i].p[a]));
const active = () => RODS.filter((r) => useOpp || !r.opp);

function physics() {
  for (let n = 0; n < SUB; n++) {
    const F = B.map(() => [0, 0, 0]);
    const push = (i, j, f) => { const d = B[j].p.map((c, a) => c - B[i].p[a]), L = Math.hypot(...d) || 1e-9; for (let a = 0; a < 3; a++) { F[i][a] += (f * d[a]) / L; F[j][a] -= (f * d[a]) / L; } };
    for (const r of active()) push(r.i, r.j, KS * (len(r) - r.base * r.mul)); // 늘어나면 당기고, 줄어들면 민다
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
      const L = Math.hypot(...B[j].p.map((c, a) => c - B[i].p[a]));
      if (L < 2 * RAD) push(i, j, -HARD * (2 * RAD - L));
    }
    for (let i = 0; i < 8; i++) for (let a = 0; a < 3; a++) { B[i].v[a] = (B[i].v[a] + F[i][a] * DT) * DAMP; B[i].p[a] += B[i].v[a] * DT; }
  }
  const c = [0, 1, 2].map((a) => B.reduce((t, b) => t + b.p[a], 0) / 8);
  for (const b of B) for (let a = 0; a < 3; a++) b.p[a] -= c[a];
}
const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
function moods() {
  for (const b of B) {
    if (!reduced) b.spin += 0.02;
    const out = norm(b.p), ang = reduced ? 0 : Math.sin(b.spin) * 1.2, cs = Math.cos(ang), sn = Math.sin(ang);
    const target = norm([out[0] * cs - out[1] * sn, out[0] * sn + out[1] * cs, out[2]]);
    b.f = norm(b.f.map((c, a) => c + (target[a] - c) * 0.07));
  }
}

const mul = (A, Bm) => A.map((r) => [0, 1, 2].map((j) => r[0] * Bm[0][j] + r[1] * Bm[1][j] + r[2] * Bm[2][j]));
const rotX = (a) => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
const rotY = (a) => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
const BASE = BASE_VIEW;
const START = mul(rotX(0.25), mul(rotY(-0.4), BASE));
let M = START, zoom = 1, fit = 1.9;
const view = (v) => M.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
const clampZoom = (z) => Math.min(2.4, Math.max(0.5, z));
function rotate(dx, dy) { M = mul(rotX(dy), mul(rotY(dx), M)); }

const FONT = getComputedStyle(document.body).fontFamily || "sans-serif";
let shot = { beads: [], rods: [] };
function draw() {
  const dpr = window.devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const css = getComputedStyle(canvas), C = { ink: css.getPropertyValue("--ink").trim(), seal: css.getPropertyValue("--seal").trim() };
  const maxR = Math.max(1.75, ...B.map((b) => Math.hypot(...b.p) + RAD));
  fit += (maxR - fit) * 0.08;
  const S = (Math.min(W, H) * 0.42 * zoom) / fit, D = fit * 3.6;
  const project = (v) => { const q = view(v), f = D / (D - q[2]); return [W / 2 + q[0] * S * f, H / 2 - q[1] * S * f, q[2], f]; };
  // 여의봉: 금빛 막대, 양 끝 붉은 테. 먼 것부터
  const rods = active().map((r) => ({ r, a: project(B[r.i].p), b: project(B[r.j].p) })).sort((x, y) => x.a[2] + x.b[2] - (y.a[2] + y.b[2]));
  shot.rods = rods.map(({ r, a, b }) => ({ id: r.id, a: [a[0], a[1]], b: [b[0], b[1]] }));
  for (const { r, a, b } of rods) {
    const w = Math.max(3, (r.opp ? 0.09 : 0.11) * S * (a[3] + b[3]) / 2), picked = sel.has(r.id);
    ctx.lineCap = "round";
    if (picked) { ctx.strokeStyle = C.seal; ctx.globalAlpha = 0.55; ctx.lineWidth = w + 7; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    ctx.globalAlpha = 1;
    const g = ctx.createLinearGradient(a[0], a[1] - w, a[0], a[1] + w);
    g.addColorStop(0, "#f6dc7a"); g.addColorStop(0.5, "#d4a62a"); g.addColorStop(1, "#9c7414");
    ctx.strokeStyle = g; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    // 양 끝 붉은 테(여의봉)
    const ux = (b[0] - a[0]), uy = (b[1] - a[1]), L = Math.hypot(ux, uy) || 1, cap = Math.min(0.14 * L, 14);
    ctx.strokeStyle = "#b8322a"; ctx.lineWidth = w + 0.5;
    for (const [s, e] of [[a, [a[0] + (ux / L) * cap, a[1] + (uy / L) * cap]], [b, [b[0] - (ux / L) * cap, b[1] - (uy / L) * cap]]]) { ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(e[0], e[1]); ctx.stroke(); }
  }
  // 구슬
  const items = B.map((b) => ({ b, P: project(b.p) })).sort((x, y) => x.P[2] - y.P[2]);
  shot.beads = items.map((it) => ({ k: it.b.k, x: it.P[0], y: it.P[1], r: RAD * S * it.P[3] }));
  for (const { b, P } of items) {
    const [x, y, , f] = P, R = RAD * S * f, base = COLORS[b.k];
    const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.08, x, y, R);
    g.addColorStop(0, mix("#ffffff", base, 0.25)); g.addColorStop(0.55, base); g.addColorStop(1, mix(base, "#000000", 0.35));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
    const fv = view(b.f), alpha = Math.max(0, Math.min(1, (fv[2] + 0.1) * 1.7));
    if (alpha > 0.02) {
      const cx = x + fv[0] * R * 0.5, cy = y - fv[1] * R * 0.5, sx = Math.sqrt(Math.max(0.05, 1 - fv[0] ** 2)), sy = Math.sqrt(Math.max(0.05, 1 - fv[1] ** 2));
      const w = R * 1.05 * sx, h = R * 0.17 * sy, gap = R * 0.12 * sy, top = cy - (3 * h + 2 * gap) / 2;
      ctx.globalAlpha = alpha; ctx.fillStyle = "#1d1b18";
      [...b.code].forEach((bit, n) => { const yy = top + n * (h + gap); if (bit === "1") ctx.fillRect(cx - w / 2, yy, w, h); else { ctx.fillRect(cx - w / 2, yy, w * 0.42, h); ctx.fillRect(cx + w * 0.08, yy, w * 0.42, h); } });
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = C.ink; ctx.font = `600 ${Math.max(10, Math.round(R * 0.42))}px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
    const t = data.trigrams[b.k];
    ctx.fillText(`${tr(t.nameKo)} ${tr(t.natureKo)}`, x, y + R + 3);
  }
}
function mix(a, b, t) {
  const p = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const A = p(a), Bc = p(b);
  return `rgb(${A.map((v, i) => Math.round(v + (Bc[i] - v) * t)).join(",")})`;
}

// ---- 고르기 ----
const slider = $("rods-len");
const span = (cls, text) => Object.assign(document.createElement("span"), { className: cls, textContent: text });
function rodLabel(r) {
  const s = span("rods-rod", "");
  s.append(span("", data.trigrams[B[r.i].k].nameKo), "–", span("", data.trigrams[B[r.j].k].nameKo));
  return s;
}
function drawChips() {
  const groups = [0, 1, 2, 3].map((line) => {
    const box = document.createElement("div");
    box.className = `rods-chip-group${line === 3 ? " is-opp" : ""}`;
    box.append(span("rods-chip-line", LINE_OF[line]));
    for (const r of RODS.filter((x) => x.line === line)) {
      const b = Object.assign(document.createElement("button"), { type: "button", className: "beads-chip rods-chip" });
      b.dataset.rod = r.id;
      b.setAttribute("aria-pressed", "false");
      b.append(rodLabel(r));
      b.addEventListener("click", () => { toggle(r.id); });
      box.append(b);
    }
    return box;
  });
  $("rods-chips").replaceChildren(...groups);
}
function toggle(id) { sel.has(id) ? sel.delete(id) : sel.add(id); syncSel(); }
function setSel(ids) { sel = new Set(ids); syncSel(); }
function syncSel() {
  for (const b of document.querySelectorAll(".rods-chip")) { b.setAttribute("aria-pressed", String(sel.has(b.dataset.rod))); b.disabled = !useOpp && RODS.find((r) => r.id === b.dataset.rod).opp; }
  for (const b of document.querySelectorAll('[data-rod-group="3"]')) b.disabled = !useOpp;
  const first = RODS.find((r) => sel.has(r.id));
  slider.disabled = !first;
  for (const b of document.querySelectorAll("[data-rod-act]")) b.disabled = !first && b.dataset.rodAct !== "all-reset";
  slider.value = String(first ? Math.log(first.mul) : 0); // 고른 막대가 없으면 가운데(×1)
  slider.setAttribute("aria-valuetext", `×${(first ? first.mul : 1).toFixed(2)}`);
  lastText = 0;
}
function setMul(v) {
  v = Math.max(MIN, Math.min(MAX, v));
  for (const r of RODS) if (sel.has(r.id)) r.mul = v;
  slider.value = String(Math.log(v));
  slider.setAttribute("aria-valuetext", `×${v.toFixed(2)}`);
  lastText = 0;
}
slider.addEventListener("input", () => setMul(Math.round(Math.exp(Number(slider.value)) * 100) / 100)); // 눈금 = ln(배율)
for (const b of document.querySelectorAll("[data-rod-act]")) b.addEventListener("click", () => {
  const a = b.dataset.rodAct, first = RODS.find((r) => sel.has(r.id));
  if (a === "grow" && first) setMul(Math.round(first.mul * 1.18 * 100) / 100);
  else if (a === "shrink" && first) setMul(Math.round((first.mul / 1.18) * 100) / 100);
  else if (a === "reset" && first) setMul(1);
  else if (a === "all-reset") { for (const r of RODS) r.mul = 1; for (const x of B) { x.p = [...x.home]; x.v = [0, 0, 0]; } setSel([]); }
});
for (const b of document.querySelectorAll("[data-rod-group]")) b.addEventListener("click", () => {
  const g = b.dataset.rodGroup;
  setSel(g === "none" ? [] : active().filter((r) => g === "all" || r.line === Number(g)).map((r) => r.id));
});
// 반대 짝 막대 넣기/빼기
const oppBtn = document.getElementById("rods-opp");
oppBtn.addEventListener("click", () => {
  useOpp = !useOpp;
  oppBtn.setAttribute("aria-pressed", String(useOpp));
  for (const s of oppBtn.querySelectorAll("[data-opp]")) s.hidden = s.dataset.opp !== String(useOpp);
  if (!useOpp) for (const r of RODS) if (r.opp) { r.mul = 1; sel.delete(r.id); }
  syncSel();
});

// ---- 글 ----
let lastText = 0;
function texts(now) {
  if (now - lastText < 250) return;
  lastText = now;
  const first = RODS.find((r) => sel.has(r.id));
  $("rods-count").textContent = String(sel.size);
  $("rods-mul").textContent = first ? `×${first.mul.toFixed(2)}` : "—";
  const others = active().filter((r) => !sel.has(r.id));
  const strain = others.length ? Math.max(...others.map((r) => Math.abs(len(r) / (r.base * r.mul) - 1))) : 0;
  $("rods-strain").textContent = `${(strain * 100).toFixed(1)}%`;
  // 반대 짝이 맞닿으면(견우와 직녀) 알림
  const met = active().filter((r) => r.opp && len(r) < 2 * RAD + 0.06);
  const meet = $("rods-meet");
  meet.hidden = !met.length;
  if (met.length && meet.dataset.pair !== met[0].id) {
    const r = met[0], nm = (b) => { const t = data.trigrams[b.k], s = span("", ""); s.append(span("", t.nameKo), "(", span("", t.natureKo), ")"); return s; };
    $("rods-meet-names").replaceChildren(nm(B[r.i]), " · ", nm(B[r.j]));
  }
  meet.dataset.pair = met.length ? met[0].id : "";
  canvas.dataset.screen = JSON.stringify({ beads: shot.beads.map((b) => [b.k, Math.round(b.x), Math.round(b.y)]), rods: shot.rods.map((r) => [r.id, Math.round((r.a[0] + r.b[0]) / 2), Math.round((r.a[1] + r.b[1]) / 2)]) });
  canvas.dataset.state = JSON.stringify({ view: M, met: met.map((r) => r.id), useOpp, sel: [...sel].sort(), strain: +strain.toFixed(4), zoom: +zoom.toFixed(2), mul: Object.fromEntries(RODS.map((r) => [r.id, r.mul])), len: Object.fromEntries(RODS.map((r) => [r.id, +len(r).toFixed(3)])), pos: Object.fromEntries(B.map((b) => [b.k, b.p.map((c) => +c.toFixed(3))])) });
}
function frame(now) { physics(); moods(); draw(); texts(now); requestAnimationFrame(frame); }

// ---- 손가락·마우스·키보드 ----
const pts = new Map();
let moved = 0, pinch0 = null;
const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; };
canvas.addEventListener("pointerdown", (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch { /* 계속 */ }
  pts.set(e.pointerId, [e.clientX, e.clientY]);
  if (pts.size === 1) moved = 0;
  if (pts.size === 2) { pinch0 = { d: dist(), z: zoom }; moved = 99; }
});
canvas.addEventListener("pointermove", (e) => {
  if (!pts.has(e.pointerId)) return;
  const [px, py] = pts.get(e.pointerId);
  pts.set(e.pointerId, [e.clientX, e.clientY]);
  if (pts.size === 1) { moved += Math.abs(e.clientX - px) + Math.abs(e.clientY - py); rotate((e.clientX - px) * 0.011, (e.clientY - py) * 0.011); }
  else if (pts.size === 2 && pinch0) zoom = clampZoom((pinch0.z * dist()) / pinch0.d);
});
canvas.addEventListener("pointerup", (e) => {
  if (!pts.has(e.pointerId)) return;
  if (pts.size === 1 && moved < 6) pickRod(e);
  pts.delete(e.pointerId);
  if (pts.size < 2) pinch0 = null;
});
canvas.addEventListener("pointercancel", (e) => { pts.delete(e.pointerId); pinch0 = null; });
canvas.addEventListener("dblclick", () => { M = START; zoom = 1; });
canvas.addEventListener("wheel", (e) => { e.preventDefault(); zoom = clampZoom(zoom * Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
canvas.addEventListener("keydown", (e) => {
  const st = 0.18, acts = { ArrowLeft: () => rotate(-st, 0), ArrowRight: () => rotate(st, 0), ArrowUp: () => rotate(0, -st), ArrowDown: () => rotate(0, st), "+": () => (zoom = clampZoom(zoom * 1.15)), "=": () => (zoom = clampZoom(zoom * 1.15)), "-": () => (zoom = clampZoom(zoom / 1.15)), "0": () => { M = START; zoom = 1; } };
  if (!acts[e.key]) return;
  e.preventDefault(); acts[e.key]();
});
// 화면에서 막대 누르기: 막대 선분에서 가까운 것(구슬 위를 누르면 무시)
function pickRod(e) {
  const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  if (shot.beads.some((b) => Math.hypot(b.x - x, b.y - y) <= b.r)) return;
  let best = null, bd = 14;
  for (const s of shot.rods) {
    const [ax, ay] = s.a, [bx, by] = s.b, dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    const d = Math.hypot(ax + t * dx - x, ay + t * dy - y);
    if (d < bd) { bd = d; best = s.id; }
  }
  if (best) toggle(best);
}

fetch("../../data/hexagrams.json")
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
  .then((d) => { data = d; build(); drawChips(); syncSel(); requestAnimationFrame(frame); })
  .catch(() => { $("rods-error").hidden = false; });
