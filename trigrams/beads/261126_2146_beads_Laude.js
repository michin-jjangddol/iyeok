// 261126_2146 LAUDE: 2탄 8괘 구슬 — 정육면체 꼭짓점의 여덟 구슬과 고무줄 열두 줄(한 효 차이끼리). JJDD 요청.
//   온도: 추우면 반대 짝이 자석처럼 끌리고(마주 봄), 더우면 밀어낸다(등을 돌림, 토라짐). 보통이면 제자리에서 돌돌.
//   간단한 물리 모형: 고무줄은 늘어날 때만 당기고(밀지 못함), 구슬끼리는 부딪히면 튕긴다. 얼굴(괘상) 방향은 연출.
//   라이브러리 없이 캔버스에 직접 그린다. 한 손가락·마우스로 돌리기, 두 손가락·휠로 확대, 두 번 눌러 처음 자리, 구슬 누르기.

const $ = (id) => document.getElementById(id);
const canvas = $("beads");
const ctx = canvas.getContext("2d");
let data = null;
const tr = (s) => {
  const L = window.iyeokLanguage;
  try { return L?.t && L.getLanguage?.() !== "ko" ? L.t(L.keyFor(s), {}, s) : s; } catch { return s; }
};

// ---- 구슬: 위치 = 부호 (x 아래 효, y 가운데 효, z 위 효), 양 = + ----
const COLORS = { qian: "#6fa8dc", dui: "#4fb3a9", li: "#e0673f", zhen: "#e6b422", xun: "#7bbf6a", kan: "#3b6fb6", gen: "#9a7b5b", kun: "#c9a36b" };
const PAIRS = { all: [["qian", "kun"], ["kan", "li"], ["dui", "gen"], ["zhen", "xun"]], qiankun: [["qian", "kun"]], kanli: [["kan", "li"]], duigen: [["dui", "gen"]], zhenxun: [["zhen", "xun"]] };
const K = 3, REST = 2, RAD = 0.35, HARD = 150, DT = 0.02, SUB = 8, DAMP = 0.95, SMAX = 0.6 * K;
let B = [], EDGES = [], temp = 0, pairKey = "qiankun", picked = [];
const code = (k) => [...data.trigrams[k].lines].reverse().join(""); // 위 효부터
const hd = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((c) => c / l); };
function build() {
  B = Object.keys(data.trigrams).map((k, i) => {
    const c = code(k), home = [c[2], c[1], c[0]].map((b) => (b === "1" ? 1 : -1));
    return { k, code: c, home, p: [...home], v: [0, 0, 0], f: norm(home), spin: i * 0.7 };
  });
  EDGES = [];
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (hd(B[i].code, B[j].code) === 1) EDGES.push([i, j]);
}
const bead = (k) => B.find((b) => b.k === k);
function resetBeads() { for (const b of B) { b.p = [...b.home]; b.v = [0, 0, 0]; b.f = norm(b.home); } }
const partnerOf = (k) => { const pr = PAIRS[pairKey].find((p) => p.includes(k)); return pr ? (pr[0] === k ? pr[1] : pr[0]) : null; };

// ---- 물리 ----
function physics() {
  const s = -temp * SMAX; // s > 0 이면 끌림(추움), s < 0 이면 밀어냄(더움)
  const pairs = PAIRS[pairKey].map(([a, b]) => [B.indexOf(bead(a)), B.indexOf(bead(b))]);
  for (let n = 0; n < SUB; n++) {
    const F = B.map(() => [0, 0, 0]);
    const pull = (i, j, f) => { const d = B[j].p.map((c, a) => c - B[i].p[a]), L = Math.hypot(...d) || 1e-9; for (let a = 0; a < 3; a++) { F[i][a] += (f * d[a]) / L; F[j][a] -= (f * d[a]) / L; } return L; };
    for (const [i, j] of EDGES) { const L = Math.hypot(...B[j].p.map((c, a) => c - B[i].p[a])); if (L > REST) pull(i, j, K * (L - REST)); }
    if (Math.abs(temp) > 0.001) for (const [i, j] of pairs) pull(i, j, s);
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
      const L = Math.hypot(...B[j].p.map((c, a) => c - B[i].p[a]));
      if (L < 2 * RAD) pull(i, j, -HARD * (2 * RAD - L));
    }
    for (let i = 0; i < 8; i++) for (let a = 0; a < 3; a++) { B[i].v[a] = (B[i].v[a] + F[i][a] * DT) * DAMP; B[i].p[a] += B[i].v[a] * DT; }
  }
  // 가운데 맞추기(전체가 떠내려가지 않게)
  const c = [0, 1, 2].map((a) => B.reduce((t, b) => t + b.p[a], 0) / 8);
  for (const b of B) for (let a = 0; a < 3; a++) b.p[a] -= c[a];
}
// ---- 얼굴(기분): 추우면 짝을 마주 보고, 더우면 등을 돌리고, 보통이면 돌돌 ----
const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
function moods() {
  for (const b of B) {
    const pk = partnerOf(b.k);
    let target;
    if (pk && Math.abs(temp) > 0.12) {
      const to = norm(bead(pk).p.map((c, a) => c - b.p[a]));
      target = temp < 0 ? to : to.map((c) => -c);
    } else {
      if (!reduced) b.spin += 0.025;
      const out = norm(b.p.some((c) => Math.abs(c) > 0.05) ? b.p : b.home);
      // 바깥쪽을 보며 위아래 축(z) 둘레로 돌돌
      const ang = reduced ? 0 : Math.sin(b.spin) * 1.3, cs = Math.cos(ang), sn = Math.sin(ang);
      target = norm([out[0] * cs - out[1] * sn, out[0] * sn + out[1] * cs, out[2]]);
    }
    if (b.f[0] * target[0] + b.f[1] * target[1] + b.f[2] * target[2] < -0.95) b.f = norm([b.f[0] + 0.15, b.f[1] - 0.1, b.f[2] + 0.12]);
    b.f = norm(b.f.map((c, a) => c + (target[a] - c) * 0.07));
  }
}

// ---- 보기(돌리기·확대) ----
const mul = (A, Bm) => A.map((r) => [0, 1, 2].map((j) => r[0] * Bm[0][j] + r[1] * Bm[1][j] + r[2] * Bm[2][j]));
const rotX = (a) => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
const rotY = (a) => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
const BASE = [[1, 0, 0], [0, 0, 1], [0, -1, 0]];
const START = mul(rotX(0.38), mul(rotY(-0.55), BASE));
let M = START, zoom = 1, fit = 1.9;
const view = (v) => M.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
const clampZoom = (z) => Math.min(2.4, Math.max(0.5, z));
function rotate(dx, dy) { M = mul(rotX(dy), mul(rotY(dx), M)); }

// ---- 그리기 ----
const FONT = getComputedStyle(document.body).fontFamily || "sans-serif";
let lastDraw = [];
function draw() {
  const dpr = window.devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const css = getComputedStyle(canvas), col = (n) => css.getPropertyValue(n).trim();
  const C = { ink: col("--ink"), soft: col("--ink-faint"), seal: col("--seal"), paper: col("--paper") };
  const maxR = Math.max(1.75, ...B.map((b) => Math.hypot(...b.p) + RAD));
  fit += (maxR - fit) * 0.08; // 부드럽게 화면에 맞추기
  const S = (Math.min(W, H) * 0.42 * zoom) / fit, D = fit * 3.6; // 원근은 살짝만
  const project = (v) => { const q = view(v), f = D / (D - q[2]); return [W / 2 + q[0] * S * f, H / 2 - q[1] * S * f, q[2], f]; };
  // 고무줄: 느슨하면 처지게(회색), 팽팽할수록 빨갛고 굵게
  for (const [i, j] of EDGES) {
    const a = project(B[i].p), b = project(B[j].p), L = Math.hypot(...B[j].p.map((c, n) => c - B[i].p[n]));
    const tension = Math.max(0, L - REST) / REST, slack = Math.max(0, REST - L) / REST;
    ctx.globalAlpha = (a[2] + b[2]) / 2 < 0 ? 0.55 : 0.95;
    ctx.lineWidth = 1.6 + Math.min(tension, 0.6) * 9;
    ctx.strokeStyle = tension > 0.01 ? mix(C.soft, C.seal, Math.min(1, tension * 5)) : C.soft;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    if (slack > 0.01) ctx.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + slack * S * 1.2, b[0], b[1]);
    else ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // 구슬: 먼 것부터
  const items = B.map((b) => ({ b, P: project(b.p) })).sort((x, y) => x.P[2] - y.P[2]);
  lastDraw = items.map((it) => ({ k: it.b.k, x: it.P[0], y: it.P[1], r: RAD * S * it.P[3] }));
  for (const it of items) {
    const { b } = it, [x, y, , f] = it.P, R = RAD * S * f, base = COLORS[b.k];
    const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.08, x, y, R);
    g.addColorStop(0, mix("#ffffff", base, 0.25));
    g.addColorStop(0.55, base);
    g.addColorStop(1, mix(base, "#000000", 0.35));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
    if (picked.includes(b.k)) { ctx.strokeStyle = C.seal; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, R + 3, 0, Math.PI * 2); ctx.stroke(); }
    // 얼굴(괘상): 보는 방향으로 옮겨 가고, 옆을 보면 납작해지고, 등을 돌리면 흐려진다
    const fv = view(b.f), alpha = Math.max(0, Math.min(1, (fv[2] + 0.1) * 1.7));
    if (alpha > 0.02) {
      const cx = x + fv[0] * R * 0.5, cy = y - fv[1] * R * 0.5, sx = Math.sqrt(Math.max(0.05, 1 - fv[0] ** 2)), sy = Math.sqrt(Math.max(0.05, 1 - fv[1] ** 2));
      const w = R * 1.05 * sx, h = R * 0.17 * sy, gap = R * 0.12 * sy, top = cy - (3 * h + 2 * gap) / 2;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#1d1b18";
      [...b.code].forEach((bit, n) => {
        const yy = top + n * (h + gap);
        if (bit === "1") ctx.fillRect(cx - w / 2, yy, w, h);
        else { ctx.fillRect(cx - w / 2, yy, w * 0.42, h); ctx.fillRect(cx + w * 0.08, yy, w * 0.42, h); }
      });
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = C.ink;
    ctx.font = `600 ${Math.max(10, Math.round(R * 0.42))}px ${FONT}`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    const t = data.trigrams[b.k];
    ctx.fillText(`${tr(t.nameKo)} ${tr(t.natureKo)}`, x, y + R + 3);
  }
}
function mix(a, b, t) {
  const p = (h) => { const m = h.replace("#", "").match(/^([0-9a-f]{6})$/i); if (!m) return null; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const A = p(a), Bc = p(b);
  if (!A || !Bc) return t < 0.5 ? a : b;
  return `rgb(${A.map((v, i) => Math.round(v + (Bc[i] - v) * t)).join(",")})`;
}

// ---- 글(상태·고른 구슬) ----
let lastText = 0;
function texts(now) {
  if (now - lastText < 250) return;
  lastText = now;
  const regime = Math.abs(temp) <= 0.12 ? "calm" : `${temp < 0 ? "cold" : "hot"}-${pairKey === "all" ? "all" : "one"}`;
  for (const p of document.querySelectorAll("#beads-say [data-regime]")) p.hidden = p.dataset.regime !== regime;
  const taut = EDGES.filter(([i, j]) => Math.hypot(...B[j].p.map((c, a) => c - B[i].p[a])) > REST * 1.01).length;
  const [a, b] = PAIRS[pairKey][0].map(bead);
  $("beads-taut").textContent = String(taut);
  $("beads-pairdist").textContent = Math.hypot(...b.p.map((c, n) => c - a.p[n])).toFixed(2);
  const info = $("beads-pick");
  info.dataset.regime = regime;
  info.dataset.taut = String(taut);
  const rows = info.querySelectorAll("[data-pick]");
  rows.forEach((r) => (r.hidden = Number(r.dataset.pick) !== Math.min(picked.length, 2)));
  if (picked.length === 1) {
    const k = picked[0], pk = PAIRS.all.find((p) => p.includes(k)).find((x) => x !== k);
    $("pick-one").replaceChildren(nameSpan(k));
    $("pick-partner").replaceChildren(nameSpan(pk));
    $("pick-partner-dist").textContent = Math.hypot(...bead(pk).p.map((c, n) => c - bead(k).p[n])).toFixed(2);
  } else if (picked.length === 2) {
    const [x, y] = picked.map(bead);
    $("pick-a").replaceChildren(nameSpan(x.k));
    $("pick-b").replaceChildren(nameSpan(y.k));
    $("pick-dist").textContent = Math.hypot(...y.p.map((c, n) => c - x.p[n])).toFixed(2);
    $("pick-hd").textContent = String(hd(x.code, y.code));
  }
  canvas.dataset.screen = JSON.stringify(Object.fromEntries(lastDraw.map((d) => [d.k, [Math.round(d.x), Math.round(d.y)]])));
  canvas.dataset.state = JSON.stringify({ temp, pair: pairKey, regime, taut, picked, zoom: +zoom.toFixed(2), pos: Object.fromEntries(B.map((b) => [b.k, b.p.map((c) => +c.toFixed(3))])), face: Object.fromEntries(B.map((b) => [b.k, b.f.map((c) => +c.toFixed(3))])) });
}
const span = (cls, text) => Object.assign(document.createElement("span"), { className: cls, textContent: text });
function nameSpan(k) { const t = data.trigrams[k], s = span("beads-name", ""); s.append(span("", t.nameKo), "(", span("", t.natureKo), ")"); return s; }

// ---- 고리 ----
function frame(now) {
  physics();
  moods();
  draw();
  texts(now);
  requestAnimationFrame(frame);
}

// ---- 조작 ----
const slider = $("beads-temp");
function setTemp(v) {
  temp = Math.max(-1, Math.min(1, v));
  slider.value = String(temp);
  slider.setAttribute("aria-valuetext", temp < -0.12 ? "추움" : temp > 0.12 ? "더움" : "보통");
  for (const b of document.querySelectorAll("[data-preset]")) b.setAttribute("aria-pressed", String(Number(b.dataset.preset) === temp));
}
slider.addEventListener("input", () => setTemp(Number(slider.value)));
for (const b of document.querySelectorAll("[data-preset]")) b.addEventListener("click", () => setTemp(Number(b.dataset.preset)));
for (const b of document.querySelectorAll(".beads-pair-btn")) b.addEventListener("click", () => {
  pairKey = b.dataset.pair;
  for (const x of document.querySelectorAll(".beads-pair-btn")) x.setAttribute("aria-pressed", String(x === b));
});
$("beads-reset").addEventListener("click", () => { resetBeads(); setTemp(0); });
const pts = new Map();
let moved = 0, pinch0 = null;
const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; };
canvas.addEventListener("pointerdown", (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch { /* 붙잡지 못해도 계속 */ }
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
  if (pts.size === 1 && moved < 6) pick(e);
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
document.querySelector(".beads-controls").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  const a = b.dataset.act;
  if (a === "left") rotate(-0.3, 0);
  else if (a === "right") rotate(0.3, 0);
  else if (a === "up") rotate(0, -0.3);
  else if (a === "down") rotate(0, 0.3);
  else if (a === "in") zoom = clampZoom(zoom * 1.2);
  else if (a === "out") zoom = clampZoom(zoom / 1.2);
  else if (a === "view") { M = START; zoom = 1; }
});
function pick(e) {
  const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  const hit = [...lastDraw].reverse().find((d) => Math.hypot(d.x - x, d.y - y) <= d.r + 4);
  if (!hit) { picked = []; return; }
  if (picked.includes(hit.k)) picked = picked.filter((k) => k !== hit.k);
  else picked = picked.length >= 2 ? [hit.k] : [...picked, hit.k];
  lastText = 0;
}

fetch("../../data/hexagrams.json")
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
  .then((d) => { data = d; build(); setTemp(0); requestAnimationFrame(frame); })
  .catch(() => { $("beads-error").hidden = false; });
