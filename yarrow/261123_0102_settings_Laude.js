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
export const YUN_MAPPING_LABELS = { traditional: "소양·다음 — 전통 대응", inverted: "소음·다양 — 아이역 반전 대응" };
export const YUN_MAPPING_SHORT = { traditional: "소=양·다=음 · 전통 대응", inverted: "소=음·다=양 · 아이역 반전 대응" };
export const JEONG_MAPPING_SHORT = { traditional: "홀=양·짝=음 · 전통 대응", inverted: "홀=음·짝=양 · 아이역 반전 대응" };
// 읽는 방식에 맞춘 짧은 대응 이름
export const mappingShort = (method, mapping) => (method === "yun" ? YUN_MAPPING_SHORT : JEONG_MAPPING_SHORT)[mapping === "inverted" ? "inverted" : "traditional"];
// 변효 기호(표시만): iyeok 노양 × · 노음 ○(기본) | classic 노양 ○ · 노음 ×. 값 이름은 동전점과 같지만 저장은 따로 한다(동전점 설정은 건드리지 않음).
export const SYMBOLS = ["iyeok", "classic"];
export const SYMBOL_LABELS = { iyeok: "노양 × · 노음 ○", classic: "노양 ○ · 노음 ×" };
export const DEFAULT_SETTINGS = Object.freeze({ takeSide: "right", pace: "step", readingMethod: "jeong", yunMapping: "traditional", symbols: "iyeok" });
export const SIDE_LABELS = { right: "땅 쪽에서 — 오른쪽", left: "하늘 쪽에서 — 왼쪽" };
export const PACE_LABELS = { step: "단계별 진행", fast: "빠르게 진행" };

// 항목마다 따로 확인한다. 알 수 없는 값은 기본값으로, 알 수 없는 항목은 버린다.
function valid(saved) {
  if (!saved || typeof saved !== "object") return null;
  const side = SIDES.includes(saved.takeSide), pace = PACES.includes(saved.pace);
  const reading = READING_METHODS.includes(saved.readingMethod);
  const mapping = YUN_MAPPINGS.includes(saved.yunMapping);
  const symbols = SYMBOLS.includes(saved.symbols);
  if (!side && !pace && !reading && !mapping && !symbols) return null;
  return {
    takeSide: side ? saved.takeSide : DEFAULT_SETTINGS.takeSide,
    pace: pace ? saved.pace : DEFAULT_SETTINGS.pace,
    readingMethod: reading ? saved.readingMethod : DEFAULT_SETTINGS.readingMethod,
    yunMapping: mapping ? saved.yunMapping : DEFAULT_SETTINGS.yunMapping,
    symbols: symbols ? saved.symbols : DEFAULT_SETTINGS.symbols,
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
