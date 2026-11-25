// 261126_0707 LAUDE: 원본 261125_2209_trigram-page_Laude.mjs. 사전 261126_0707·캐시 v85·페이지 스크립트 261126_0707·좌우 바꾼 번호 반영.
// 261125_2209 LAUDE: 원본 261125_1716_trigram-page_Laude.mjs. 사전 2209·캐시 v84·이진수 노트 반영.
// 261125_1716 LAUDE: 8괘 페이지·팔괘 공용 모듈 새 판·사전·캐시 연결 확인(정적 검사). 실행: node tests/261125_1716_trigram-page_Laude.mjs
import assert from "node:assert";
import { readFileSync, existsSync } from "node:fs";
const R = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, R), "utf8");
const exists = (p) => existsSync(new URL(p, R));
const T = "261125_1716", L = "261126_0707"; // T: 팔괘 모듈·페이지 스크립트 판, L: 사전·페이지 CSS 판
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
assert(sw.includes('"iyeok-app-v85"') && sw.includes(`assets/${T}_trigrams-ko_Laude.js`), "캐시 v83·새 모듈");
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
console.log("trigram page (0707): passed");
