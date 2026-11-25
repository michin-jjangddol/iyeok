// 261126_0821 LAUDE: 원본 261126_0805_trigrams-page_Laude.js. 맨 아래 '효로 셈하기'(효 차이·더하기·곱하기, 직접 해 보기)를 더한다(JJDD).
// 261126_0805 LAUDE: 원본 261126_0736_trigrams-page_Laude.js. 맨 아래 '짝으로 보기'(반대 짝·비슷한 짝·접으면 마주 보는 짝) 카드를 그린다(JJDD).
// 261126_0736 LAUDE: 원본 261126_0725_trigrams-page_Laude.js. 팔괘 배치 아래에 '순서 따라가기' 그림 두 장(선천·아이역)을 더한다(JJDD).
//   같은 배치 위에 순서대로 화살표(1~7)를 잇고, 지금 고른 순서에 '지금 고른 순서' 표시. 순서는 공용 모듈의 TRIGRAM_ORDERS 그대로.
// 261126_0725 LAUDE: 소개 아래에 팔괘 배치 두 가지(괘상 → 그림)(JJDD 배치).
//     하늘        바람
//          우레
//     물          산
//           불
//     못          땅
//   배치는 보는 순서 설정과 상관없이 늘 같다. 그림을 못 불러오면 그림 배치만 숨기고 나머지는 그대로.
// 261126_0707 LAUDE: 선천 순서일 때, 이진수 좌우를 바꾸면 번호가 달라지는 네 괘(태·진·손·간)에 '좌우를 바꾸면 001₂ · 값 1' 줄.
// 261125_1716 LAUDE: 8괘 페이지. 팔괘 공용 모듈로 목록을 그리고, 순서 선택은 기존 설정과 같은 저장값을 쓴다(중복 설정 없음).
import { trigramList, trigramCode, loadTrigramIcons, loadTrigramOrder, saveTrigramOrder, TRIGRAM_ORDERS } from "../assets/261125_1716_trigrams-ko_Laude.js";

const form = document.getElementById("order-form");
const box = document.getElementById("trigram-list");
const icons = loadTrigramIcons("../"); // 등록 아이콘(최신 팔괘 목록 → 정보 파일 → icon.current). 실패해도 목록은 그대로
let data = null;

// 팔괘 배치: [괘, 열, 줄] — 왼쪽 열 1, 가운데 2, 오른쪽 3
const MAP = [["qian", 1, 1], ["xun", 3, 1], ["zhen", 2, 2], ["kan", 1, 3], ["gen", 3, 3], ["li", 2, 4], ["dui", 1, 5], ["kun", 3, 5]];
function mapCell(k, col, row, visual) {
  const t = data.trigrams[k];
  const cell = document.createElement("div");
  cell.className = "tri-map-cell";
  cell.dataset.trigram = k;
  cell.style.gridColumn = col;
  cell.style.gridRow = row;
  const art = Object.assign(document.createElement("span"), { className: "tri-map-art" });
  art.setAttribute("aria-hidden", "true");
  art.append(visual);
  cell.append(art, Object.assign(document.createElement("span"), { className: "tri-map-name", textContent: t.natureKo }));
  return cell;
}
function bars(t) {
  const sym = Object.assign(document.createElement("span"), { className: "tri-map-sym" });
  for (const yang of [...t.lines].reverse()) sym.append(Object.assign(document.createElement("span"), { className: `tri-bar ${yang ? "is-yang" : "is-yin"}` }));
  return sym;
}
function drawMaps() {
  const symMap = document.getElementById("map-symbols"), imgMap = document.getElementById("map-images");
  symMap.replaceChildren(...MAP.map(([k, c, r]) => mapCell(k, c, r, bars(data.trigrams[k]))));
  icons.then((m) => {
    const cells = MAP.filter(([k]) => m?.get(k)).map(([k, c, r]) => {
      const img = Object.assign(document.createElement("img"), { src: m.get(k).src, alt: "", width: 64, height: 64, decoding: "async" });
      img.addEventListener("error", () => {
        img.remove();
        if (!imgMap.querySelector("img")) imgMap.hidden = true; // 그림이 하나도 없으면 그림 배치만 숨긴다
      });
      return mapCell(k, c, r, img);
    });
    imgMap.replaceChildren(...cells);
    imgMap.hidden = cells.length === 0;
  });
}

// ---- 순서 따라가기: 같은 배치 위에 화살표 ----
const NS = "http://www.w3.org/2000/svg";
const svgEl = (name, attrs, parent) => {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent?.append(e);
  return e;
};
const PX = { 1: 62, 2: 160, 3: 258 }, PY = (r) => 34 + (r - 1) * 74;
// 화살표가 다른 괘 상자를 지나가지 않도록 휘는 정도(기본 14). 양수·음수는 진행 방향 기준 왼쪽·오른쪽.
const BOWS = { xiantian: { "qian>dui": 40, "xun>kan": 75 }, iyeok: { "gen>dui": -80, "qian>xun": 0 } };
function pathSvg(order) {
  const seq = TRIGRAM_ORDERS[order];
  const pos = Object.fromEntries(MAP.map(([k, c, r]) => [k, [PX[c], PY(r)]]));
  const svg = svgEl("svg", { viewBox: "0 0 320 364", class: "tri-path-svg", "aria-hidden": "true", focusable: "false" });
  const mid = `tri-arrow-${order}`;
  const marker = svgEl("marker", { id: mid, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, svgEl("defs", {}, svg));
  svgEl("path", { d: "M0 0 L10 5 L0 10 z", class: "tri-path-head" }, marker);
  const labels = [];
  seq.slice(0, -1).forEach((k, i) => {
    const n = seq[i + 1], [x1, y1] = pos[k], [x2, y2] = pos[n];
    const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const bow = BOWS[order]?.[`${k}>${n}`] ?? 14;
    const mx = (x1 + x2) / 2 - uy * bow, my = (y1 + y2) / 2 + ux * bow;
    const edge = (x, y) => { const d = Math.hypot(mx - x, my - y); return [x + ((mx - x) / d) * 27, y + ((my - y) / d) * 27]; };
    const s = edge(x1, y1), e = edge(x2, y2);
    svgEl("path", { d: `M${s[0].toFixed(1)} ${s[1].toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`, class: "tri-path-line", "marker-end": `url(#${mid})`, "data-step": i + 1 }, svg);
    const t = 0.32, q = (a, b, c) => (1 - t) ** 2 * a + 2 * t * (1 - t) * b + t * t * c;
    labels.push([q(s[0], mx, e[0]), q(s[1], my, e[1]), i + 1]);
  });
  // 번호는 모든 화살표 위에(가리지 않게)
  for (const [x, y, n] of labels) {
    svgEl("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: 9.5, class: "tri-path-dot" }, svg);
    svgEl("text", { x: x.toFixed(1), y: (y + 4).toFixed(1), class: "tri-path-num", "text-anchor": "middle" }, svg).textContent = n;
  }
  // 괘 상자(효 막대 + 자연 이름 — 이름은 영어 사전으로 바뀐다)
  for (const [k, c, r] of MAP) {
    const [x, y] = [PX[c], PY(r)];
    svgEl("rect", { x: x - 25, y: y - 25, width: 50, height: 50, rx: 8, class: "tri-path-box" }, svg);
    svgEl("text", { x, y: y + 20, class: "tri-path-name", "text-anchor": "middle" }, svg).textContent = data.trigrams[k].natureKo;
    [...trigramCode(data.trigrams[k])].forEach((b, i) => {
      const yy = y - 17 + i * 9;
      if (b === "1") svgEl("rect", { x: x - 15, y: yy, width: 30, height: 5.5, class: "tri-path-bar" }, svg);
      else for (const xx of [x - 15, x + 3]) svgEl("rect", { x: xx, y: yy, width: 12, height: 5.5, class: "tri-path-bar" }, svg);
    });
    const at = seq.indexOf(k);
    if (at === 0 || at === seq.length - 1) svgEl("text", { x: x + 29, y: y - 16, class: "tri-path-end" }, svg).textContent = at === 0 ? "시작" : "끝";
  }
  return svg;
}
function drawPaths() {
  for (const fig of document.querySelectorAll(".tri-path[data-order]")) {
    const order = fig.dataset.order;
    // 차례 글: 이름 조각마다 따로(영어 사전이 '건'→Qian 처럼 낱말로 바꾼다)
    const seq = fig.querySelector(".tri-path-seq");
    seq.replaceChildren();
    TRIGRAM_ORDERS[order].forEach((k, i) => {
      const t = data.trigrams[k];
      if (i) seq.append(" → ");
      seq.append(Object.assign(document.createElement("span"), { textContent: t.nameKo }), "(", Object.assign(document.createElement("span"), { textContent: t.natureKo }), ")");
    });
    fig.querySelector(".tri-path-svg")?.remove();
    fig.append(pathSvg(order));
  }
}
function markPath(order) {
  for (const fig of document.querySelectorAll(".tri-path[data-order]")) fig.classList.toggle("is-current", fig.dataset.order === order);
}

// ---- 261126_0805: 짝으로 보기 ----
const OPPOSITE = [["qian", "kun"], ["kan", "li"], ["dui", "gen"], ["zhen", "xun"]];
const SIMILAR = [["kan", "dui"], ["qian", "xun"], ["li", "zhen"], ["kun", "gen"]];
const span = (cls, text) => Object.assign(document.createElement("span"), { className: cls, textContent: text });
// 작은 괘: 효 막대(위 효부터) + 자연 이름. diff: 색으로 표시할 효 자리(0 = 위 효, 2 = 아래 효)
function mini(k, diff = -1) {
  const t = data.trigrams[k], code = trigramCode(t);
  const box = span("tri-mini", "");
  const sym = span("tri-mini-sym", "");
  sym.setAttribute("aria-hidden", "true");
  [...code].forEach((b, i) => sym.append(span(`tri-bar ${b === "1" ? "is-yang" : "is-yin"}${i === diff ? " is-diff" : ""}`, "")));
  const name = span("tri-mini-name", "");
  name.append(span("", t.nameKo), "(", span("", t.natureKo), ")");
  box.append(sym, name, span("tri-mini-code", `${code}₂`));
  return box;
}
function pairCard(a, b, kind) {
  const card = document.createElement("div");
  card.className = `tri-pair is-${kind}`;
  card.dataset.pair = `${a}-${b}`;
  const ca = trigramCode(data.trigrams[a]), cb = trigramCode(data.trigrams[b]);
  const diff = kind === "similar" ? [...ca].findIndex((c, i) => c !== cb[i]) : -1;
  const row = span("tri-pair-row", "");
  row.append(mini(a, diff), span("tri-pair-sign", kind === "opposite" ? "↔" : "·"), mini(b, diff));
  const va = parseInt(ca, 2), vb = parseInt(cb, 2);
  card.append(row, kind === "opposite"
    ? span("tri-pair-sum", `${va} + ${vb} = 7`)
    : span("tri-pair-diff", diff === 0 ? "위 효가 다름" : "아래 효가 다름"));
  return card;
}
function drawPairs() {
  document.getElementById("pairs-opposite").replaceChildren(...OPPOSITE.map(([a, b]) => pairCard(a, b, "opposite")));
  document.getElementById("pairs-similar").replaceChildren(...SIMILAR.map(([a, b]) => pairCard(a, b, "similar")));
  const fold = document.getElementById("pairs-fold");
  fold.replaceChildren(...["xiantian", "iyeok"].map((order) => {
    const seq = TRIGRAM_ORDERS[order];
    const row = document.createElement("div");
    row.className = "tri-fold-row";
    row.dataset.order = order;
    row.append(span("tri-fold-label", order === "xiantian" ? "선천 순서" : "아이역 순서"));
    const chips = span("tri-fold-chips", "");
    for (let i = 0; i < 4; i++) {
      const a = data.trigrams[seq[i]], b = data.trigrams[seq[7 - i]];
      const chip = span("tri-fold-chip", "");
      chip.append(span("tri-fold-pos", `${i + 1} ↔ ${8 - i}`), span("", a.nameKo), " ↔ ", span("", b.nameKo));
      chips.append(chip);
    }
    row.append(chips);
    return row;
  }));
}

// ---- 261126_0821: 효로 셈하기 — 두 괘를 골라 효 차이·더하기(같으면 0, 다르면 1)·곱하기(둘 다 1이면 1) ----
const calc = { a: "kan", b: "dui" };
const byCode = (c) => Object.keys(data.trigrams).find((k) => trigramCode(data.trigrams[k]) === c);
function drawCalc(order) {
  const seq = TRIGRAM_ORDERS[order] ?? TRIGRAM_ORDERS.xiantian;
  for (const fs of document.querySelectorAll(".tri-pick")) {
    const slot = fs.dataset.slot;
    fs.querySelector(".tri-pick-row").replaceChildren(...seq.map((k) => {
      const label = document.createElement("label");
      label.className = "tri-pick-opt";
      const input = Object.assign(document.createElement("input"), { type: "radio", name: `calc-${slot}`, value: k, checked: calc[slot] === k });
      input.addEventListener("change", () => { calc[slot] = k; showCalc(); });
      label.append(input, mini(k));
      return label;
    }));
  }
  showCalc();
}
function showCalc() {
  const ca = trigramCode(data.trigrams[calc.a]), cb = trigramCode(data.trigrams[calc.b]);
  const add = [...ca].map((c, i) => (c === cb[i] ? "0" : "1")).join("");
  const mul = [...ca].map((c, i) => (c === "1" && cb[i] === "1" ? "1" : "0")).join("");
  const out = document.getElementById("calc-out");
  out.querySelector('[data-op="diff"] .tri-calc-val').replaceChildren(span("tri-calc-num", String([...add].filter((c) => c === "1").length)));
  out.querySelector('[data-op="add"] .tri-calc-val').replaceChildren(mini(byCode(add)));
  out.querySelector('[data-op="mul"] .tri-calc-val').replaceChildren(mini(byCode(mul)));
  out.dataset.result = `${calc.a}-${calc.b}:${add}:${mul}`;
}

function list(order) {
  const ul = trigramList(data, { icons, order, showCode: true });
  if (order === "xiantian") {
    for (const li of ul.children) {
      const code = trigramCode(data.trigrams[li.dataset.trigram]);
      const flipped = [...code].reverse().join("");
      if (flipped === code) continue;
      // 글은 한 덩어리(사전 문장 틀 '좌우를 바꾸면 {c}₂ · 값 {v}'로 영어가 된다). 화살표는 CSS 로 붙인다.
      const flip = Object.assign(document.createElement("span"), { className: "trigram-flip", textContent: `좌우를 바꾸면 ${flipped}₂ · 값 ${parseInt(flipped, 2)}` });
      li.querySelector(".trigram-code").after(flip);
      li.classList.add("has-flip");
    }
  }
  return ul;
}
function show(order) {
  for (const input of form.elements.trigramOrder) {
    input.checked = input.value === order;
    input.closest(".tri-option").classList.toggle("is-checked", input.value === order);
  }
  for (const p of document.querySelectorAll(".tri-desc")) p.hidden = p.dataset.order !== order;
  markPath(order);
  if (data) drawCalc(order); // 고르기 칸도 지금 순서대로
  if (data) box.replaceChildren(list(order));
}
const render = () => show(loadTrigramOrder());
form.addEventListener("change", (e) => {
  if (e.target.name !== "trigramOrder") return;
  saveTrigramOrder(e.target.value); // 저장할 수 없는 브라우저면 이 화면에서만 바뀐다
  show(e.target.value);
});
form.addEventListener("submit", (e) => e.preventDefault());
// 다른 탭(설정 화면 등)에서 바꾸거나 뒤로 가기로 돌아온 경우
window.addEventListener("storage", render);
window.addEventListener("pageshow", render);

render();
fetch("../data/hexagrams.json")
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
  .then((d) => { data = d; drawMaps(); drawPaths(); drawPairs(); render(); })
  .catch(() => { document.getElementById("load-error").hidden = false; });
