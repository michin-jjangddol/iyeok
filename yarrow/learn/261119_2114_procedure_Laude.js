// 시초점 배우기: 한 효를 만드는 계산(화면과 분리한 순수 함수).
// 채택 절차(잠정 교육안): 49가지·매 차례 오른쪽에서 하나 덜기·세 차례.
// 근거와 검산: docs/common/261119_1955_yarrow-learning-plan_Shana.md

export const TOTAL = 50;
export const WORK = TOTAL - 1;
export const ROUNDS = 3;

// 넷씩 셀 때 남기는 수: 1~4. 꼭 맞게 나누어떨어지면 마지막 네 가지 한 묶음을 남긴다(없는 가지를 만들지 않는다).
export function remainder(x) {
  if (!Number.isInteger(x) || x < 1) throw new Error("빈 무더기는 셀 수 없습니다");
  return 1 + ((x - 1) % 4);
}

// 왼쪽은 1..N-2: 오른쪽에서 하나를 덜어도 오른쪽에 한 가지 이상 남는다.
export const minLeft = () => 1;
export const maxLeft = (n) => n - 2;

export function round(n, left) {
  if (!Number.isInteger(left) || left < minLeft(n) || left > maxLeft(n)) throw new Error("나눌 수 없는 수입니다");
  const right = n - left;
  const rightRest = right - 1; // 오른쪽에서 하나를 덜고 남은 무더기
  const remLeft = remainder(left);
  const remRight = remainder(rightRest);
  const removed = 1 + remLeft + remRight;
  return {
    n,
    left,
    right,
    rightRest,
    remLeft,
    coreLeft: left - remLeft,
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
export const EXAMPLE = [
  { n: 49, left: 24 },
  { n: 40, left: 18 },
  { n: 36, left: 16 },
];
export function exampleLeft(roundIndex, n) {
  const e = EXAMPLE[roundIndex];
  return e && e.n === n ? e.left : null;
}
