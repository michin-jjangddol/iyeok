// 시초점 배우기: 한 효를 만드는 계산(화면과 분리한 순수 함수).
// 이전 판: 261119_2114_procedure_Laude.js (매 차례 오른쪽에서 하나 덜기로 고정).
// 이번 판(261120_2155): '하나를 덜어 내는 쪽'을 고를 수 있게 했다. side = "right"(기본, 땅 쪽) | "left"(하늘 쪽).
//   side 를 주지 않으면 이전 판과 똑같이 계산한다.
// 채택 절차(잠정 교육안): 49가지·세 차례. 근거와 검산: docs/common/261119_1955_yarrow-learning-plan_Shana.md
// 「계사전」 '掛一以象三' 구절에는 어느 무더기에서 덜지 적혀 있지 않다. 왼쪽=하늘·오른쪽=땅은 아이역의 학습용 배치다.

export const TOTAL = 50;
export const WORK = TOTAL - 1;
export const ROUNDS = 3;
export const SIDES = ["right", "left"];
export const DEFAULT_SIDE = "right";
const sideOf = (side) => (side === "left" ? "left" : "right");

// 넷씩 셀 때 남기는 수: 1~4. 꼭 맞게 나누어떨어지면 마지막 네 가지 한 묶음을 남긴다(없는 가지를 만들지 않는다).
export function remainder(x) {
  if (!Number.isInteger(x) || x < 1) throw new Error("빈 무더기는 셀 수 없습니다");
  return 1 + ((x - 1) % 4);
}

// 하나를 덜어 낼 무더기에는 두 가지 이상, 다른 무더기에는 한 가지 이상 있어야 한다(대칭).
//   오른쪽에서 덜기: 왼쪽 1..N-2 / 왼쪽에서 덜기: 왼쪽 2..N-1
export const minLeft = (n, side) => (sideOf(side) === "left" ? 2 : 1);
export const maxLeft = (n, side) => (sideOf(side) === "left" ? n - 1 : n - 2);

export function round(n, left, side) {
  const s = sideOf(side);
  if (!Number.isInteger(left) || left < minLeft(n, s) || left > maxLeft(n, s)) throw new Error("나눌 수 없는 수입니다");
  const right = n - left;
  const leftRest = s === "left" ? left - 1 : left; // 하나를 덜고 남은 왼쪽
  const rightRest = s === "right" ? right - 1 : right; // 하나를 덜고 남은 오른쪽
  const remLeft = remainder(leftRest);
  const remRight = remainder(rightRest);
  const removed = 1 + remLeft + remRight;
  return {
    n,
    side: s,
    left,
    right,
    leftRest,
    rightRest,
    remLeft,
    coreLeft: leftRest - remLeft,
    remRight,
    coreRight: rightRest - remRight,
    removed,
    next: n - removed,
  };
}

export const LINES = {
  6: { value: 6, name: "노음", desc: "변하는 음", yang: false, moving: true, mark: "○" },
  7: { value: 7, name: "소양", desc: "변하지 않는 양", yang: true, moving: false, mark: "" },
  8: { value: 8, name: "소음", desc: "변하지 않는 음", yang: false, moving: false, mark: "" },
  9: { value: 9, name: "노양", desc: "변하는 양", yang: true, moving: true, mark: "×" },
};

export function lineOf(finalCount) {
  if (finalCount % 4 !== 0 || !LINES[finalCount / 4]) throw new Error("효를 정할 수 없는 수입니다");
  return LINES[finalCount / 4];
}

// 예시 따라가기: 첫 차례부터 예시를 따랐을 때의 수(49 → 40 → 36 → 28 → 7).
// 왼쪽에서 덜 때는 좌우를 맞바꾼 수(왼쪽 = N − 예시)를 써서 같은 흐름이 되게 한다.
export const EXAMPLE = [
  { n: 49, left: 24 },
  { n: 40, left: 18 },
  { n: 36, left: 16 },
];
export function exampleLeft(roundIndex, n, side) {
  const e = EXAMPLE[roundIndex];
  if (!e || e.n !== n) return null;
  return sideOf(side) === "left" ? n - e.left : e.left;
}
