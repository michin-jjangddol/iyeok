// 시초점 옵션: 배우기와 (앞으로의) 찬찬히·빠르게가 함께 쓰는 설정. 이 기기의 localStorage 에만 저장한다(개인정보 없음).
// 261120_2247 LAUDE: 배우기 화면 안에 있던 '하나를 덜어 내는 쪽' 설정을 시초점 메뉴의 [옵션]으로 옮기며 만든 공용 모듈.
//   이전 키(iyeok.yarrow.learn.settings.v1)에 저장된 값이 있으면 이어받는다.
//   항목: takeSide(하나를 덜어 내는 쪽) · pace(진행 방식: step 단계별 진행 | fast 빠르게 진행).
export const STORAGE_KEY = "iyeok.yarrow.settings.v1";
const OLD_KEYS = ["iyeok.yarrow.learn.settings.v1"];
export const SIDES = ["right", "left"];
export const PACES = ["step", "fast"];
export const DEFAULT_SETTINGS = Object.freeze({ takeSide: "right", pace: "step" });
export const SIDE_LABELS = { right: "땅 쪽에서 — 오른쪽", left: "하늘 쪽에서 — 왼쪽" };
export const PACE_LABELS = { step: "단계별 진행", fast: "빠르게 진행" };

// 항목마다 따로 확인한다. 알 수 없는 값은 기본값으로, 알 수 없는 항목은 버린다.
function valid(saved) {
  if (!saved || typeof saved !== "object") return null;
  const side = SIDES.includes(saved.takeSide), pace = PACES.includes(saved.pace);
  if (!side && !pace) return null;
  return { takeSide: side ? saved.takeSide : DEFAULT_SETTINGS.takeSide, pace: pace ? saved.pace : DEFAULT_SETTINGS.pace };
}

export function loadSettings() {
  try {
    for (const key of [STORAGE_KEY, ...OLD_KEYS]) {
      const v = valid(JSON.parse(localStorage.getItem(key)));
      if (v) return v;
    }
  } catch {
    // 저장소를 쓸 수 없으면 기본값으로 시작
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings) {
  const v = valid(settings);
  if (!v) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    for (const key of OLD_KEYS) localStorage.removeItem(key);
    return true;
  } catch {
    return false; // 개인 정보 보호 모드 등에서는 저장하지 않고 계속 진행
  }
}
