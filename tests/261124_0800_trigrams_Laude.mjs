// 261124_0800 LAUDE: 위·아래 팔괘 안내(공용 모듈) 검사. 실행: node tests/261124_0800_trigrams_Laude.mjs
// - 64괘 모두: 손하곤상(巽下坤上) 꼴, 아래·위 줄, '괘의 모습' 문장과 조사(이/가)
// - 영어: 만들어지는 한국어 글 조각이 모두 사전(메시지 또는 템플릿)으로 영어가 되는지 — 언어 모듈의 번역 함수를 그대로 흉내 낸다
// - 화면 연결: 맛보기·배우기·동전점이 같은 모듈·CSS·언어 사전을 쓰는지, 동전점 캐시
import fs from "node:fs";
import assert from "node:assert/strict";
const base = new URL("../", import.meta.url).pathname;
const read = (p) => fs.readFileSync(base + p, "utf8");
const data = JSON.parse(read("data/hexagrams.json"));
const M = await import(base + "assets/261124_0800_trigrams-ko_Laude.js");

// 1) 64괘
const PARTICLE = { 하늘: "이", 땅: "이", 우레: "가", 바람: "이", 물: "이", 불: "이", 산: "이", 못: "이" };
for (const h of data.hexagrams) {
  const lo = data.trigrams[h.lower], up = data.trigrams[h.upper];
  assert.equal(M.triCode(data, h), `${lo.nameKo}하${up.nameKo}상(${lo.name}下${up.name}上)`);
  assert.equal(M.triLine(data, h), `아래 ${lo.symbol} ${lo.natureKo} · 위 ${up.symbol} ${up.natureKo}`);
  const [a, b, c] = M.imageryLines(data, h);
  assert(a.includes(`(${M.TRAITS[h.lower].word})`) && a.includes(`(${M.TRAITS[h.upper].word})`));
  assert.equal(b, lo === up ? `${up.natureKo} 위에 또 ${up.natureKo}${PARTICLE[up.natureKo]} 겹친 모습입니다.` : `${up.natureKo} 아래에 ${lo.natureKo}${PARTICLE[lo.natureKo]} 있는 모습입니다.`);
  assert.equal(c, M.IMAGERY_CLOSE);
}
assert.equal(M.triCode(data, data.hexagrams.find((h) => h.number === 46)), "손하곤상(巽下坤上)");

// 2) 영어 사전: 언어 모듈의 key·템플릿 방식과 같게 번역해 본다
const lang = read("yarrow/try/index.html").match(/i18n\/(\d{6}_\d{4})_language_Laude\.js/)[1];
const ko = JSON.parse(read(`assets/i18n/${lang}_ko_Laude.json`));
const en = JSON.parse(read(`assets/i18n/${lang}_en_Laude.json`)).messages;
const keyFor = (s) => { let x = 2166136261; for (const ch of s) { x ^= ch.codePointAt(0); x = Math.imul(x, 16777619); } return "text." + (x >>> 0).toString(16).padStart(8, "0"); };
function tr(source, depth = 0) {
  if (!/[가-힣]/.test(source) || depth > 3) return source;
  const key = keyFor(source);
  if (ko.messages[key] === source && en[key]) return en[key];
  for (const [id, entry] of Object.entries(ko.templates)) {
    if (!en[id]) continue;
    const names = [];
    const esc = entry.source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\{([a-zA-Z][\w]*)\\\}/g, (_, n) => { names.push(n); return "(.+?)"; });
    const m = source.match(new RegExp(`^${esc}$`, "u"));
    if (m) return en[id].replace(/\{([a-zA-Z][\w]*)\}/g, (all, n) => { const i = names.indexOf(n); return i < 0 ? all : tr(m[i + 1], depth + 1); });
  }
  return source;
}
const hangul = (s) => /[가-힣]/.test(s);
let pieces = 0;
for (const h of data.hexagrams) {
  for (const s of [M.triCode(data, h), M.triLine(data, h), ...M.imageryLines(data, h)]) {
    const out = tr(s);
    assert(!hangul(out), `영어로 안 바뀜: ${s} → ${out}`);
    pieces++;
  }
}
for (const k of M.TRIGRAM_ORDER) {
  const t = data.trigrams[k], x = M.TRAITS[k];
  for (const s of [t.nameKo, t.natureKo, x.word, x.gloss]) { assert(!hangul(tr(s)), "영어 없음: " + s); pieces++; }
}
for (const s of [M.GUIDE_TITLE, M.GUIDE_INTRO, M.GUIDE_NOTE, M.IMAGERY_TITLE, "이번 괘:", "본괘 위", "본괘 아래", "지괘 위", "지괘 아래", "본괘", "지괘"]) { assert(!hangul(tr(s)), "영어 없음: " + s); pieces++; }
assert.equal(tr("땅 아래에 바람이 있는 모습입니다."), "An image of Wind beneath Earth.");

// 3) 화면 연결
for (const [page, js] of [["yarrow/try/index.html", /try\/(\d{6}_\d{4})_try_Laude\.js|src="(\d{6}_\d{4})_try_Laude\.js"/], ["yarrow/learn/index.html", null], ["app/index.html", null]]) {
  const html = read(page);
  assert(html.includes("261124_0800_trigrams_Laude.css") && html.includes(`${lang}_language_Laude.js`), page + " CSS·언어");
}
const tryJs = read("yarrow/try/" + read("yarrow/try/index.html").match(/src="(\d{6}_\d{4}_try_Laude\.js)"/)[1]);
const learnJs = read("yarrow/learn/" + read("yarrow/learn/index.html").match(/src="(\d{6}_\d{4}_learn_Laude\.js)"/)[1]);
const appJs = read("app/app.js");
for (const [n, s] of [["try", tryJs], ["learn", learnJs], ["app", appJs]]) assert(s.includes("261124_0800_trigrams-ko_Laude.js"), n + " 공용 모듈");
assert(appJs.includes("261124_0800_hexagram-texts_Laude.js") && !/function (judgmentSection|loadJudgment|renderTexts)\b/.test(appJs), "동전점 괘사는 공용 모듈");
assert(!/const TRAITS/.test(tryJs + learnJs + appJs), "성질 표는 공용 모듈 한 곳");
const sw = read("app/sw.js");
assert(sw.includes('"iyeok-app-v76"') && ["assets/261124_0800_hexagram-texts_Laude.js", "assets/261124_0800_trigrams-ko_Laude.js", "assets/261124_0800_trigrams_Laude.css", `${lang}_en_Laude.json`].every((f) => sw.includes(f)), "동전점 캐시 목록");
for (const f of sw.match(/"\.\.\/assets\/[^"]+"/g)) assert(fs.existsSync(base + f.slice(4, -1)), "캐시 파일 없음 " + f);
console.log({ hexagrams: data.hexagrams.length, englishPieces: pieces, lang, pages: "passed" });
