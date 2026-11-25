// 261125_1255 LAUDE: 「하나와 둘」 — 아이역 언어 설정에 맞는 판(한국어/English)을 보여 준다.
// 언어 모듈이 고른 언어(getLanguage, iyeok:languagechange)를 따른다. 영어가 아직 '준비 중'이면 html lang 은 ko 로 남으므로 lang 은 보지 않는다.
// 처음에는 저장된 언어로 바로 정해 깜빡임을 줄인다.
const KEY = "iyeok.language.v1"; // 언어 모듈과 같은 저장 키
const articles = [...document.querySelectorAll("[data-essay]")];
function show(lang) {
  const want = lang === "en" ? "en" : "ko";
  for (const a of articles) a.hidden = a.dataset.essay !== want;
  document.title = want === "en" ? "One and Two · iYeok" : "하나와 둘 · 아이역 iYeok";
}
let saved = "ko";
try { saved = localStorage.getItem(KEY) || "ko"; } catch { /* 저장소를 못 쓰면 한국어 */ }
show(saved);
window.addEventListener("iyeok:languagechange", (e) => show(e.detail?.requested));
if (window.iyeokLanguage) show(window.iyeokLanguage.getLanguage());
