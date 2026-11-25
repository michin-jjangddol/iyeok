// 261125_1716 LAUDE: 8괘 페이지. 팔괘 공용 모듈로 목록을 그리고, 순서 선택은 기존 설정과 같은 저장값을 쓴다(중복 설정 없음).
import { trigramList, loadTrigramIcons, loadTrigramOrder, saveTrigramOrder, GUIDE_NOTE } from "../assets/261125_1716_trigrams-ko_Laude.js";

const form = document.getElementById("order-form");
const box = document.getElementById("trigram-list");
const icons = loadTrigramIcons("../"); // 등록 아이콘(최신 팔괘 목록 → 정보 파일 → icon.current). 실패해도 목록은 그대로
let data = null;

function render() {
  const order = loadTrigramOrder();
  for (const input of form.elements.trigramOrder) {
    input.checked = input.value === order;
    input.closest(".tri-option").classList.toggle("is-checked", input.value === order);
  }
  for (const p of document.querySelectorAll(".tri-desc")) p.hidden = p.dataset.order !== order;
  if (data) box.replaceChildren(trigramList(data, { icons, order, showCode: true }));
}
form.addEventListener("change", (e) => {
  if (e.target.name !== "trigramOrder") return;
  saveTrigramOrder(e.target.value); // 저장할 수 없는 브라우저면 이 화면에서만 바뀐다
  const order = e.target.value;
  for (const input of form.elements.trigramOrder) input.closest(".tri-option").classList.toggle("is-checked", input.value === order);
  for (const p of document.querySelectorAll(".tri-desc")) p.hidden = p.dataset.order !== order;
  if (data) box.replaceChildren(trigramList(data, { icons, order, showCode: true }));
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
