// 261125_1716 LAUDE: 8괘 페이지·팔괘 공용 모듈 새 판·사전·캐시 연결 확인(정적 검사). 실행: node tests/261125_1716_trigram-page_Laude.mjs
import assert from "node:assert";
import { readFileSync, existsSync } from "node:fs";
const R = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, R), "utf8");
const exists = (p) => existsSync(new URL(p, R));
const T = "261125_1716";
const keyFor = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return "text." + h.toString(16).padStart(8, "0"); };

// 공용 모듈: 목록 함수를 내보내고, [팔괘 성격 보기]는 그 함수를 쓴다(복제 없음)
const mod = read(`assets/${T}_trigrams-ko_Laude.js`);
for (const name of ["trigramItem", "trigramList", "trigramCode", "trigramGuide", "loadTrigramOrder", "saveTrigramOrder"]) assert(mod.includes(`export function ${name}(`), "모듈 " + name);
assert(/trigramGuide[\s\S]*trigramList\(data,/.test(mod), "trigramGuide 가 trigramList 를 씀");
assert(mod.includes('TRIGRAM_ORDER_KEY = "iyeok.trigram-order.v1"') && mod.includes('DEFAULT_TRIGRAM_ORDER = "xiantian"'), "저장값·기본값 그대로");

// 8괘 페이지
const page = read("trigrams/index.html"), js = read(`trigrams/${T}_trigrams-page_Laude.js`);
assert(page.includes(`${T}_trigrams-page_Laude.js`) && page.includes(`${T}_trigrams-page_Laude.css`) && page.includes(`${T}_language_Laude.js`), "페이지 파일 연결");
assert(page.includes('value="xiantian"') && page.includes('value="iyeok"') && page.includes('href="../"'), "순서 선택·홈 링크");
assert(page.includes("효의 음양 대응을 고르듯, 8괘도 보는 순서를 스스로 고를 수 있습니다."), "선택 문구");
assert(!page.includes("이번 괘") && !js.includes("here:"), "이번 괘 표시 없음");
assert(js.includes(`assets/${T}_trigrams-ko_Laude.js`) && js.includes("showCode: true") && js.includes("saveTrigramOrder"), "페이지 스크립트");

// 홈 연결
const home = read("index.html");
assert(home.includes('<a href="trigrams/">8괘 살펴보기 →</a>') && !home.includes("<summary>8괘</summary><p>준비중"), "홈 8괘");

// 다른 화면도 같은 모듈 판
for (const f of ["yarrow/try/" + T + "_try_Laude.js", "yarrow/learn/" + T + "_learn_Laude.js", "yarrow/options/" + T + "_options_Laude.js", "app/app.js"]) assert(read(f).includes(`assets/${T}_trigrams-ko_Laude.js`), "모듈 판 " + f);
for (const f of ["index.html", "app/index.html", "yarrow/index.html", "yarrow/try/index.html", "yarrow/learn/index.html", "yarrow/options/index.html", "thoughts/one-and-two/index.html", "trigrams/index.html"]) assert(read(f).includes(`${T}_language_Laude.js`), "사전 판 " + f);

// 동전점 오프라인 목록
const sw = read("app/sw.js");
assert(sw.includes('"iyeok-app-v83"') && sw.includes(`assets/${T}_trigrams-ko_Laude.js`), "캐시 v83·새 모듈");
for (const f of ["language_Laude.js", "locales_Laude.json", "ko_Laude.json", "en_Laude.json"]) assert(sw.includes(`${T}_${f}`) && exists(`assets/i18n/${T}_${f}`), "사전 파일 " + f);

// 사전: 새 글은 영어가 모두 있다
const ko = JSON.parse(read(`assets/i18n/${T}_ko_Laude.json`)), en = JSON.parse(read(`assets/i18n/${T}_en_Laude.json`));
const newKeys = Object.entries(ko.origins).filter(([, o]) => o.includes("trigrams/index.html")).map(([k]) => k);
assert(newKeys.length >= 12, "새 글 수 " + newKeys.length);
for (const k of newKeys) assert(en.messages[k]?.trim() && keyFor(ko.messages[k]) === k, "영어 " + ko.messages[k]);
assert(ko.templates["trigram.number"]?.source === "{c}₂ · 값 {v}" && en.messages["trigram.number"] === "{c}₂ · value {v}", "번호 틀");
console.log("trigram page: passed");
