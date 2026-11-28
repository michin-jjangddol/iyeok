// 261128_1853 SHANA: 태 그림 비율 보존 확대·여백 축소.
// 261128_1847 SHANA: 태 새 이미지 목록 연결, 이전 판 백업 보존.
// 261128_1818 SHANA: JJDD 요청으로 진 새 이미지 목록 연결. 원본 backups/trigrams 보존.
// 261125_1716 LAUDE: 원본 261125_0744_trigrams-ko_Laude.js. 팔괘 한 항목·목록(trigramItem·trigramList·trigramCode)을 함수로 빼서 8괘 페이지와 [팔괘 성격 보기]가 함께 씀. 화면은 같다.
// 261125_0744 LAUDE: 원본 261125_0711_trigrams-ko_Laude.js. [팔괘 성격 보기] 순서를 설정(선천 순서 기본 / 아이역 순서)으로 고르게 함(JJDD).
// 261125_0711 LAUDE: 원본 261125_0640_trigrams-ko_Laude.js. [팔괘 성격 보기] 순서를 아이역 순서(위 건 111 … 아래 곤 000)로, 팔괘 목록 새 판 연결(JJDD).
// 261125_0640 LAUDE: 원본 261124_2251_trigrams-ko_Laude.js. [팔괘 성격 보기] 괘 기호를 효 막대로 그려 아이콘 크기에 맞게 크게(JJDD).
// 261124_2251 LAUDE: 원본 261124_0800_trigrams-ko_Laude.js. 팔괘 아이콘(data/trigrams 에 등록된 icon.current)을 [팔괘 성격 보기]의 기호 옆과 '괘의 모습'에 붙임(JJDD).
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
// 261125_0744: [팔괘 성격 보기] 순서는 설정으로 고른다(JJDD). 기본은 선천 순서.
//   xiantian 선천 순서: 건·태·리·진·손·감·간·곤 — 아래 효부터 읽은 이진수 큰 수부터(선천 팔괘의 수 1~8)
//   iyeok 아이역 순서: 건·손·리·간·태·감·진·곤 — 위 효부터 읽은 이진수 큰 수부터(64괘 번호와 같은 규칙)
export const TRIGRAM_ORDERS = {
  xiantian: ["qian", "dui", "li", "zhen", "xun", "kan", "gen", "kun"],
  iyeok: ["qian", "xun", "li", "gen", "dui", "kan", "zhen", "kun"],
};
export const DEFAULT_TRIGRAM_ORDER = "xiantian";
export const TRIGRAM_ORDER = TRIGRAM_ORDERS[DEFAULT_TRIGRAM_ORDER]; // 기본 순서(예전 이름 유지)
// 시초점·동전점이 함께 쓰는 저장값(이 기기에만)
export const TRIGRAM_ORDER_KEY = "iyeok.trigram-order.v1";
export function loadTrigramOrder() {
  try {
    const v = localStorage.getItem(TRIGRAM_ORDER_KEY);
    return Object.hasOwn(TRIGRAM_ORDERS, v) ? v : DEFAULT_TRIGRAM_ORDER;
  } catch {
    return DEFAULT_TRIGRAM_ORDER;
  }
}
export function saveTrigramOrder(v) {
  if (!Object.hasOwn(TRIGRAM_ORDERS, v)) return false;
  try {
    localStorage.setItem(TRIGRAM_ORDER_KEY, v);
    return true;
  } catch {
    return false;
  }
}

// ---- 아이콘(261124_2251) ----
// 아이콘은 팔괘 공용 자료(data/trigrams/)에 등록된 것만 쓴다: 목록 파일 → 정보 파일 → icon.current.
// 목록 파일이 새 판으로 바뀌면 이 경로도 새 판으로 바꾼다(tests/261124_2251_trigram-icons_Laude.mjs 가 최신 판인지 검사).
export const TRIGRAM_INDEX = "data/trigrams/261128_1853_trigram-index_Shana.json";
let iconsLoading = null;
// root: 페이지에서 사이트 뿌리까지의 상대 경로("../../" 등). 결과: Map(id → { src, alt }). 실패하면 빈 Map.
export function loadTrigramIcons(root) {
  if (!iconsLoading) {
    const base = new URL(root, location.href);
    const get = (p) => fetch(new URL(p, base)).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))));
    iconsLoading = get(TRIGRAM_INDEX)
      .then((index) => Promise.all(index.trigrams.map((e) => get(e.info).then((info) => [e.id, info]).catch(() => [e.id, null]))))
      .then((pairs) => new Map(pairs.filter(([, info]) => info?.icon?.status === "registered" && info.icon.current)
        .map(([id, info]) => [id, { src: new URL(info.icon.current, base).href, alt: info.icon.alt || "" }])))
      .catch(() => new Map());
  }
  return iconsLoading;
}
// 그림 한 장. 이름·자연물이 바로 옆 글로 있으므로 그림은 꾸밈(alt="")으로 둔다(영어 화면에 한국어 대체 글이 남지 않게).
function iconImg(icon, size) {
  const img = document.createElement("img");
  img.src = icon.src;
  img.alt = "";
  img.width = size;
  img.height = size;
  img.loading = "lazy";
  img.decoding = "async";
  img.className = "trigram-icon";
  img.addEventListener("error", () => img.remove());
  return img;
}
// 위·아래 두 그림을 괘처럼 위아래로 쌓는다(위 = 상괘, 아래 = 하괘). icons: loadTrigramIcons 의 Promise.
export function iconPair(data, h, icons, size = 44) {
  const fig = document.createElement("div");
  fig.className = "trigram-pair";
  fig.setAttribute("aria-hidden", "true");
  const up = Object.assign(document.createElement("span"), { className: "trigram-pair-up" });
  const lo = Object.assign(document.createElement("span"), { className: "trigram-pair-lo" });
  fig.append(up, lo);
  Promise.resolve(icons).then((m) => {
    if (m?.get(h.upper)) up.append(iconImg(m.get(h.upper), size));
    if (m?.get(h.lower)) lo.append(iconImg(m.get(h.lower), size));
    if (!fig.querySelector("img")) fig.remove();
  });
  return fig;
}
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
// 261125_1716: 팔괘 한 항목(효 막대 · 아이콘 · 이름 · 성질 · 풀이). [팔괘 성격 보기]와 8괘 페이지가 함께 쓴다.
//   here: 이번 괘에서의 자리(["본괘 위", …]) — 결과 화면에서만. showCode: 고유 번호(000₂ · 값 0)를 작게 보여 줄지.
export function trigramCode(t) {
  return [...t.lines].reverse().join(""); // lines 는 아래 효부터, 번호는 위 효부터(왼쪽 = 위 효)
}
export function trigramItem(data, k, { icons = null, here = null, showCode = false } = {}) {
  const t = data.trigrams[k], tr = TRAITS[k];
  const li = document.createElement("li");
  li.dataset.trigram = k;
  if (here?.length) li.className = "is-here";
  // 괘 기호: 글꼴 기호(☰ 등)는 크게 하면 모양이 기기마다 달라서, 효 막대 세 줄을 직접 그린다(위 효부터).
  const sym = Object.assign(document.createElement("span"), { className: "trigram-sym" });
  for (const yang of [...t.lines].reverse()) sym.append(Object.assign(document.createElement("span"), { className: `tri-bar ${yang ? "is-yang" : "is-yin"}` }));
  sym.setAttribute("aria-hidden", "true");
  // 이름·자연물·성질 글자는 조각마다 따로 둔다(영어 사전이 '건'→Qian, '하늘'→Heaven 처럼 낱말로 바꾼다)
  const span = (text) => Object.assign(document.createElement("span"), { textContent: text });
  const name = document.createElement("b");
  name.append(span(t.nameKo), `(${t.name}) `, span(t.natureKo));
  const word = document.createElement("span");
  word.className = "trigram-word";
  word.append(span(tr.word), `(${tr.han})`);
  // 기호 바로 옆 그림 자리(아이콘을 불러오면 채운다. 실패해도 글은 그대로)
  const slot = Object.assign(document.createElement("span"), { className: "trigram-icon-slot" });
  slot.setAttribute("aria-hidden", "true");
  if (icons) Promise.resolve(icons).then((m) => { if (m?.get(k)) slot.append(iconImg(m.get(k), 56)); });
  li.append(sym, slot, name, word, Object.assign(document.createElement("span"), { className: "trigram-gloss", textContent: tr.gloss }));
  if (showCode) li.append(Object.assign(document.createElement("span"), { className: "trigram-code", textContent: `${trigramCode(t)}₂ · 값 ${t.value}` }));
  if (here?.length) {
    // 글 조각마다 따로 두어 영어 사전으로 바뀌게 한다("이번 괘:", "본괘 위" …)
    const mark = document.createElement("span");
    mark.className = "trigram-here";
    mark.append(Object.assign(document.createElement("span"), { textContent: "이번 괘:" }));
    here.forEach((w, i) => {
      mark.append(i ? " · " : " ");
      mark.append(Object.assign(document.createElement("span"), { textContent: w }));
    });
    li.append(mark);
  }
  return li;
}
// 여덟 괘 목록(ul). order: "xiantian" | "iyeok"(없으면 설정값).
export function trigramList(data, { icons = null, order = null, here = null, showCode = false } = {}) {
  const ORDER = TRIGRAM_ORDERS[order ?? loadTrigramOrder()] ?? TRIGRAM_ORDER;
  const ul = document.createElement("ul");
  ul.className = "trigram-list";
  for (const k of ORDER) ul.append(trigramItem(data, k, { icons, here: here?.get(k) ?? null, showCode }));
  return ul;
}
// [팔괘 성격 보기] 펼치기. hexes: [{ title: "본괘", h }, { title: "지괘", h }]
export function trigramGuide(data, hexes, { className = "trigram-guide", icons = null, order = null } = {}) {
  const here = new Map();
  hexes.forEach(({ title, h }) => {
    for (const [k, pos] of [[h.lower, "아래"], [h.upper, "위"]]) here.set(k, [...(here.get(k) || []), `${title} ${pos}`]);
  });
  const details = document.createElement("details");
  details.className = className;
  details.append(
    Object.assign(document.createElement("summary"), { textContent: GUIDE_TITLE }),
    Object.assign(document.createElement("p"), { className: "trigram-intro", textContent: GUIDE_INTRO }),
    trigramList(data, { icons, order, here }),
    Object.assign(document.createElement("p"), { className: "trigram-note", textContent: GUIDE_NOTE }),
  );
  return details;
}
// 결과 화면에 '괘의 모습'만 따로 보여 줄 때(괘사가 없는 배우기 화면)
export function imageryBox(data, hexes, { icons = null } = {}) {
  const box = document.createElement("div");
  box.className = "text-block is-imagery";
  box.append(Object.assign(document.createElement("h4"), { textContent: IMAGERY_TITLE }));
  for (const { title, h } of hexes) {
    const [first, second] = imageryLines(data, h);
    const p = document.createElement("p");
    p.append(Object.assign(document.createElement("b"), { textContent: title }), " ", Object.assign(document.createElement("span"), { textContent: first }), " ", Object.assign(document.createElement("span"), { textContent: second }));
    if (icons) {
      const row = Object.assign(document.createElement("div"), { className: "imagery-row" });
      row.append(iconPair(data, h, icons), p);
      box.append(row);
    } else box.append(p);
  }
  return box;
}
