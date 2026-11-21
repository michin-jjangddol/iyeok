// 시초점 메뉴 (261121_1936 LAUDE): 지금 방식 요약. 시초점 옵션(이 기기 저장)을 읽기만 한다.
import { loadSettings, SIDE_LABELS, PACE_LABELS } from "./261120_2247_settings_Laude.js";

function show() {
  const s = loadSettings();
  document.getElementById("ymenu-side").textContent = SIDE_LABELS[s.takeSide];
  document.getElementById("ymenu-pace").textContent = PACE_LABELS[s.pace];
}
show();
// 옵션 화면에서 돌아오거나(뒤로 가기 캐시 포함) 다른 탭에서 바꾼 경우
window.addEventListener("pageshow", show);
window.addEventListener("storage", show);
