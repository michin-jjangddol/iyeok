// 261123_1831 LAUDE: 원본 261121_1936_yarrow-menu_Laude.js. 지금 설정 모듈로 읽고, 효 읽기·변효 기호도 요약한다(바로 시작 연결).
// 시초점 메뉴: 지금 방식 요약. 시초점 설정(이 기기 저장)을 읽기만 한다.
import { loadSettings, SIDE_LABELS, PACE_LABELS, READING_LABELS, mappingShort, SYMBOL_LABELS } from "./261123_1036_settings_Laude.js";

function show() {
  const s = loadSettings();
  document.getElementById("ymenu-side").textContent = SIDE_LABELS[s.takeSide];
  document.getElementById("ymenu-pace").textContent = PACE_LABELS[s.pace];
  document.getElementById("ymenu-reading").textContent = `${READING_LABELS[s.readingMethod]} · ${mappingShort(s.readingMethod, s.yunMapping)}`;
  document.getElementById("ymenu-symbols").textContent = SYMBOL_LABELS[s.symbols];
}
show();
// 설정 화면에서 돌아오거나(뒤로 가기 캐시 포함) 다른 탭에서 바꾼 경우
window.addEventListener("pageshow", show);
window.addEventListener("storage", show);
