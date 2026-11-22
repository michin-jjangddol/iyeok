// 261122_1833 LAUDE: 시초점 용어(태시초·인시초)와 시초판 자리 이름(태시초·정시초·윤시초 자리) 검사.
// 지금 화면이 실제로 불러오는 파일에서 옛 이름(사람시초, '처음 따로 둔 것', '작업하는 자리')이 사라졌는지와
// 설명 모듈이 새 이름으로 같은 계산을 읽는지 확인한다. 실행: node tests/261122_1833_yarrow-terms_Laude.mjs
import fs from "node:fs";
import assert from "node:assert/strict";
const base = new URL("../", import.meta.url).pathname;
const read = (p) => fs.readFileSync(base + p, "utf8");
const learnHtml = read("yarrow/learn/index.html");
const learnJs = learnHtml.match(/src="(261122_\d{4}_learn_\w+\.js)"/)[1];
const js = read("yarrow/learn/" + learnJs);
const imports = [...js.matchAll(/from "\.\/([^"]+)"/g)].map((m) => "yarrow/learn/" + m[1]);
const active = ["yarrow/learn/" + learnJs, ...imports, "yarrow/options/index.html"];
for (const p of active) {
  const body = read(p).split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
  assert(!/사람시초/.test(body), `${p}: 사람시초 남음`);
  assert(!/처음 따로 둔 것|작업하는 자리/.test(body), `${p}: 옛 자리 이름 남음`);
}
assert(js.includes("태시초 자리") && js.includes("정시초 자리") && js.includes("윤시초 자리"), "자리 이름");
const opt = read("yarrow/options/index.html");
assert(opt.includes("인시초(人蓍草)") && opt.includes("태시초(太蓍草)") && opt.includes("윤시초 자리에는 매 차례의 윤시초와 인시초를 함께 모아 둡니다"), "옵션 정의");
const whyPath = imports.find((p) => p.includes("why-ko"));
const { explainLine, readingText, TERM_NOTE } = await import(base + whyPath);
assert(TERM_NOTE.includes("태시초") && TERM_NOTE.includes("인시초"));
const e = explainLine([9, 4, 8], 28);
assert(e.ok && e.value === 7 && e.total === 50);
const yun = readingText(e, "yun").join(" ");
assert(yun.includes("윤시초와 인시초를 합쳐 9가지 → 다") && !yun.includes("사람시초"));
const scenes = read(imports.find((p) => p.includes("scenes-ko")));
assert(scenes.includes("하늘과 땅의 두 무더기에서 사람을 상징하여 매 차례 덜어 두는 한 개"), "인시초 첫 설명");
assert(scenes.includes("윤시초 자리에는 매 차례의 윤시초와 인시초를 함께 모아 둡니다"), "윤시초 자리 설명");
console.log({ active: active.length, terms: "passed" });
