// 261123_1036 LAUDE: 문구 전통 방식·아이역 방식(이전 판 261122_2047 검사). 그 앞: 음양 대응을 정효점·윤효점 모두에 적용(이전 판 261122_2014 를 이었다). 정효점 홀=양·짝=음 / 홀=음·짝=양.
// 실행: node tests/261123_1036_yarrow-mapping-wording_Laude.mjs
// - 양쪽 덜기·모든 분할 경로에서: 전통 방식 = 정시초 산수, 반전 대응 = 15 − 산수, 같은 대응이면 정효점 = 윤효점
// - 소·다 8조합 × 두 대응 판정표, 반전 전후 음양은 반대·변효 여부는 같음
// - 같은 여섯 효 기록을 두 대응으로 읽으면 본괘 6비트 모두 반전, 변효 위치 같음, 지괘도 모두 반전
// - 설정: 기본값·옛 저장값 호환·잘못된 값은 전통 방식
// - 지금 화면이 실제로 불러오는 파일(시초판 이름은 PR #100의 짧은 이름: 태시초·정시초·윤시초)
import fs from "node:fs";
import assert from "node:assert/strict";
const base = new URL("../", import.meta.url).pathname;
const read = (p) => fs.readFileSync(base + p, "utf8");

const learnJs = read("yarrow/learn/index.html").match(/src="(\d{6}_\d{4}_learn_\w+\.js)"/)[1];
const js = read("yarrow/learn/" + learnJs);
const why = "yarrow/learn/" + js.match(/from "\.\/(\d{6}_\d{4}_why-ko_\w+\.js)"/)[1];
const settingsPath = "yarrow/" + js.match(/from "\.\.\/(\d{6}_\d{4}_settings_\w+\.js)"/)[1];
const W = await import(base + why);
const { round, minLeft, maxLeft } = await import(base + "yarrow/learn/261120_2155_procedure_Laude.js");
const I = await import(base + "app/iching.js");

// 1) 모든 경로
let paths = 0;
const table = {};
for (const side of ["left", "right"]) for (let a = minLeft(49, side); a <= maxLeft(49, side); a++) {
  const r1 = round(49, a, side);
  for (let b = minLeft(r1.next, side); b <= maxLeft(r1.next, side); b++) {
    const r2 = round(r1.next, b, side);
    for (let c = minLeft(r2.next, side); c <= maxLeft(r2.next, side); c++) {
      const r3 = round(r2.next, c, side);
      const e = W.explainLine([r1.removed, r2.removed, r3.removed], r3.next);
      assert(e.ok, "정상 기록이 오류로 처리됨");
      assert.equal(e.value, r3.next / 4, "정시초 산수는 그대로");
      const t = W.appliedLine(e, "yun", "traditional"), v = W.appliedLine(e, "yun", "inverted");
      assert.equal(t.value, e.value);
      assert.equal(v.value, 15 - e.value);
      assert.equal(W.appliedLine(e, "jeong", "inverted").value, v.value, "같은 반전 대응이면 정효점 = 윤효점");
      assert.equal(W.appliedLine(e, "jeong", "traditional").value, t.value, "같은 전통 방식이면 정효점 = 윤효점");
      assert.equal(W.appliedLine(e, "jeong", "inverted").info.yang, e.value % 2 === 0, "정효점 반전: 짝수 = 양");
      assert.equal(t.info.yang, !v.info.yang, "음양 반대");
      assert.equal(t.info.moving, v.info.moving, "변효 여부 같음");
      table[e.seq] = [t.value, v.value, e.pattern.name];
      paths++;
    }
  }
}
const want = {
  "소·소·소": [9, 6, "삼소"], "소·소·다": [8, 7, "일다이소"], "소·다·소": [8, 7, "일다이소"], "다·소·소": [8, 7, "일다이소"],
  "소·다·다": [7, 8, "일소이다"], "다·소·다": [7, 8, "일소이다"], "다·다·소": [7, 8, "일소이다"], "다·다·다": [6, 9, "삼다"],
};
assert.deepEqual(table, want, "소·다 8조합 × 두 대응 판정표");

// 2) 사진 예: 5·8·4 → 정시초 32 ÷ 4 = 8, 반전 적용 7
const ex = W.explainLine([5, 8, 4], 32);
assert.equal(ex.value, 8);
const yunInv = W.readingText(ex, "yun", "inverted").join(" ");
assert(yunInv.includes("5가지 → 소 → 음(−)") && yunInv.includes("8가지 → 다 → 양(+)") && yunInv.includes("− + − → 음 둘·양 하나 → 혼자 다른 양이 정함 → 소양(少陽) · 변하지 않는 양효"), yunInv);
// 윤효점 설명에는 정효점의 수가 없다(가지 수 5·8·4·17 은 있어도 효의 수 6~9 와 '÷ 4' 는 없다)
for (const m of ["traditional", "inverted"]) {
  const t = W.readingText(ex, "yun", m).join(" ");
  assert(!/÷ 4|→ [6789] ·|[6789] · (노|소)[양음]/.test(t), "윤효점 설명에 정효점의 수: " + t);
}
assert.equal(W.headlineFor(7, "yun"), "이번 효: 소양(少陽) · 변하지 않는 양효");
assert.equal(W.headlineFor(7, "jeong"), "이번 효: 7 · 소양(少陽)");
assert.equal(W.lineLabel(9, "yun"), "노양");
const jInv = W.readingText(ex, "jeong", "inverted").join(" ");
assert(jInv.includes("32 ÷ 4 = 8") && jInv.includes("8은 짝수 → 양(+) · 7·8이라 변하지 않는 효 → 소양(少陽) · 변하지 않는 양효 (홀=음·짝=양 · 아이역 방식)") && jInv.includes("이번 효는 8 · 소양"), jInv);
const jTr = W.readingText(ex, "jeong", "traditional").join(" ");
assert(jTr.includes("8은 짝수 → 음(−) · 7·8이라 변하지 않는 효 → 소음(少陰)") && jTr.includes("(홀=양·짝=음 · 전통 방식)"), jTr);
assert.equal(W.headlineFor(7, "jeong", "inverted"), "이번 효: 8 · 소양(少陽)");
assert.equal(W.lineLabel(6, "jeong", "inverted"), "9 노음");
assert.equal(W.criterionText("jeong", "inverted"), "정효점 · 홀=음·짝=양 · 아이역 방식");
assert.equal(W.criterionText("jeong"), "정효점 · 홀=양·짝=음 · 전통 방식");
assert(!yunInv.includes("32 ÷ 4 = 7"));
assert(!W.explainLine([5, 8, 7], 29).ok, "예상 밖 기록은 여전히 오류");

// 3) 같은 여섯 효 기록 → 괘 반전
const YANG_COUNT = { 6: 0, 7: 1, 8: 2, 9: 3 };
const types = (vals) => vals.map((v) => I.lineTypeFromYangCount(YANG_COUNT[v]));
let hexes = 0;
for (let n = 0; n < 4096; n++) {
  const vals = [0, 1, 2, 3, 4, 5].map((k) => 6 + ((n >> (2 * k)) & 3));
  const tT = types(vals), tV = types(vals.map((v) => 15 - v));
  const pT = I.primaryLines(tT), pV = I.primaryLines(tV);
  assert(pT.every((b, i) => b !== pV[i]), "본괘 6비트 모두 반전");
  assert.deepEqual(I.changingPositions(tT), I.changingPositions(tV), "변효 위치 같음");
  const cT = I.changedLines(tT), cV = I.changedLines(tV);
  assert(cT.every((b, i) => b !== cV[i]), "지괘 6비트 모두 반전");
  hexes++;
}

// 4) 설정
let saved = {};
global.localStorage = { getItem: (k) => saved[k] ?? null, setItem: (k, v) => (saved[k] = v), removeItem: (k) => delete saved[k] };
const S = await import(base + settingsPath);
assert.equal(S.loadSettings().yunMapping, "traditional", "기본값 전통 방식");
saved[S.STORAGE_KEY] = JSON.stringify({ takeSide: "left", pace: "fast", readingMethod: "yun" });
assert.deepEqual(S.loadSettings(), { takeSide: "left", pace: "fast", readingMethod: "yun", yunMapping: "traditional", symbols: "iyeok", motionStart: "CR", motionSpeed: "5" }, "옛 저장값 호환");
saved[S.STORAGE_KEY] = JSON.stringify({ takeSide: "left", pace: "fast", readingMethod: "yun", yunMapping: "upside" });
assert.equal(S.loadSettings().yunMapping, "traditional", "잘못된 값은 전통 방식");
assert(S.saveSettings({ takeSide: "right", pace: "step", readingMethod: "jeong", yunMapping: "inverted" }));
assert.equal(S.loadSettings().yunMapping, "inverted", "정효점에서도 대응 저장");
assert.equal(S.mappingShort("jeong", "inverted"), "홀=음·짝=양 · 아이역 방식");
assert.equal(S.mappingShort("yun", "traditional"), "소=양·다=음 · 전통 방식");

// 5) 지금 화면 파일: 옛 이름 없음, 짧은 시초판 이름, 산수와 적용 효를 나눠 기록
for (const p of ["yarrow/learn/" + learnJs, why, "yarrow/options/index.html"]) {
  const body = read(p).split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
  assert(!/사람시초/.test(body), p + ": 사람시초 남음");
}
assert(js.includes('zone-label">태시초<') && js.includes('zone-label">정시초<'), "시초판 이름(PR #100)");
assert(js.includes("calcValue: lineOf(state.final).value") && js.includes("(ln.calcValue ?? ln.value) * 4"), "산수·적용 효 분리");
const opt = read("yarrow/options/index.html");
assert(opt.includes('name="yunMapping" value="traditional" checked') && opt.includes('name="yunMapping" value="inverted"') && opt.includes("정효점: 홀수(7·9)=음 · 짝수(6·8)=양") && opt.includes("(정효점·윤효점 모두)") && !/id="yin-yang-mapping" hidden/.test(opt));
assert(js.includes("LINE_TABLE_INV") && !js.includes("이 비교 결과와 실제로 적용한 효가 다릅니다"), "정효점 반전 판정표, 비교 경고 없음");
console.log({ paths, combos: Object.keys(table).length, hexes, settings: "passed", files: "passed" });
// 261123_1036: 화면 글에 옛 이름('반전 대응', '전통 대응')이 남지 않는다(주석 제외).
for (const p of ["yarrow/options/index.html", why, "yarrow/learn/" + learnJs, settingsPath, "yarrow/learn/" + js.match(/from "\.\/(\d{6}_\d{4}_scenes-ko_\w+\.js)"/)[1]]) {
  const body = read(p).split("\n").filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("<!--")).join("\n");
  assert(!/반전 대응|전통 대응/.test(body), p + ": 옛 문구 남음");
}
assert(opt.includes("<b>전통 방식 — 기본값</b>") && opt.includes("<b>아이역 방식</b>"), "옵션 카드 제목");
console.log("wording: passed");
