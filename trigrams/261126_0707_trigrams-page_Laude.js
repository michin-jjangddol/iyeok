// 261126_0707 LAUDE: 원본 261125_1716_trigrams-page_Laude.js. 선천 순서일 때, 이진수 좌우를 바꾸면 번호가 달라지는 네 괘(태·진·손·간)에
//   '좌우를 바꾸면 001₂ · 값 1' 줄을 눈에 띄게 더한다(JJDD). 좌우가 같은 건·리·감·곤은 그대로.
// 261125_1716 LAUDE: 8괘 페이지. 팔괘 공용 모듈로 목록을 그리고, 순서 선택은 기존 설정과 같은 저장값을 쓴다(중복 설정 없음).
import { trigramList, trigramCode, loadTrigramIcons, loadTrigramOrder, saveTrigramOrder } from "../assets/261125_1716_trigrams-ko_Laude.js";

const form = document.getElementById("order-form");
const box = document.getElementById("trigram-list");
const icons = loadTrigramIcons("../"); // 등록 아이콘(최신 팔괘 목록 → 정보 파일 → icon.current). 실패해도 목록은 그대로
let data = null;

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
  .then((d) => { data = d; render(); })
  .catch(() => { document.getElementById("load-error").hidden = false; });
