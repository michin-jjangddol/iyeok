// 261122_2014 LAUDE: 원본 261122_1945_why-ko_Laude.js. 윤효점에서는 정효점의 수(6·7·8·9)를 보이지 않고, 소·다를 양(+)·음(−)으로 보여 효를 정한다(JJDD).
// 261122_1945 LAUDE: 원본 261122_1933_why-ko_Shana.js. 윤효점 소·다 음양 대응(전통 / 아이역 반전) 추가(JJDD).
//   e.value 는 언제나 정시초 산수(최종 정시초 ÷ 4)이고, 화면과 괘에 쓰는 값은 appliedLine()으로 따로 구한다(반전이면 15 − 값).
// 261122_1933 SHANA: 화면 영역·요약·설명에서 시초 이름 뒤의 자리 표현을 생략. 계산과 동작은 유지.
// 261122_1833 LAUDE: 원본 261122_1816_why-ko_Shana.js. 사람시초 → 인시초, 태시초·윤시초 이름 반영(JJDD). 계산 변경 없음.
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
  oldYoungYun: "효 이름의 ‘노(老)’는 변하는 상태, ‘소(少)’는 변하지 않는 상태를 뜻합니다. 소·다 분류에서 쓰는 ‘소’와는 다른 말입니다. 셋 중 하나만 다르면 그 하나가 효의 음양을 정하고(변하지 않는 효), 셋이 모두 같으면 변하는 효가 됩니다.",
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


// JJDD's iYeok learning terms: two readings of one unchanged calculation.
export const TERM_NOTE = "태시초·정시초·윤시초·인시초와 정효점·윤효점은 전통의 상징을 바탕으로 아이역에서 정한 학습용 명칭입니다. 전통 대응에서는 두 방식이 같은 효를 읽습니다. 윤효점에서 아이역 반전 대응을 선택하면 음양과 괘가 달라집니다.";
// 적용 효: 정효점이거나 전통 대응이면 산수 그대로, 윤효점 + 아이역 반전 대응이면 15 − 값(6↔9, 7↔8).
export const MAPPING_NOTE = { traditional: "소=양·다=음 · 전통 대응", inverted: "소=음·다=양 · 아이역 반전 대응" };
export function appliedValue(calcValue, method, mapping) {
  return method === "yun" && mapping === "inverted" ? 15 - calcValue : calcValue;
}
export function appliedLine(e, method, mapping) {
  const value = appliedValue(e.value, method, mapping);
  return { value, info: LINE_INFO[value], inverted: value !== e.value };
}
export function criterionText(method, mapping) {
  return method === "yun" ? `윤효점 · ${MAPPING_NOTE[mapping === "inverted" ? "inverted" : "traditional"]}` : "정효점";
}
export function smallLargeNote(mapping) {
  return mapping === "inverted"
    ? "여기서는 덜어 모은 수가 작은 경우(4·5)를 ‘소’, 큰 경우(8·9)를 ‘다’라고 합니다. 전통 방식에서는 소를 양에, 다를 음에 대응시키지만, 이번 배우기는 아이역 반전 대응(소=음·다=양)으로 읽습니다. 소·다는 좌우 무더기의 크기가 아니라, 한 차례에 덜어 모은 수의 크기입니다."
    : NOTES.smallLarge;
}
// 윤효점: 정효점의 수(6·7·8·9)를 쓰지 않는다. 소·다를 대응에 따라 양(+)·음(−)으로 바꿔, 혼자 다른 것이 정하고 셋이 같으면 변한다.
export const KIND_TEXT = { 9: "변하는 양효", 8: "변하지 않는 음효", 7: "변하지 않는 양효", 6: "변하는 음효" };
const signOf = (kind, mapping) => ((kind === "소") === (mapping !== "inverted") ? "양(+)" : "음(−)");
export function yunVerdict(e, mapping = "traditional") {
  const signs = e.rows.map((r) => signOf(r.kind, mapping));
  const yang = signs.filter((s) => s === "양(+)").length;
  const a = appliedLine(e, "yun", mapping);
  const why = yang === 3 ? "셋이 모두 양 → 변하는 양" : yang === 0 ? "셋이 모두 음 → 변하는 음" : yang === 2 ? "양 둘·음 하나 → 혼자 다른 음이 정함" : "음 둘·양 하나 → 혼자 다른 양이 정함";
  return { signs, why, text: `${signs.map((s) => s.slice(-2, -1)).join(" ")} → ${why} → ${a.info.name}(${a.info.hanja}) · ${KIND_TEXT[a.value]}` };
}
// 윤효점 머리말·효 이름(수 없이). 정효점은 기존 headline 그대로.
export function headlineFor(value, method) {
  return method === "yun" ? `이번 효: ${LINE_INFO[value].name}(${LINE_INFO[value].hanja}) · ${KIND_TEXT[value]}` : headline(value);
}
export function lineLabel(value, method) {
  return method === "yun" ? LINE_INFO[value].name : `${value} ${LINE_INFO[value].name}`;
}
export function readingText(e, method = "jeong", mapping = "traditional") {
  if (!e.ok) return ["기록을 해석할 수 없습니다.", ...e.problems];
  if (method === "yun") {
    const v = yunVerdict(e, mapping);
    return [
      ...e.rows.map((r, i) => `${r.ord}: 윤시초와 인시초를 합쳐 ${r.count}가지 → ${r.kind} → ${v.signs[i]}`),
      v.text,
      `모은 윤시초와 인시초: ${e.gathered.join(" + ")} = ${e.sum}가지`,
    ];
  }
  return [
    `최종 정시초 ${e.final}가지를 네 개씩 묶으면 ${e.value}묶음입니다.`,
    `49 − ${e.sum} = ${e.final}, ${e.final} ÷ 4 = ${e.value}`,
    `정효점으로 읽으면 이번 효는 ${e.value} · ${e.info.name}입니다. ${e.info.meaning}`,
  ];
}
