// 261123_1036 LAUDE: 원본 261123_0745_settings_Laude.js. 화면 글 '전통 대응' → '전통 방식', '아이역 반전 대응' → '아이역 방식'(JJDD). 동작·저장값 변경 없음.
// 261123_0745 LAUDE: 원본 261123_0709_settings_Laude.js. 빠르기 범위를 두 배로 넓힘: 1 = 10.24초, 9 = 1초(JJDD).
// 261123_0709 LAUDE: 원본 261123_0102_settings_Laude.js. 정시초 나누기 시작점·방향(motionStart)과 빠르기(motionSpeed) 추가(JJDD).
// 261123_0102 LAUDE: 원본 261122_2047_settings_Laude.js. 변효 기호(symbols) 추가(JJDD·SHANA 요청). 없거나 잘못된 값은 기본값(노양 × · 노음 ○).
// 261122_2047 LAUDE: 원본 261122_1945_settings_Laude.js. 음양 대응을 정효점에도 적용(홀양짝음 / 홀음짝양, JJDD). 저장 키·값은 그대로.
// 261122_1945 LAUDE: 원본 261122_1816_settings_Shana.js. 윤효점의 소·다 음양 대응(yunMapping) 추가(JJDD). 저장값이 없거나 잘못되면 전통 대응.
// 시초점 옵션: 배우기와 (앞으로의) 찬찬히·빠르게가 함께 쓰는 설정. 이 기기의 localStorage 에만 저장한다(개인정보 없음).
// 261120_2247 LAUDE: 배우기 화면 안에 있던 '하나를 덜어 내는 쪽' 설정을 시초점 메뉴의 [옵션]으로 옮기며 만든 공용 모듈.
//   이전 키(iyeok.yarrow.learn.settings.v1)에 저장된 값이 있으면 이어받는다.
//   항목: takeSide(하나를 덜어 내는 쪽) · pace(진행 방식: step 단계별 진행 | fast 빠르게 진행).
export const STORAGE_KEY = "iyeok.yarrow.settings.v1";
const OLD_KEYS = ["iyeok.yarrow.learn.settings.v1"];
export const SIDES = ["right", "left"];
export const READING_METHODS = ["jeong", "yun"];
export const READING_LABELS = { jeong: "정효점", yun: "윤효점" };
export const PACES = ["step", "fast"];
// 음양 대응(저장 이름은 호환을 위해 yunMapping 그대로). 정효점·윤효점 모두에 적용한다.
//   traditional 전통(기본): 정효점 홀=양·짝=음, 윤효점 소=양·다=음
//   inverted 아이역 반전: 정효점 홀=음·짝=양, 윤효점 소=음·다=양 (두 방식 모두 6↔9, 7↔8, 변효 여부는 그대로)
export const YUN_MAPPINGS = ["traditional", "inverted"];
export const YUN_MAPPING_LABELS = { traditional: "소양·다음 — 전통 방식", inverted: "소음·다양 — 아이역 방식" };
export const YUN_MAPPING_SHORT = { traditional: "소=양·다=음 · 전통 방식", inverted: "소=음·다=양 · 아이역 방식" };
export const JEONG_MAPPING_SHORT = { traditional: "홀=양·짝=음 · 전통 방식", inverted: "홀=음·짝=양 · 아이역 방식" };
// 읽는 방식에 맞춘 짧은 대응 이름
export const mappingShort = (method, mapping) => (method === "yun" ? YUN_MAPPING_SHORT : JEONG_MAPPING_SHORT)[mapping === "inverted" ? "inverted" : "traditional"];
// 변효 기호(표시만): iyeok 노양 × · 노음 ○(기본) | classic 노양 ○ · 노음 ×. 값 이름은 동전점과 같지만 저장은 따로 한다(동전점 설정은 건드리지 않음).
export const SYMBOLS = ["iyeok", "classic"];
export const SYMBOL_LABELS = { iyeok: "노양 × · 노음 ○", classic: "노양 ○ · 노음 ×" };
// 정시초 나누기(움직이다 멈추기): 선택바가 어디서 시작해 어느 쪽으로 먼저 움직이는지(motionStart)와 빠르기(motionSpeed 1~9).
//   이름은 JJDD가 정한 대로: 첫 글자 = 시작 자리(좌 = 왼쪽, 중 = 가운데, 우 = 오른쪽), 나머지 = 먼저 움직이는 쪽.
//   좌좌좌·우우우는 끝에서 시작한다. 중우(가운데 → 오른쪽)가 기본값이며 이전 동작과 같다.
//   빠르기 5 = 이전 속도(왕복 3.2초). 1은 느리게(10.24초), 9는 빠르게(1초). 계산 규칙은 바꾸지 않는다.
//   261123_0745: 양 끝을 0709 판(5.12초·2초)보다 두 배 더 느리게·빠르게(JJDD). 한 칸마다 약 1.34배.
export const MOTION_STARTS = ["LLL", "LL", "LC", "CL", "CR", "RL", "RR", "RRR"];
export const MOTION_START_LABELS = { LLL: "좌좌좌", LL: "좌좌", LC: "좌중", CL: "중좌", CR: "중우", RL: "우좌", RR: "우우", RRR: "우우우" };
export const MOTION_START_DESC = {
  LLL: "왼쪽 끝에서 오른쪽으로", LL: "왼쪽 1/4에서 왼쪽으로", LC: "왼쪽 1/4에서 가운데 쪽으로", CL: "가운데에서 왼쪽으로",
  CR: "가운데에서 오른쪽으로", RL: "오른쪽 1/4에서 가운데 쪽으로", RR: "오른쪽 1/4에서 오른쪽으로", RRR: "오른쪽 끝에서 왼쪽으로",
};
const START_POS = { LLL: [0, 1], LL: [0.25, -1], LC: [0.25, 1], CL: [0.5, -1], CR: [0.5, 1], RL: [0.75, -1], RR: [0.75, 1], RRR: [1, -1] };
export const MOTION_SPEEDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
export const motionPeriod = (speed) => Math.round(3200 * 3.2 ** ((5 - (Number(speed) || 5)) / 4));
// 삼각파 위상 x(0..1)에서 위치 = x<0.5 ? 2x : 2−2x. 시작 위치 p, 방향 d(+1 오른쪽, −1 왼쪽)에 맞는 시작 위상을 돌려준다.
export function motionConfig(s) {
  const [p, d] = START_POS[s?.motionStart] ?? START_POS.CR;
  return { start: p, offset: d > 0 ? p / 2 : (1 - p / 2) % 1, period: motionPeriod(s?.motionSpeed) };
}
export const DEFAULT_SETTINGS = Object.freeze({ takeSide: "right", pace: "step", readingMethod: "jeong", yunMapping: "traditional", symbols: "iyeok", motionStart: "CR", motionSpeed: "5" });
export const SIDE_LABELS = { right: "땅 쪽에서 — 오른쪽", left: "하늘 쪽에서 — 왼쪽" };
export const PACE_LABELS = { step: "단계별 진행", fast: "빠르게 진행" };

// 항목마다 따로 확인한다. 알 수 없는 값은 기본값으로, 알 수 없는 항목은 버린다.
function valid(saved) {
  if (!saved || typeof saved !== "object") return null;
  const side = SIDES.includes(saved.takeSide), pace = PACES.includes(saved.pace);
  const reading = READING_METHODS.includes(saved.readingMethod);
  const mapping = YUN_MAPPINGS.includes(saved.yunMapping);
  const symbols = SYMBOLS.includes(saved.symbols);
  const mStart = MOTION_STARTS.includes(saved.motionStart), mSpeed = MOTION_SPEEDS.includes(String(saved.motionSpeed));
  if (!side && !pace && !reading && !mapping && !symbols && !mStart && !mSpeed) return null;
  return {
    takeSide: side ? saved.takeSide : DEFAULT_SETTINGS.takeSide,
    pace: pace ? saved.pace : DEFAULT_SETTINGS.pace,
    readingMethod: reading ? saved.readingMethod : DEFAULT_SETTINGS.readingMethod,
    yunMapping: mapping ? saved.yunMapping : DEFAULT_SETTINGS.yunMapping,
    symbols: symbols ? saved.symbols : DEFAULT_SETTINGS.symbols,
    motionStart: mStart ? saved.motionStart : DEFAULT_SETTINGS.motionStart,
    motionSpeed: mSpeed ? String(saved.motionSpeed) : DEFAULT_SETTINGS.motionSpeed,
  };
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
