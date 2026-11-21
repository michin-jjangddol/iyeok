// 시초점 배우기: '왜 이 효가 나왔나요?' 설명(한국어). 실제 세 차례 기록(차례마다 모아 둔 수)으로 만든다.
// 261121_0843 LAUDE, JJDD 요청(SHANA 요청문 정리). 261121_1219: 소·다를 '4·5는 작은 수, 8·9는 큰 수'로 설명(JJDD).
// 이번 판(261121_1538): 소=양·다=음은 '전통 방식'이고 이 배우기가 그 방식을 따른다고 밝힘(JJDD: 아이역에서는 대응도 선택).
// 이전 판: 261121_1219_why-ko_Laude.js. 계산·분할·확률 규칙은 바꾸지 않는다(procedure 모듈 그대로).
// 소·다 분류: 4·5는 작은 수(소, 少), 8·9는 큰 수(다, 多). 소를 양에, 다를 음에 대응시킨다.
//   (이 절차에서 실제로는 첫 차례에 5 또는 9, 둘째·셋째 차례에 4 또는 8만 나온다. 그래서 차례별로 맞는 수인지도 함께 확인한다.)
//   이름(삼소·일다이소·일소이다·삼다)과 효의 대응은 전통 서법 해설로 알려진 것을 옮겼으나,
//   LAUDE는 문헌을 직접 대조하지 못했다(이 환경에서 원문 사이트 접속 불가). 대응 자체는 이 절차의 산수로
//   양쪽 덜기·모든 분할에서 확인했다(불일치 0). 출처는 화면에 적지 않는다.

export const TOTAL = 50;
export const WORK = 49;
const ORD_KO = ["첫 차례", "둘째 차례", "셋째 차례"];
const SMALL = [5, 4, 4];
const LARGE = [9, 8, 8];

export const PATTERN = {
  3: { name: "삼소", hanja: "三少", value: 9 },
  2: { name: "일다이소", hanja: "一多二少", value: 8 },
  1: { name: "일소이다", hanja: "一少二多", value: 7 },
  0: { name: "삼다", hanja: "三多", value: 6 },
};

export const LINE_INFO = {
  9: { name: "노양", hanja: "老陽", yang: true, moving: true, mark: "×",
       meaning: "양효이므로 이어진 선을 그리고, 변효(×)로 표시합니다. 지괘에서는 음효로 바뀝니다." },
  8: { name: "소음", hanja: "少陰", yang: false, moving: false, mark: "",
       meaning: "음효이므로 끊어진 선을 그립니다. 변효가 아니므로 지괘에서도 음효를 유지합니다." },
  7: { name: "소양", hanja: "少陽", yang: true, moving: false, mark: "",
       meaning: "양효이므로 이어진 선을 그립니다. 변효가 아니므로 지괘에서도 양효를 유지합니다." },
  6: { name: "노음", hanja: "老陰", yang: false, moving: true, mark: "○",
       meaning: "음효이므로 끊어진 선을 그리고, 변효(○)로 표시합니다. 지괘에서는 양효로 바뀝니다." },
};

export const NOTES = {
  smallLarge: "여기서는 덜어 모은 수가 작은 경우(4·5)를 ‘소’, 큰 경우(8·9)를 ‘다’라고 합니다. 전통 방식에서는 소를 양에, 다를 음에 대응시켜 읽으며, 이 배우기도 그 방식을 따릅니다. 소·다는 좌우 무더기의 크기가 아니라, 한 차례에 덜어 모은 수의 크기입니다.",
  oldYoung: "효 이름의 ‘노(老)’는 변하는 상태, ‘소(少)’는 변하지 않는 상태를 뜻합니다. 위의 소·다 분류에서 쓰는 ‘소’와는 다른 말입니다. 효의 수는 홀수(7·9)면 양, 짝수(6·8)면 음입니다.",
};

// gathered: 차례마다 모아 둔 수(3개), final: 세 차례 뒤 작업 자리에 남은 수
export function explainLine(gathered, final) {
  const g = Array.isArray(gathered) ? gathered : [];
  const sum = g.reduce((a, b) => a + b, 0);
  const base = { gathered: g, sum, final, total: 1 + sum + final };
  const kinds = g.map((x, i) => (x === SMALL[i] ? "소" : x === LARGE[i] ? "다" : null));
  const value = final / 4;
  // 예상 밖의 기록은 네 결과 중 하나로 억지로 맞추지 않는다.
  const problems = [];
  if (g.length !== 3) problems.push(`차례 기록이 ${g.length}개입니다(3개여야 합니다).`);
  kinds.forEach((k, i) => { if (!k) problems.push(`${ORD_KO[i] ?? i + 1 + "번째 차례"}에 모은 수(${g[i]})가 ${SMALL[i]}나 ${LARGE[i]}가 아닙니다.`); });
  if (sum + final !== WORK) problems.push(`모은 수(${sum})와 남은 수(${final})의 합이 49가 아닙니다.`);
  if (!Number.isInteger(value) || !LINE_INFO[value]) problems.push(`남은 수(${final})를 넷으로 나눈 값이 6·7·8·9가 아닙니다.`);
  const small = kinds.filter((k) => k === "소").length;
  const pat = PATTERN[small];
  if (!problems.length && pat.value !== value) problems.push(`소·다로 본 수(${pat.value})와 남은 수로 본 수(${value})가 다릅니다.`);
  if (problems.length) return { ...base, ok: false, problems };
  return {
    ...base,
    ok: true,
    rows: g.map((x, i) => ({ ord: ORD_KO[i], count: x, kind: kinds[i] })),
    seq: kinds.join("·"),
    pattern: pat,
    value,
    info: LINE_INFO[value],
  };
}

// 짧은 핵심 한 줄
export const headline = (value) => `이번 효: ${value} · ${LINE_INFO[value].name}(${LINE_INFO[value].hanja})`;
