// 261126_2110 LAUDE: 8괘 더 알아보기 — 투명한 정팔면체의 여덟 면에 8괘(효 = 축 배치). JJDD 요청.
//   라이브러리 없이 캔버스에 직접 그린다(가볍고 오프라인에서도 그대로). 한 손가락·마우스로 돌리기, 두 손가락·휠로 확대·축소,
//   두 번 눌러 처음 자리, 면을 눌러 이웃(한 효)·꼭짓점(두 효)·맞은편(세 효) 보기, 길 따라가기(한 효씩 / 선천 / 아이역), 안에서 보기(거울상).
//   아래쪽 전개도는 '한 효씩 도는 길'을 그대로 펼친 그림.
import { trigramCode, TRIGRAM_ORDERS } from "../../assets/261125_1716_trigrams-ko_Laude.js";

const $ = (id) => document.getElementById(id);
const canvas = $("octa");
const ctx = canvas.getContext("2d");
let data = null;
// 캔버스 글자는 언어 사전이 바꾸지 못하므로 직접 번역한다(한국어면 그대로)
const tr = (s) => {
  const L = window.iyeokLanguage;
  try { return L?.t && L.getLanguage?.() !== "ko" ? L.t(L.keyFor(s), {}, s) : s; } catch { return s; }
};

// ---- 면: 부호 (x, y, z). 아래 효 = x(좌우), 가운데 효 = y(앞뒤), 위 효 = z(위아래). 양 = + 쪽 ----
let FACES = [];
const GRAY = ["kun", "zhen", "dui", "kan", "xun", "qian", "li", "gen"]; // 한 효씩만 바꾸며 도는 길
const PATHS = { gray: GRAY, xiantian: TRIGRAM_ORDERS.xiantian, iyeok: TRIGRAM_ORDERS.iyeok };
const hd = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
const faceOf = (k) => FACES.find((f) => f.k === k);
function buildFaces() {
  FACES = Object.keys(data.trigrams).map((k) => {
    const code = trigramCode(data.trigrams[k]);
    const s = [code[2], code[1], code[0]].map((b) => (b === "1" ? 1 : -1));
    return { k, code, s, verts: [[s[0], 0, 0], [0, s[1], 0], [0, 0, s[2]]], c: s.map((v) => v / 3) };
  });
}

// ---- 돌리기 ----
const mul = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
const rotX = (a) => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
const rotY = (a) => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
const BASE = [[1, 0, 0], [0, 0, 1], [0, -1, 0]]; // 세계 z(위 효) → 화면 위, 세계 y → 화면 안쪽
const START = mul(rotX(0.42), mul(rotY(-0.62), BASE));
let M = START, zoom = 1, inside = false, sel = null, path = null, raf = 0;
const clampZoom = (z) => Math.min(2.4, Math.max(0.6, z));
const apply = (v) => {
  const r = M.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
  if (inside) r[0] = -r[0]; // 안에서 보기 = 거울상
  return r;
};
function rotate(dx, dy) {
  if (inside) dx = -dx;
  M = mul(rotX(dy), mul(rotY(dx), M));
  schedule();
}
function reset() { M = START; zoom = 1; schedule(); }
function schedule() { if (!raf) raf = requestAnimationFrame(draw); }

// ---- 그리기 ----
const FONT = getComputedStyle(document.body).fontFamily || "sans-serif";
let lastItems = [];
function draw() {
  raf = 0;
  if (!data) return;
  const dpr = window.devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const css = getComputedStyle(canvas), col = (n) => css.getPropertyValue(n).trim();
  const C = { ink: col("--ink"), face: col("--o-face"), sel: col("--o-sel"), d1: col("--o-d1"), d2: col("--o-d2"), d3: col("--o-d3"), jump: col("--o-jump"), paper: col("--paper") };
  const S = Math.min(W, H) * 0.34 * zoom;
  const project = (v) => { const f = 4 / (4 - v[2]); return [W / 2 + v[0] * S * f, H / 2 - v[1] * S * f, v[2], f]; };
  const items = FACES.map((f) => {
    const cz = apply(f.c), n = apply(f.s.map((v) => v / Math.sqrt(3)));
    return { f, P: f.verts.map((v) => project(apply(v))), cz: cz[2], cp: project(cz), front: n[2] > 0 };
  }).sort((a, b) => a.cz - b.cz);
  lastItems = items;
  const k0 = (Math.min(W, H) / 340) * zoom;
  for (const it of items) {
    const d = sel ? hd(it.f.code, faceOf(sel).code) : -1;
    ctx.globalAlpha = it.front ? 0.55 : 0.22;
    ctx.fillStyle = d === 0 ? C.sel : d === 1 ? C.d1 : d === 2 ? C.d2 : d === 3 ? C.d3 : C.face;
    ctx.beginPath();
    it.P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    if (d === 0) ctx.globalAlpha = it.front ? 0.85 : 0.35; // 고른 면은 더 진하게
    ctx.fill();
    if (d === 0) { ctx.globalAlpha = 1; ctx.strokeStyle = C.sel; ctx.lineWidth = 3; ctx.stroke(); }
    label(it, it.front ? 1 : 0.32, k0 * it.cp[3], C);
  }
  // 모서리: 두 면이 모두 뒤쪽이면 점선
  const vkey = (v) => v.join(",");
  const VERTS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  ctx.globalAlpha = 1;
  ctx.strokeStyle = C.ink;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
    const a = VERTS[i], b = VERTS[j];
    if (a.every((v, n) => v === -b[n])) continue; // 맞은편 꼭짓점끼리는 모서리가 아니다
    const both = items.filter((it) => it.f.verts.some((v) => vkey(v) === vkey(a)) && it.f.verts.some((v) => vkey(v) === vkey(b)));
    const back = both.every((it) => !it.front);
    const pa = project(apply(a)), pb = project(apply(b));
    ctx.globalAlpha = back ? 0.3 : 0.9;
    ctx.lineWidth = back ? 1 : 1.6;
    ctx.setLineDash(back ? [4, 4] : []);
    ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
  }
  ctx.setLineDash([]);
  if (path) drawPath(items, k0, C);
  ctx.globalAlpha = 1;
  canvas.dataset.state = JSON.stringify({ zoom: +zoom.toFixed(3), inside, front: items.filter((it) => it.front).map((it) => it.f.k).sort(), sel, path });
}
function label(it, alpha, k, C) {
  const [x, y] = it.cp, t = data.trigrams[it.f.k];
  ctx.globalAlpha = alpha;
  ctx.fillStyle = C.ink;
  const w = 26 * k, h = 4 * k, g = 3.2 * k, top = y - (3 * h + 2 * g) - 1.5 * k;
  [...it.f.code].forEach((b, i) => {
    const yy = top + i * (h + g);
    if (b === "1") ctx.fillRect(x - w / 2, yy, w, h);
    else { ctx.fillRect(x - w / 2, yy, w * 0.42, h); ctx.fillRect(x + w * 0.08, yy, w * 0.42, h); }
  });
  ctx.font = `600 ${Math.max(9, Math.round(11.5 * k))}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(`${tr(t.nameKo)} ${tr(t.natureKo)}`, x, y + 2 * k);
}
function drawPath(items, k0, C) {
  const seq = PATHS[path], at = (key) => items.find((it) => it.f.k === key).cp;
  ctx.globalAlpha = 0.95;
  for (let i = 0; i < seq.length - 1; i++) {
    const a = at(seq[i]), b = at(seq[i + 1]), d = hd(faceOf(seq[i]).code, faceOf(seq[i + 1]).code);
    ctx.strokeStyle = d === 1 ? C.sel : C.jump;
    ctx.lineWidth = 3;
    ctx.setLineDash(d === 1 ? [] : [7, 6]);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), cut = 16 * k0, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < cut * 2.2) continue;
    const ax = a[0] + Math.cos(ang) * cut, ay = a[1] + Math.sin(ang) * cut, bx = b[0] - Math.cos(ang) * cut, by = b[1] - Math.sin(ang) * cut;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - Math.cos(ang - 0.45) * 10 * k0, by - Math.sin(ang - 0.45) * 10 * k0);
    ctx.lineTo(bx - Math.cos(ang + 0.45) * 10 * k0, by - Math.sin(ang + 0.45) * 10 * k0);
    ctx.closePath(); ctx.fill();
  }
  ctx.setLineDash([]);
  seq.forEach((key, i) => {
    const [x, y] = at(key), r = 8.5 * k0, cx = x - 22 * k0, cy = y - 16 * k0;
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.sel;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.paper;
    ctx.font = `700 ${Math.max(9, Math.round(10.5 * k0))}px ${FONT}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), cx, cy + 0.5);
  });
}

// ---- 면 고르기·정보 ----
const span = (cls, text) => Object.assign(document.createElement("span"), { className: cls, textContent: text });
function nameSpan(k) {
  const t = data.trigrams[k], s = span("octa-name", "");
  s.append(span("", t.nameKo), "(", span("", t.natureKo), ")");
  return s;
}
function select(k) {
  sel = sel === k ? null : k;
  for (const b of document.querySelectorAll(".octa-face-btn")) b.setAttribute("aria-pressed", String(b.dataset.trigram === sel));
  const box = $("octa-info");
  for (const row of box.querySelectorAll("[data-d]")) {
    const list = row.querySelector(".octa-list");
    if (!sel) { list.replaceChildren(); continue; }
    const c = faceOf(sel).code, d = Number(row.dataset.d);
    const ks = d === 0 ? [sel] : FACES.filter((f) => hd(f.code, c) === d).map((f) => f.k);
    list.replaceChildren(...ks.flatMap((x, i) => (i ? [" · ", nameSpan(x)] : [nameSpan(x)])));
  }
  box.querySelector(".octa-info-empty").hidden = !!sel;
  box.querySelector(".octa-info-rows").hidden = !sel;
  box.dataset.sel = sel || "";
  schedule();
}
function choosePath(p) {
  path = p === "none" ? null : p;
  for (const b of document.querySelectorAll(".octa-path-btn")) b.setAttribute("aria-pressed", String(b.dataset.path === p));
  const box = $("octa-path-info");
  box.hidden = !path;
  if (path) {
    const seq = PATHS[path], steps = seq.slice(0, -1).map((k, i) => hd(faceOf(k).code, faceOf(seq[i + 1]).code));
    const ok = steps.filter((d) => d === 1).length;
    box.querySelector(".octa-ok").textContent = String(ok);
    box.querySelector(".octa-jump").textContent = String(steps.length - ok);
    const order = box.querySelector(".octa-seq");
    order.replaceChildren(...seq.flatMap((k, i) => (i ? [" → ", nameSpan(k)] : [nameSpan(k)])));
    box.querySelector('[data-verdict="ok"]').hidden = ok !== steps.length;
    box.querySelector('[data-verdict="jump"]').hidden = ok === steps.length;
    box.dataset.result = `${path}:${steps.join("")}`;
  }
  schedule();
}

// ---- 손가락·마우스·키보드 ----
const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
let spinning = !reduced, spinRaf = 0;
function spin() { if (!spinning) return; M = mul(rotY(0.004), M); draw(); spinRaf = requestAnimationFrame(spin); }
function stopSpin() { spinning = false; cancelAnimationFrame(spinRaf); }
const pts = new Map();
let moved = 0, pinch0 = null;
const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; };
canvas.addEventListener("pointerdown", (e) => {
  stopSpin();
  try { canvas.setPointerCapture(e.pointerId); } catch { /* 붙잡지 못해도 돌리기는 계속 */ }
  pts.set(e.pointerId, [e.clientX, e.clientY]);
  if (pts.size === 1) moved = 0;
  if (pts.size === 2) { pinch0 = { d: dist(), z: zoom }; moved = 99; }
});
canvas.addEventListener("pointermove", (e) => {
  if (!pts.has(e.pointerId)) return;
  const [px, py] = pts.get(e.pointerId);
  pts.set(e.pointerId, [e.clientX, e.clientY]);
  if (pts.size === 1) { moved += Math.abs(e.clientX - px) + Math.abs(e.clientY - py); rotate((e.clientX - px) * 0.011, (e.clientY - py) * 0.011); }
  else if (pts.size === 2 && pinch0) { zoom = clampZoom((pinch0.z * dist()) / pinch0.d); schedule(); }
});
const up = (e) => {
  if (!pts.has(e.pointerId)) return;
  if (pts.size === 1 && moved < 6) pick(e);
  pts.delete(e.pointerId);
  if (pts.size < 2) pinch0 = null;
};
canvas.addEventListener("pointerup", up);
canvas.addEventListener("pointercancel", (e) => { pts.delete(e.pointerId); pinch0 = null; });
canvas.addEventListener("dblclick", () => { stopSpin(); reset(); });
canvas.addEventListener("wheel", (e) => { e.preventDefault(); stopSpin(); zoom = clampZoom(zoom * Math.exp(-e.deltaY * 0.0015)); schedule(); }, { passive: false });
canvas.addEventListener("keydown", (e) => {
  const step = 0.18, acts = { ArrowLeft: () => rotate(-step, 0), ArrowRight: () => rotate(step, 0), ArrowUp: () => rotate(0, -step), ArrowDown: () => rotate(0, step), "+": () => zoomBy(1.15), "=": () => zoomBy(1.15), "-": () => zoomBy(1 / 1.15), "0": reset, Home: reset };
  if (!acts[e.key]) return;
  e.preventDefault(); stopSpin(); acts[e.key]();
});
function zoomBy(f) { zoom = clampZoom(zoom * f); schedule(); }
function pick(e) {
  const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  const inTri = (P) => {
    const s = (a, b) => (x - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (y - b[1]);
    const d1 = s(P[0], P[1]), d2 = s(P[1], P[2]), d3 = s(P[2], P[0]);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  const hit = [...lastItems].reverse().find((it) => it.front && inTri(it.P));
  if (hit) select(hit.f.k);
}
document.querySelector(".octa-controls").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  stopSpin();
  const a = b.dataset.act;
  if (a === "left") rotate(-0.3, 0);
  else if (a === "right") rotate(0.3, 0);
  else if (a === "up") rotate(0, -0.3);
  else if (a === "down") rotate(0, 0.3);
  else if (a === "in") zoomBy(1.2);
  else if (a === "out") zoomBy(1 / 1.2);
  else if (a === "reset") reset();
  else if (a === "inside") {
    inside = !inside;
    b.setAttribute("aria-pressed", String(inside));
    $("octa-inside-note").hidden = !inside;
    schedule();
  }
});
for (const b of document.querySelectorAll(".octa-path-btn")) b.addEventListener("click", () => { stopSpin(); choosePath(b.dataset.path); });
window.addEventListener("resize", schedule);
window.addEventListener("iyeok:languagechange", () => setTimeout(schedule, 50));
window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", schedule);

// ---- 전개도: '한 효씩 도는 길'을 펼친다(공유 모서리를 기준으로 앞 삼각형을 뒤집어 다음 삼각형) ----
const NS = "http://www.w3.org/2000/svg";
const svgEl = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p?.append(e); return e; };
function drawNet() {
  const vk = (f) => f.s.map((sg, i) => `${i}${sg > 0 ? "+" : "-"}`);
  const reflect = (p, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
    const fx = a[0] + t * dx, fy = a[1] + t * dy;
    return [2 * fx - p[0], 2 * fy - p[1]];
  };
  const first = vk(faceOf(GRAY[0]));
  const pos = [new Map([[first[0], [0, 0]], [first[1], [1, 0]], [first[2], [0.5, Math.sqrt(3) / 2]]])];
  const folds = [];
  for (let i = 1; i < GRAY.length; i++) {
    const pk = vk(faceOf(GRAY[i - 1])), ck = vk(faceOf(GRAY[i])), P = pos[i - 1];
    const shared = ck.filter((x) => pk.includes(x)), nk = ck.find((x) => !pk.includes(x)), ok = pk.find((x) => !ck.includes(x));
    const a = P.get(shared[0]), b = P.get(shared[1]);
    pos.push(new Map([[shared[0], a], [shared[1], b], [nk, reflect(P.get(ok), a, b)]]));
    folds.push([a, b]);
  }
  const all = pos.flatMap((m) => [...m.values()]);
  const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
  const U = 100, pad = 12, Wd = (maxX - minX) * U + pad * 2, Hd = (maxY - minY) * U + pad * 2;
  const X = (p) => (p[0] - minX) * U + pad, Y = (p) => (maxY - p[1]) * U + pad;
  const svg = svgEl("svg", { viewBox: `0 0 ${Wd.toFixed(1)} ${Hd.toFixed(1)}`, class: "octa-net-svg", role: "img", "aria-labelledby": "net-title" });
  GRAY.forEach((key, i) => {
    const f = faceOf(key), pts = [...pos[i].values()], odd = [...f.code].filter((c) => c === "1").length % 2 === 1;
    const g = svgEl("g", { class: `octa-net-face ${odd ? "is-odd" : "is-even"}`, "data-trigram": key }, svg);
    svgEl("polygon", { points: pts.map((p) => `${X(p).toFixed(1)},${Y(p).toFixed(1)}`).join(" ") }, g);
    const cx = pts.reduce((s, p) => s + X(p), 0) / 3, cy = pts.reduce((s, p) => s + Y(p), 0) / 3;
    [...f.code].forEach((b, j) => {
      const yy = cy - 15 + j * 6.2;
      if (b === "1") svgEl("rect", { x: cx - 11, y: yy, width: 22, height: 3.6, class: "octa-net-bar" }, g);
      else for (const xx of [cx - 11, cx + 2]) svgEl("rect", { x: xx, y: yy, width: 9, height: 3.6, class: "octa-net-bar" }, g);
    });
    const tx = svgEl("text", { x: cx.toFixed(1), y: (cy + 10).toFixed(1), "text-anchor": "middle", class: "octa-net-name" }, g);
    tx.append(svgEl("tspan", {}), " ", svgEl("tspan", {}));
    tx.children[0].textContent = data.trigrams[key].nameKo;
    tx.children[1].textContent = data.trigrams[key].natureKo;
    const nm = svgEl("text", { x: cx.toFixed(1), y: (cy + 21).toFixed(1), "text-anchor": "middle", class: "octa-net-step" }, g);
    nm.textContent = String(i + 1);
  });
  for (const [a, b] of folds) svgEl("line", { x1: X(a).toFixed(1), y1: Y(a).toFixed(1), x2: X(b).toFixed(1), y2: Y(b).toFixed(1), class: "octa-net-fold" }, svg);
  $("octa-net").replaceChildren(svg);
}

// ---- 면 고르기 버튼 ----
function drawFaceButtons() {
  $("octa-faces").replaceChildren(...TRIGRAM_ORDERS.xiantian.map((k) => {
    const b = Object.assign(document.createElement("button"), { type: "button", className: "octa-face-btn" });
    b.dataset.trigram = k;
    b.setAttribute("aria-pressed", "false");
    const sym = span("octa-sym", "");
    sym.setAttribute("aria-hidden", "true");
    for (const c of faceOf(k).code) sym.append(span(`octa-bar ${c === "1" ? "is-yang" : "is-yin"}`, ""));
    b.append(sym, nameSpan(k));
    b.addEventListener("click", () => { stopSpin(); select(k); });
    return b;
  }));
}

fetch("../../data/hexagrams.json")
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
  .then((d) => {
    data = d;
    buildFaces();
    drawFaceButtons();
    drawNet();
    draw();
    if (spinning) spinRaf = requestAnimationFrame(spin);
  })
  .catch(() => { $("octa-error").hidden = false; });
