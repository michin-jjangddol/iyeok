// 261122_1945 LAUDE: 원본 261122_1816_options_Shana.js. 윤효점 하위 옵션 '소·다의 음양 대응'(전통 / 아이역 반전) 추가(JJDD).
// 시초점 옵션 화면 (261120_2247 LAUDE). 공용 설정 모듈로 읽고 저장한다.
// 261121_1335: [기본값으로 되돌리기] 뒤 아이폰 사파리에서 고른 카드의 굵은 테두리가 안 보이던 문제(JJDD 제보).
//   스크립트로 바꾼 :checked 를 옆 요소 스타일(:checked + span)이 따라 그리지 않는 경우가 있어,
//   고른 카드의 label 에 is-checked 클래스를 직접 붙여 그 클래스로도 표시한다. 이전 판: 261120_2247_options_Laude.js.
import { loadSettings, saveSettings, DEFAULT_SETTINGS, SIDES, PACES, SIDE_LABELS, PACE_LABELS, READING_METHODS, READING_LABELS, YUN_MAPPINGS, YUN_MAPPING_SHORT } from "../261122_1945_settings_Laude.js";

const form = document.getElementById("yarrow-settings");
const status = document.getElementById("yopt-status");
let settings = loadSettings();

const FIELDS = { readingMethod: { values: READING_METHODS, labels: READING_LABELS }, yunMapping: { values: YUN_MAPPINGS, labels: YUN_MAPPING_SHORT }, takeSide: { values: SIDES, labels: SIDE_LABELS }, pace: { values: PACES, labels: PACE_LABELS } };
const summary = () => `지금 설정: ${SIDE_LABELS[settings.takeSide]} · ${PACE_LABELS[settings.pace]} · ${READING_LABELS[settings.readingMethod]}${settings.readingMethod === "yun" ? ` · ${YUN_MAPPING_SHORT[settings.yunMapping]}` : ""}`;
const sub = document.getElementById("yun-mapping");

function sync(message) {
  for (const name of Object.keys(FIELDS)) {
    for (const input of form.elements[name]) {
      const on = input.value === settings[name];
      input.checked = on;
      input.closest(".option")?.classList.toggle("is-checked", on);
    }
  }
  // 윤효점일 때만 음양 대응을 보여 준다. 값은 정효점으로 바꿔도 그대로 보존한다.
  sub.hidden = settings.readingMethod !== "yun";
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
