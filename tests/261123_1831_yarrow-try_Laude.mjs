// 261123_1831 LAUDE: 시초점 맛보기(yarrow/try/) 정적 검사. 실행: node tests/261123_1831_yarrow-try_Laude.mjs
// - 맛보기가 배우기와 같은 공용 계산·판정·설정 모듈을 쓰는지(복제 없음)
// - 메뉴 [바로 시작] → try/, 준비 안내 대화상자 연결 없음
// - 언어 사전 새 판·동전점 캐시
// - 괘사 공용 모듈의 괘 식별자
import fs from "node:fs";
import assert from "node:assert/strict";
const base = new URL("../", import.meta.url).pathname;
const read = (p) => fs.readFileSync(base + p, "utf8");
const exists = (p) => fs.existsSync(base + p);

const page = read("yarrow/try/index.html");
const jsName = page.match(/src="(\d{6}_\d{4}_try_Laude\.js)"/)[1];
const js = read("yarrow/try/" + jsName);
const imports = [...js.matchAll(/from "([^"]+)"/g)].map((m) => m[1]);
for (const i of imports) assert(exists(new URL(i, "file://" + base + "yarrow/try/").pathname.slice(base.length)), "import 없음: " + i);
// 배우기 화면이 쓰는 것과 같은 판정·설정 모듈
const learnJs = read("yarrow/learn/" + read("yarrow/learn/index.html").match(/src="(\d{6}_\d{4}_learn_\w+\.js)"/)[1]);
const learnWhy = learnJs.match(/from "\.\/(\d{6}_\d{4}_why-ko_\w+\.js)"/)[1];
const learnSettings = learnJs.match(/from "\.\.\/(\d{6}_\d{4}_settings_\w+\.js)"/)[1];
assert(imports.includes("../learn/" + learnWhy), "판정 모듈이 배우기와 같아야 함");
assert(imports.includes("../" + learnSettings), "설정 모듈이 배우기와 같아야 함");
assert(imports.includes("../learn/261120_2155_procedure_Laude.js") && imports.includes("../../app/iching.js"), "나누기 계산·괘 계산 공용");
// 계산 함수를 따로 만들지 않는다
assert(!/function (remainder|round|appliedValue|movingMark|lineTypeFromYangCount)\b/.test(js), "계산 복제 없음");
assert(!/Math\.random|crypto/.test(js), "무작위로 분할하지 않음");
// 직접 조절·다시 뽑기 없음
assert(!/split-range|mode-manual|motion-again|split-confirm/.test(page + js), "직접 조절·다시 뽑기·확인 버튼 없음");
// 메뉴
const menu = read("yarrow/index.html");
assert(menu.includes('<a class="ymenu-btn ymenu-primary" id="ymenu-start" href="try/">바로 시작</a>'));
assert(menu.includes('querySelectorAll("button.yarrow-choice")') && !menu.includes("#ymenu-start\")"), "바로 시작은 준비 안내를 열지 않음");
assert(!/준비 중이며, 누르면 준비 안내/.test(menu));
// 언어 사전·캐시
const lang = page.match(/i18n\/(\d{6}_\d{4})_language_Laude\.js/)[1];
for (const p of ["index.html", "app/index.html", "yarrow/index.html", "yarrow/options/index.html", "yarrow/learn/index.html"]) assert(read(p).includes(`${lang}_language_Laude.js`), p + " 언어 모듈");
const sw = read("app/sw.js");
assert(sw.includes('"iyeok-app-v75"') && ["language_Laude.js", "locales_Laude.json", "ko_Laude.json", "en_Laude.json"].every((f) => sw.includes(`${lang}_${f}`) && exists(`assets/i18n/${lang}_${f}`)));
const en = JSON.parse(read(`assets/i18n/${lang}_en_Laude.json`)).messages;
const keyFor = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return "text." + (h >>> 0).toString(16).padStart(8, "0"); };
assert.equal(en[keyFor("시초점 맛보기")], "Yarrow Divination (Trial)");
assert(en[keyFor("를 이용할 수 있습니다. 나의 기록·회고·소통은 준비 중입니다.")]);
// 괘사 모듈
global.location = { href: "https://iyeok.org/yarrow/try/" };
const T = await import(base + "assets/261123_1831_hexagram-texts_Laude.js");
assert.equal(T.hexId({ lines: [1, 0, 0, 0, 0, 0] }), "000001");
console.log({ imports: imports.length, menu: "passed", i18n: lang, texts: "passed" });
