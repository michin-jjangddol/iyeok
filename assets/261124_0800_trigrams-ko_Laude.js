// 261124_0800 LAUDE: 위·아래 팔괘 안내(공용). 시초점 맛보기·배우기·동전점이 함께 쓴다(JJDD).
//   - 괘 이름 아래 두 줄: "손하곤상(巽下坤上)", "아래 ☴ 바람 · 위 ☷ 땅"
//   - 괘사 앞 '괘의 모습' 글
//   - [팔괘 성격 보기]: 여덟 괘의 기호·이름·자연물·「설괘전」 한 글자 성질과 쉬운 풀이, 이번 괘의 팔괘 표시
//   이름·한자·기호·자연물은 data/hexagrams.json 의 trigrams 를 그대로 쓴다.
//   글은 한국어로 만들고, 영어 화면에서는 언어 모듈이 사전(메시지·템플릿)으로 바꾼다. 그래서 글 조각을 사전과 같은 모양으로 둔다.
//   이전에는 yarrow/try/261124_0732_try_Laude.js 안에 있던 코드다.

// 「설괘전」의 한 글자 성질(健·說·麗·動·入·陷·止·順)과 아이역이 쉽게 풀어 쓴 한 줄(상상을 돕는 안내, 정답 아님)
export const TRAITS = {
  qian: { word: "굳셈", han: "健", gloss: "쉬지 않고 굳세게 나아가는 힘" },
  dui: { word: "기쁨", han: "說", gloss: "서로 나누며 즐거워하는 열림" },
  li: { word: "붙음·밝음", han: "麗", gloss: "무언가에 붙어 밝게 비추는 빛" },
  zhen: { word: "움직임", han: "動", gloss: "깨어나 처음 움직이는 기운" },
  xun: { word: "들어감", han: "入", gloss: "부드럽게 스며들어 퍼지는 힘" },
  kan: { word: "빠짐", han: "陷", gloss: "험한 곳을 흘러 지나가는 어려움" },
  gen: { word: "그침", han: "止", gloss: "멈추어 제자리를 지키는 고요함" },
  kun: { word: "순함", han: "順", gloss: "받아들이고 길러 내는 너그러움" },
};
export const TRIGRAM_ORDER = ["qian", "dui", "li", "zhen", "xun", "kan", "gen", "kun"];
export const GUIDE_TITLE = "팔괘 성격 보기";
export const GUIDE_INTRO = "괘는 아래 세 효와 위 세 효, 두 개의 팔괘가 겹쳐 만들어집니다. 여덟 괘의 성질을 알면 괘의 모습을 떠올리기 쉽습니다.";
export const GUIDE_NOTE = "한 글자 성질은 「설괘전」에 전하는 것이고, 옆의 풀이는 상상을 돕기 위해 아이역이 쉽게 풀어 쓴 것입니다. 괘의 뜻을 정하는 정답은 아닙니다.";
export const IMAGERY_TITLE = "괘의 모습";
export const IMAGERY_CLOSE = "두 성질이 어떻게 만나는지 먼저 떠올려 본 뒤 괘사를 읽어 보세요. 여덟 괘의 성질은 [팔괘 성격 보기]에 모아 두었습니다.";

const hasBatchim = (w) => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0; };
const iGa = (w) => (hasBatchim(w) ? "이" : "가");
const trigramsOf = (data, h) => ({ lo: data.trigrams[h.lower], up: data.trigrams[h.upper] });

// 예: 손하곤상(巽下坤上)  (사전 템플릿 trigram.code)
export function triCode(data, h) {
  const { lo, up } = trigramsOf(data, h);
  return `${lo.nameKo}하${up.nameKo}상(${lo.name}下${up.name}上)`;
}
// 예: 아래 ☴ 바람 · 위 ☷ 땅  (사전 템플릿 trigram.line)
export function triLine(data, h) {
  const { lo, up } = trigramsOf(data, h);
  return `아래 ${lo.symbol} ${lo.natureKo} · 위 ${up.symbol} ${up.natureKo}`;
}
// 괘사 앞 '괘의 모습' 줄들(해석이 아니라 그림만)
export function imageryLines(data, h) {
  const { lo, up } = trigramsOf(data, h);
  return [
    `${triCode(data, h)}: 아래는 ${lo.nameKo}(${lo.name}) ${lo.symbol} ${lo.natureKo}(${TRAITS[h.lower].word}), 위는 ${up.nameKo}(${up.name}) ${up.symbol} ${up.natureKo}(${TRAITS[h.upper].word})입니다.`,
    lo === up ? `${up.natureKo} 위에 또 ${up.natureKo}${iGa(up.natureKo)} 겹친 모습입니다.` : `${up.natureKo} 아래에 ${lo.natureKo}${iGa(lo.natureKo)} 있는 모습입니다.`,
    IMAGERY_CLOSE,
  ];
}
// 괘 이름 아래에 붙일 두 줄(요소). tag·className 은 화면마다 다르다.
export function triCaption(data, h, { tag = "span", className = "result-tri" } = {}) {
  return [triCode(data, h), triLine(data, h)].map((t) => Object.assign(document.createElement(tag), { className, textContent: t }));
}
// [팔괘 성격 보기] 펼치기. hexes: [{ title: "본괘", h }, { title: "지괘", h }]
export function trigramGuide(data, hexes, { className = "trigram-guide" } = {}) {
  const here = new Map();
  hexes.forEach(({ title, h }) => {
    for (const [k, pos] of [[h.lower, "아래"], [h.upper, "위"]]) here.set(k, [...(here.get(k) || []), `${title} ${pos}`]);
  });
  const details = document.createElement("details");
  details.className = className;
  details.append(
    Object.assign(document.createElement("summary"), { textContent: GUIDE_TITLE }),
    Object.assign(document.createElement("p"), { className: "trigram-intro", textContent: GUIDE_INTRO }),
  );
  const ul = document.createElement("ul");
  ul.className = "trigram-list";
  for (const k of TRIGRAM_ORDER) {
    const t = data.trigrams[k], tr = TRAITS[k];
    const li = document.createElement("li");
    if (here.has(k)) li.className = "is-here";
    const sym = Object.assign(document.createElement("span"), { className: "trigram-sym", textContent: t.symbol });
    sym.setAttribute("aria-hidden", "true");
    // 이름·자연물·성질 글자는 조각마다 따로 둔다(영어 사전이 '건'→Qian, '하늘'→Heaven 처럼 낱말로 바꾼다)
    const span = (text) => Object.assign(document.createElement("span"), { textContent: text });
    const name = document.createElement("b");
    name.append(span(t.nameKo), `(${t.name}) `, span(t.natureKo));
    const word = document.createElement("span");
    word.className = "trigram-word";
    word.append(span(tr.word), `(${tr.han})`);
    li.append(sym, name, word, Object.assign(document.createElement("span"), { className: "trigram-gloss", textContent: tr.gloss }));
    if (here.has(k)) {
      // 글 조각마다 따로 두어 영어 사전으로 바뀌게 한다("이번 괘:", "본괘 위" …)
      const mark = document.createElement("span");
      mark.className = "trigram-here";
      mark.append(Object.assign(document.createElement("span"), { textContent: "이번 괘:" }));
      here.get(k).forEach((w, i) => {
        if (i) mark.append(" · ");
        else mark.append(" ");
        mark.append(Object.assign(document.createElement("span"), { textContent: w }));
      });
      li.append(mark);
    }
    ul.append(li);
  }
  details.append(ul, Object.assign(document.createElement("p"), { className: "trigram-note", textContent: GUIDE_NOTE }));
  return details;
}
// 결과 화면에 '괘의 모습'만 따로 보여 줄 때(괘사가 없는 배우기 화면)
export function imageryBox(data, hexes) {
  const box = document.createElement("div");
  box.className = "text-block is-imagery";
  box.append(Object.assign(document.createElement("h4"), { textContent: IMAGERY_TITLE }));
  for (const { title, h } of hexes) {
    const [first, second] = imageryLines(data, h);
    const p = document.createElement("p");
    p.append(Object.assign(document.createElement("b"), { textContent: title }), " ", Object.assign(document.createElement("span"), { textContent: first }), " ", Object.assign(document.createElement("span"), { textContent: second }));
    box.append(p);
  }
  return box;
}
