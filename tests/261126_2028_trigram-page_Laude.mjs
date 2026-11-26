// 261126_2028 LAUDE: 원본 261126_1240_trigram-page_Laude.mjs. 사전 261126_2028·캐시 v91·페이지 스크립트 261126_2028·쉬어 가기(태극기) 반영.
// 261126_1240 LAUDE: 원본 261126_0821_trigram-page_Laude.mjs. 사전 261126_1240·캐시 v90·페이지 스크립트 261126_1240·돌려 보고 뒤집어 보기 반영.
// 261126_0821 LAUDE: 원본 261126_0805_trigram-page_Laude.mjs. 사전 261126_0821·캐시 v89·페이지 스크립트 261126_0821·효로 셈하기 반영.
// 261126_0805 LAUDE: 원본 261126_0751_trigram-page_Laude.mjs. 사전 261126_0805·캐시 v88·페이지 스크립트 261126_0805·짝으로 보기 반영.
// 261126_0751 LAUDE: 원본 261126_0736_trigram-page_Laude.mjs. 배치·순서 따라가기 자리를 목록 아래로.
// 261126_0736 LAUDE: 원본 261126_0725_trigram-page_Laude.mjs. 사전 261126_0736·캐시 v87·페이지 스크립트 261126_0736·순서 따라가기 반영.
// 261126_0725 LAUDE: 원본 261126_0707_trigram-page_Laude.mjs. 사전 261126_0725·캐시 v86·페이지 스크립트 261126_0725·팔괘 배치 반영.
// 261126_0707 LAUDE: 원본 261125_2209_trigram-page_Laude.mjs. 사전 261126_0707·캐시 v85·페이지 스크립트 261126_0707·좌우 바꾼 번호 반영.
// 261125_2209 LAUDE: 원본 261125_1716_trigram-page_Laude.mjs. 사전 2209·캐시 v84·이진수 노트 반영.
// 261125_1716 LAUDE: 8괘 페이지·팔괘 공용 모듈 새 판·사전·캐시 연결 확인(정적 검사). 실행: node tests/261125_1716_trigram-page_Laude.mjs
import assert from "node:assert";
import { readFileSync, existsSync } from "node:fs";
const R = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, R), "utf8");
const exists = (p) => existsSync(new URL(p, R));
const T = "261125_1716", L = "261126_2028"; // T: 팔괘 모듈·페이지 스크립트 판, L: 사전·페이지 CSS 판
const keyFor = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return "text." + h.toString(16).padStart(8, "0"); };

// 공용 모듈: 목록 함수를 내보내고, [팔괘 성격 보기]는 그 함수를 쓴다(복제 없음)
const mod = read(`assets/${T}_trigrams-ko_Laude.js`);
for (const name of ["trigramItem", "trigramList", "trigramCode", "trigramGuide", "loadTrigramOrder", "saveTrigramOrder"]) assert(mod.includes(`export function ${name}(`), "모듈 " + name);
assert(/trigramGuide[\s\S]*trigramList\(data,/.test(mod), "trigramGuide 가 trigramList 를 씀");
assert(mod.includes('TRIGRAM_ORDER_KEY = "iyeok.trigram-order.v1"') && mod.includes('DEFAULT_TRIGRAM_ORDER = "xiantian"'), "저장값·기본값 그대로");

// 8괘 페이지
const page = read("trigrams/index.html"), js = read(`trigrams/${L}_trigrams-page_Laude.js`);
assert(page.includes(`${L}_trigrams-page_Laude.js`) && page.includes(`${L}_trigrams-page_Laude.css`) && page.includes(`${L}_language_Laude.js`), "페이지 파일 연결");
assert(page.includes('value="xiantian"') && page.includes('value="iyeok"') && page.includes('href="../"'), "순서 선택·홈 링크");
assert(page.includes("효의 음양 대응을 고르듯, 8괘도 보는 순서를 스스로 고를 수 있습니다."), "선택 문구");
assert(!page.includes("이번 괘") && !js.includes("here:"), "이번 괘 표시 없음");
assert(js.includes(`assets/${T}_trigrams-ko_Laude.js`) && js.includes("showCode: true") && js.includes("saveTrigramOrder"), "페이지 스크립트");

// 홈 연결
const home = read("index.html");
assert(home.includes('<a href="trigrams/">8괘 살펴보기 →</a>') && !home.includes("<summary>8괘</summary><p>준비중"), "홈 8괘");

// 다른 화면도 같은 모듈 판
for (const f of ["yarrow/try/" + T + "_try_Laude.js", "yarrow/learn/" + T + "_learn_Laude.js", "yarrow/options/" + T + "_options_Laude.js", "app/app.js"]) assert(read(f).includes(`assets/${T}_trigrams-ko_Laude.js`), "모듈 판 " + f);
for (const f of ["index.html", "app/index.html", "yarrow/index.html", "yarrow/try/index.html", "yarrow/learn/index.html", "yarrow/options/index.html", "thoughts/one-and-two/index.html", "trigrams/index.html"]) assert(read(f).includes(`${L}_language_Laude.js`), "사전 판 " + f);

// 동전점 오프라인 목록
const sw = read("app/sw.js");
assert(sw.includes('"iyeok-app-v91"') && sw.includes(`assets/${T}_trigrams-ko_Laude.js`), "캐시 v83·새 모듈");
for (const f of ["language_Laude.js", "locales_Laude.json", "ko_Laude.json", "en_Laude.json"]) assert(sw.includes(`${L}_${f}`) && exists(`assets/i18n/${L}_${f}`), "사전 파일 " + f);

// 사전: 새 글은 영어가 모두 있다
const ko = JSON.parse(read(`assets/i18n/${L}_ko_Laude.json`)), en = JSON.parse(read(`assets/i18n/${L}_en_Laude.json`));
const newKeys = Object.entries(ko.origins).filter(([, o]) => o.includes("trigrams/index.html")).map(([k]) => k);
assert(newKeys.length >= 12, "새 글 수 " + newKeys.length);
for (const k of newKeys) assert(en.messages[k]?.trim() && keyFor(ko.messages[k]) === k, "영어 " + ko.messages[k]);
assert(ko.templates["trigram.number"]?.source === "{c}₂ · 값 {v}" && en.messages["trigram.number"] === "{c}₂ · value {v}", "번호 틀");
// 이진수 노트: 선천 순서 설명 아래, 좌우를 바꾼 번호가 7 → 0
assert(page.includes('class="tri-desc tri-binnote" data-order="xiantian"') && page.includes("이진수의 좌우 방향을 바꾸면") && page.includes("건 111 · 태 110 · 리 101 · 진 100 · 손 011 · 감 010 · 간 001 · 곤 000 (7 → 0)"), "이진수 노트");
assert(!page.includes("아래 효부터 읽은 번호로 보면"), "옛 문장 제거");
// 좌우 바꾼 번호: 선천 순서에서만, 문장 틀은 사전에
assert(js.includes('order === "xiantian"') && js.includes("좌우를 바꾸면 ${flipped}₂ · 값 ${parseInt(flipped, 2)}") && js.includes("if (flipped === code) continue;"), "좌우 바꾼 번호");
assert(ko.templates["trigram.flipped"]?.source === "좌우를 바꾸면 {c}₂ · 값 {v}" && en.messages["trigram.flipped"] === "Flipped: {c}₂ · value {v}", "좌우 문장 틀");
// '…{c}₂ · 값 {v}' 틀이 좌우 문장을 먼저 삼키지 않도록 좌우 틀이 앞에 있어야 한다
assert(Object.keys(ko.templates).indexOf("trigram.flipped") < Object.keys(ko.templates).indexOf("trigram.number"), "문장 틀 순서");
// 팔괘 배치: 소개 바로 아래, 괘상 → 그림, JJDD 배치
assert(/tri-intro[^]*?id="order-title"[^]*?id="list-title"[^]*?class="trigram-note"[^]*?id="map-symbols"[^]*?id="map-images"[^]*?id="paths-title"[^]*?data-order="xiantian"[^]*?data-order="iyeok"[^]*?id="pairs-title"[^]*?id="calc-title"[^]*?id="turn-title"[^]*?id="flag-title"[^]*?tri-back/.test(page), "배치·순서 따라가기·짝으로 보기는 기존 내용(목록) 아래, 차례대로");
assert(js.includes('const MAP = [["qian", 1, 1], ["xun", 3, 1], ["zhen", 2, 2], ["kan", 1, 3], ["gen", 3, 3], ["li", 2, 4], ["dui", 1, 5], ["kun", 3, 5]];'), "배치 좌표");
assert(js.includes("TRIGRAM_ORDERS[order]") && js.includes("markPath(order)"), "순서 따라가기는 공용 순서를 쓰고 고른 순서를 표시");
for (const s of ["순서 따라가기", "지금 고른 순서", "시작", "끝", "선천 순서"]) assert(en.messages[keyFor(s)]?.trim(), "영어 " + s);
// 짝으로 보기: 반대 짝은 음양을 모두 바꾼 것, 비슷한 짝은 위나 아래 효 하나만 다르고 가운데 효가 같다
const data = JSON.parse(read("data/hexagrams.json"));
const code = (k) => [...data.trigrams[k].lines].reverse().join("");
const pairsOf = (name) => JSON.parse(js.match(new RegExp(`const ${name} = (\\[.*?\\]);`))[1]);
for (const [a, b] of pairsOf("OPPOSITE")) assert([...code(a)].every((c, i) => c !== code(b)[i]) && parseInt(code(a), 2) + parseInt(code(b), 2) === 7, "반대 짝 " + a + b);
for (const [a, b] of pairsOf("SIMILAR")) { const d = [...code(a)].map((c, i) => c !== code(b)[i]); assert(d.filter(Boolean).length === 1 && !d[1], "비슷한 짝 " + a + b); }
assert(new Set(pairsOf("OPPOSITE").flat()).size === 8 && new Set(pairsOf("SIMILAR").flat()).size === 8, "짝마다 여덟 괘를 한 번씩");
for (const s of ["짝으로 보기", "아래 효가 다름", "위 효가 다름", "두 가지 바꾸기"]) assert(en.messages[keyFor(s)]?.trim(), "영어 " + s);
// 효로 셈하기: 글에 적은 성질이 실제로 맞는지 여덟 괘 전부로 확인
const ks = Object.keys(data.trigrams), xor = (a, b) => [...a].map((c, i) => (c === b[i] ? "0" : "1")).join(""), and = (a, b) => [...a].map((c, i) => (c === "1" && b[i] === "1" ? "1" : "0")).join("");
for (const a of ks) {
  const ca = code(a);
  assert(xor(ca, "000") === ca && and(ca, "111") === ca && and(ca, "000") === "000" && xor(ca, ca) === "000", "땅 더하기·하늘 곱하기·땅 곱하기·자기 더하기 " + a);
  const comp = xor(ca, "111");
  assert(and(ca, comp) === "000" && parseInt(ca, 2) + parseInt(comp, 2) === 7, "반대 짝 곱하기 = 땅, 합 7 " + a);
  const dist = ks.filter((b) => b !== a).map((b) => [...xor(ca, code(b))].filter((c) => c === "1").length).sort().join("");
  assert(dist === "1112223", "효 차이 1·1·1·2·2·2·3 " + a + " " + dist);
}
for (const [a, b] of pairsOf("SIMILAR")) assert(["001", "100"].includes(xor(code(a), code(b))), "비슷한 짝 차이 = 우레 또는 산");
assert(ks.reduce((s, k) => s + parseInt(code(k), 2), 0) === 28, "합 28");
assert(js.includes('const calc = { a: "kan", b: "dui" };') && js.includes("drawCalc(order)"), "직접 해 보기");
for (const s of ["효로 셈하기", "첫째 괘", "둘째 괘", "효 차이", "더하기", "곱하기"]) assert(en.messages[keyFor(s)]?.trim(), "영어 " + s);
// 돌려 보고 뒤집어 보기: 글에 적은 내용을 여덟 괘로 계산해 확인
const rev = (c) => [...c].reverse().join(""), neg = (c) => xor(c, "111"), name = (c) => ks.find((k) => code(k) === c);
assert(ks.every((k) => code(k) === code(k)), "거울: 모두 그대로");
assert(ks.filter((k) => rev(code(k)) === code(k)).sort().join() === ["qian", "kun", "kan", "li"].sort().join(), "뒤집어도 그대로 = 건·곤·감·리");
assert(name(rev(code("dui"))) === "xun" && name(rev(code("zhen"))) === "gen", "뒤집기: 못↔바람, 우레↔산");
assert(ks.every((k) => neg(code(k)) !== code(k)), "흑백: 모두 바뀜");
const both = (k) => name(neg(rev(code(k))));
assert(both("qian") === "kun" && both("kan") === "li" && both("dui") === "zhen" && both("xun") === "gen", "뒤집고 흑백: 하늘↔땅, 물↔불, 못↔우레, 바람↔산");
// 세 가족 = 뒤집기·흑백으로 오갈 수 있는 무리
const orbit = (k) => [...new Set([code(k), rev(code(k)), neg(code(k)), neg(rev(code(k)))])].map(name).sort().join();
assert(orbit("qian") === "kun,qian" && orbit("kan") === "kan,li" && orbit("dui") === "dui,gen,xun,zhen", "세 가족");
assert(page.includes('data-members="qian,kun"') && page.includes('data-members="kan,li"') && page.includes('data-members="dui,xun,gen,zhen"'), "가족 칸");
// 64괘: 뒤집어도 그대로인 괘 8개
assert(Array.from({ length: 64 }, (_, n) => n.toString(2).padStart(6, "0")).filter((c) => rev(c) === c).length === 8, "64괘 대칭 8개");
for (const s of ["돌려 보고 뒤집어 보기", "원래", "거울", "뒤집기", "흑백", "뒤집고 흑백", "세 가족"]) assert(en.messages[keyFor(s)]?.trim(), "영어 " + s);
// 거리 세 단계: 어느 괘든 1·1·1·2·2·2·3(위에서 확인), 바꾸기마다 움직이는 거리
const hd = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
const moves = (fn) => [...new Set(ks.map((k) => hd(code(k), fn(code(k)))))].sort().join();
assert(moves((c) => c) === "0" && moves(rev) === "0,2" && moves(neg) === "3" && moves((c) => neg(rev(c))) === "1,3", "거울 0, 뒤집기 0·2, 흑백 3, 뒤집고 흑백 1·3");
assert(page.includes('data-slot="center"') && js.includes('let distCenter = "qian";'), "거리 고르기");
for (const s of ["거리 세 단계", "가운데 괘", "거리 1 — 한 효 차이", "거리 3 — 반대 짝"]) assert(en.messages[keyFor(s)]?.trim(), "영어 " + s);
// 태극기: 네 괘 자리와 반대 짝, 뒤집어도 그대로
assert(js.includes('const FLAG_TRIGRAMS = [["qian", -1, -1], ["kun", 1, 1], ["kan", 1, -1], ["li", -1, 1]];'), "건 왼쪽 위·곤 오른쪽 아래·감 오른쪽 위·리 왼쪽 아래");
assert(xor(code("qian"), code("kun")) === "111" && xor(code("kan"), code("li")) === "111", "대각선 짝 = 반대 짝");
assert(["qian", "kun", "kan", "li"].every((k) => rev(code(k)) === code(k)), "네 괘는 뒤집어도 그대로");
for (const s of ["그려 보기", "태극기 그림", "쉬어 가기 — 건곤감리"]) assert(en.messages[keyFor(s)]?.trim(), "영어 " + s);
// 돌리기·뒤집기: 자리 이동이 글과 맞는지(왼쪽 위 = (-1,-1) …)
const spot = { qian: [-1, -1], kun: [1, 1], kan: [1, -1], li: [-1, 1] }, at = (x, y) => Object.keys(spot).find((k) => spot[k][0] === x && spot[k][1] === y);
const moved = (fx, fy) => Object.fromEntries(Object.entries(spot).map(([k, [x, y]]) => [k, at(fx * x, fy * y)]));
assert(JSON.stringify(moved(-1, -1)) === JSON.stringify({ qian: "kun", kun: "qian", kan: "li", li: "kan" }), "180°: 건↔곤, 감↔리");
assert(moved(1, -1).qian === "li" && moved(1, -1).kan === "kun", "위아래: 건→리 자리, 감→곤 자리");
assert(moved(-1, 1).qian === "kan" && moved(-1, 1).li === "kun", "거울: 건→감 자리, 리→곤 자리");
assert(["rotate", "flip", "mirror"].every((m) => page.includes(`data-turn="${m}" aria-pressed="false"`)) && js.includes("function turnFlag(mode)"), "돌리기 버튼");
for (const s of ["180° 돌리기", "위아래 뒤집기", "거울(좌우)", "원래대로"]) assert(en.messages[keyFor(s)]?.trim(), "영어 " + s);
console.log("trigram page (2028): passed");
