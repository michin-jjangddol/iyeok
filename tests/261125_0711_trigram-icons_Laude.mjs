// 261125_0711 LAUDE: 팔괘 아이콘 연결 검사(아이역 순서 판). 이전 판 261125_0640 을 이었다. 실행: node tests/261125_0711_trigram-icons_Laude.mjs
// - 공용 모듈이 가리키는 팔괘 목록이 저장소의 최신 판인지(새 판이 생기면 모듈도 새 판으로 바꿔야 함)
// - 목록 → 정보 파일 → icon.current 가 실제 그림이며 정사각형 256(웹용)인지
// - 맛보기·배우기·동전점이 새 모듈·CSS 를 쓰는지, 동전점 캐시에 목록·정보·아이콘이 들어 있는지
import fs from "node:fs";
import assert from "node:assert/strict";
const base = new URL("../", import.meta.url).pathname;
const read = (p) => fs.readFileSync(base + p, "utf8");
const exists = (p) => fs.existsSync(base + p);

const mod = read("assets/261125_0711_trigrams-ko_Laude.js");
const indexPath = mod.match(/export const TRIGRAM_INDEX = "([^"]+)"/)[1];
const latest = fs.readdirSync(base + "data/trigrams").filter((f) => /^\d{6}_\d{4}_trigram-index_\w+\.json$/.test(f)).sort().pop();
assert.equal(indexPath, "data/trigrams/" + latest, "모듈이 최신 팔괘 목록을 가리켜야 함(새 판이면 모듈 새 판으로)");
const index = JSON.parse(read(indexPath));

// WebP 크기 읽기(VP8 / VP8L / VP8X)
function webpSize(p) {
  const b = fs.readFileSync(base + p);
  assert.equal(b.toString("ascii", 0, 4), "RIFF"); assert.equal(b.toString("ascii", 8, 12), "WEBP");
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === "VP8L") { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
  if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  throw new Error("webp?");
}
const icons = [];
for (const e of index.trigrams) {
  const info = JSON.parse(read(e.info));
  assert.equal(info.icon.status, "registered", e.code + " 아이콘 등록");
  const cur = info.icon.current;
  assert(exists(cur) && cur.startsWith(`data/trigrams/${e.code}/images/`), e.code + " 그림 파일");
  if (cur.endsWith(".webp")) assert.deepEqual(webpSize(cur), [256, 256], e.code + " 정사각형 256");
  assert(info.icon.alt && info.icon.intent, e.code + " 의도·대체 설명");
  icons.push(cur);
}
assert.equal(icons.length, 8);

for (const [page, js] of [["yarrow/try/index.html", "try"], ["yarrow/learn/index.html", "learn"]]) {
  const html = read(page);
  assert(html.includes("assets/261125_0640_trigrams_Laude.css"), page + " CSS");
  const src = read(page.replace("index.html", "") + html.match(new RegExp(`src="(\\d{6}_\\d{4}_${js}_Laude\\.js)"`))[1]);
  assert(src.includes("261125_0711_trigrams-ko_Laude.js") && src.includes('loadTrigramIcons("../../")'), page + " 아이콘 모듈");
}
const app = read("app/app.js");
assert(app.includes("261125_0711_trigrams-ko_Laude.js") && app.includes('loadTrigramIcons("../")') && read("app/index.html").includes("assets/261125_0640_trigrams_Laude.css"));
const sw = read("app/sw.js");
assert(sw.includes('"iyeok-app-v79"'));
for (const p of [indexPath, ...index.trigrams.map((e) => e.info), ...icons, "assets/261125_0711_trigrams-ko_Laude.js", "assets/261124_2251_hexagram-texts_Laude.js", "assets/261125_0640_trigrams_Laude.css"]) {
  assert(sw.includes(`"../${p}"`), "동전점 캐시에 없음 " + p);
}
for (const f of sw.match(/"\.\.\/(assets|data)\/[^"]+"/g)) assert(exists(f.slice(4, -1)), "캐시 파일 없음 " + f);
// 그림은 꾸밈(alt="")이고 옆 글이 이름을 알려 준다 — 영어 화면에 한국어 대체 글이 남지 않게
assert(mod.includes('img.alt = "";'));
console.log({ index: latest, icons: icons.length, pages: "passed", cache: "passed" });
// 261125_0640: 괘 기호는 글꼴 기호가 아니라 효 막대 세 줄(위 효부터)
assert(mod.includes('className: "trigram-sym" }') && mod.includes("[...t.lines].reverse()"), "효 막대 기호");
assert(read("assets/261125_0640_trigrams_Laude.css").includes("grid-template-columns: 3rem 3.5rem 1fr;"), "기호 칸 3rem");
console.log("symbols: passed");
