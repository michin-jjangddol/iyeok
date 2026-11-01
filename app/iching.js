// 아이역 동전점 계산 — 화면과 분리된 순수 계산 함수

export const POSITION_NAMES = ["초", "이", "삼", "사", "오", "상"];

// 양의 면 개수(0~3)로 효의 종류를 정한다.
// yang: 본괘에서 양인가, changing: 지괘에서 뒤집히는가
export const LINE_TYPES = {
  3: { key: "oldYang", name: "노양", yang: true, changing: true },
  2: { key: "youngYin", name: "소음", yang: false, changing: false },
  1: { key: "youngYang", name: "소양", yang: true, changing: false },
  0: { key: "oldYin", name: "노음", yang: false, changing: true },
};

export function lineTypeFromYangCount(count) {
  const type = LINE_TYPES[count];
  if (!type) throw new Error(`yang count must be 0..3, got ${count}`);
  return type;
}

// 동전 3개를 던진다. 각 동전은 "picture" 또는 "number" 면.
export function tossCoins(random = secureRandom) {
  return [0, 1, 2].map(() => (random() < 0.5 ? "picture" : "number"));
}

export function countYang(faces, yangFace) {
  return faces.filter((face) => face === yangFace).length;
}

// 효를 채우는 순서. 인간괘는 사용자가 매번 자리를 고르므로 고정 순서가 없다.
export function fillOrder(mode) {
  if (mode === "earth") return [0, 1, 2, 3, 4, 5];
  if (mode === "heaven") return [5, 4, 3, 2, 1, 0];
  if (mode === "human") return null;
  throw new Error(`unknown fill mode: ${mode}`);
}

// 본괘와 지괘의 효(아래→위, 1=양 0=음)
export function primaryLines(types) {
  return types.map((t) => (t.yang ? 1 : 0));
}

export function changedLines(types) {
  return types.map((t) => (t.changing ? (t.yang ? 0 : 1) : t.yang ? 1 : 0));
}

export function changingPositions(types) {
  return types.flatMap((t, i) => (t.changing ? [i] : []));
}

// 소성괘 값: 맨 아래 효=1, 가운데=2, 맨 위=4
export function trigramValue(threeLines) {
  return threeLines[0] + threeLines[1] * 2 + threeLines[2] * 4;
}

export function findHexagram(data, lines) {
  const lowerValue = trigramValue(lines.slice(0, 3));
  const upperValue = trigramValue(lines.slice(3, 6));
  const keyOf = (value) =>
    Object.keys(data.trigrams).find((k) => data.trigrams[k].value === value);
  const lower = keyOf(lowerValue);
  const upper = keyOf(upperValue);
  return data.hexagrams.find((h) => h.lower === lower && h.upper === upper);
}

// 효 이름: 양은 구(九), 음은 육(六). 초효·상효는 자리 이름이 앞에 온다.
export function lineName(position, yang) {
  const num = yang ? "구" : "육";
  if (position === 0) return `초${num}`;
  if (position === 5) return `상${num}`;
  return `${num}${POSITION_NAMES[position]}`;
}

function secureRandom() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 2 ** 32;
}
