// 시초점 옵션 화면 (261120_2247 LAUDE). 공용 설정 모듈로 읽고 저장한다.
// 261121_1335: [기본값으로 되돌리기] 뒤 아이폰 사파리에서 고른 카드의 굵은 테두리가 안 보이던 문제(JJDD 제보).
//   스크립트로 바꾼 :checked 를 옆 요소 스타일(:checked + span)이 따라 그리지 않는 경우가 있어,
//   고른 카드의 label 에 is-checked 클래스를 직접 붙여 그 클래스로도 표시한다. 이전 판: 261120_2247_options_Laude.js.
import { loadSettings, saveSettings, DEFAULT_SETTINGS, SIDES, PACES, SIDE_LABELS, PACE_LABELS, READING_METHODS, READING_LABELS } from "../261122_1816_settings_Shana.js";

const form = document.getElementById("yarrow-settings");
const status = document.getElementById("yopt-status");
let settings = loadSettings();

const FIELDS = { readingMethod: { values: READING_METHODS, labels: READING_LABELS }, takeSide: { values: SIDES, labels: SIDE_LABELS }, pace: { values: PACES, labels: PACE_LABELS, READING_METHODS, READING_LABELS } };
const summary = () => `지금 설정: ${SIDE_LABELS[settings.takeSide]} · ${PACE_LABELS[settings.pace]} · ${READING_LABELS[settings.readingMethod]}`;

function sync(message) {
  for (const name of Object.keys(FIELDS)) {
    for (const input of form.elements[name]) {
      const on = input.value === settings[name];
      input.checked = on;
      input.closest(".option")?.classList.toggle("is-checked", on);
    }
  }
  status.textContent = message ?? summary();
}

form.addEventListener("change", (e) => {
  const f = FIELDS[e.target.name];
  if (!f || !f.values.includes(e.target.value)) return;
  settings = { ...settings, [e.target.name]: e.target.value };
  const saved = saveSettings(settings);
  sync(saved ? `저장했습니다. ${summary()}` : `정했습니다. (이 브라우저에서는 저장할 수 없어 이 화면에서만 유지됩니다) ${summary()}`);
});
form.addEventListener("submit", (e) => e.preventDefault());
document.getElementById("yopt-reset").addEventListener("click", () => {
  settings = { ...DEFAULT_SETTINGS };
  saveSettings(settings);
  sync(`기본값으로 되돌렸습니다. ${summary()}`);
});
// 다른 탭에서 바꾼 경우나 뒤로 가기로 돌아온 경우에도 저장된 값을 보여 준다.
window.addEventListener("pageshow", () => { settings = loadSettings(); sync(); });
window.addEventListener("storage", () => { settings = loadSettings(); sync(); });
sync();
