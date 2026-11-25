// 261126_0725 LAUDE: 원본 261126_0707_trigrams-page_Laude.js. 소개 아래에 팔괘 배치 두 가지(괘상 → 그림)를 더한다(JJDD 배치).
//     하늘        바람
//          우레
//     물          산
//           불
//     못          땅
//   배치는 보는 순서 설정과 상관없이 늘 같다. 그림을 못 불러오면 그림 배치만 숨기고 나머지는 그대로.
// 261126_0707 LAUDE: 선천 순서일 때, 이진수 좌우를 바꾸면 번호가 달라지는 네 괘(태·진·손·간)에 '좌우를 바꾸면 001₂ · 값 1' 줄.
// 261125_1716 LAUDE: 8괘 페이지. 팔괘 공용 모듈로 목록을 그리고, 순서 선택은 기존 설정과 같은 저장값을 쓴다(중복 설정 없음).
import { trigramList, trigramCode, loadTrigramIcons, loadTrigramOrder, saveTrigramOrder } from "../assets/261125_1716_trigrams-ko_Laude.js";

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
  .then((d) => { data = d; drawMaps(); render(); })
  .catch(() => { document.getElementById("load-error").hidden = false; });
