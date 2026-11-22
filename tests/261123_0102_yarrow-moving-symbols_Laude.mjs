// 261123_0102 LAUDE: 시초점 변효 기호 선택 검사. 실행: node tests/261123_0102_yarrow-moving-symbols_Laude.mjs
// - 모든 판정 기준(정효점·윤효점 × 전통·반전) × 두 기호: 판정된 노양·노음에 고른 기호, 소양·소음은 기호 없음
// - 기호는 숫자가 아니라 효 종류에 붙는다(반전으로 9가 노음이면 노음 기호)
// - 기호를 바꿔도 판정(적용 효)은 그대로
// - 안내표·설명 문장 속 기호, 설정 기본값·호환·잘못된 값
import fs from "node:fs";
import assert from "node:assert/strict";
const base = new URL("../", import.meta.url).pathname;
const read = (p) => fs.readFileSync(base + p, "utf8");
const learnJs = read("yarrow/learn/index.html").match(/src="(\d{6}_\d{4}_learn_\w+\.js)"/)[1];
const js = read("yarrow/learn/" + learnJs);
const why = "yarrow/learn/" + js.match(/from "\.\/(\d{6}_\d{4}_why-ko_\w+\.js)"/)[1];
const scenes = "yarrow/learn/" + js.match(/from "\.\/(\d{6}_\d{4}_scenes-ko_\w+\.js)"/)[1];
const settingsPath = "yarrow/" + js.match(/from "\.\.\/(\d{6}_\d{4}_settings_\w+\.js)"/)[1];
const W = await import(base + why);
const SC = await import(base + scenes);
const WANT = { iyeok: { 노양: "×", 노음: "○" }, classic: { 노양: "○", 노음: "×" } };
let checks = 0;
for (const method of ["jeong", "yun"]) for (const mapping of ["traditional", "inverted"]) for (const sym of ["iyeok", "classic"]) {
  for (const calc of [6, 7, 8, 9]) {
    const g = { 6: [9, 8, 8], 7: [5, 8, 8], 8: [5, 4, 8], 9: [5, 4, 4] }[calc];
    const e = W.explainLine(g, calc * 4);
    const a = W.appliedLine(e, method, mapping);
    const other = W.appliedLine(e, method, mapping); // 기호와 무관하게 판정은 같다
    assert.equal(a.value, other.value);
    const name = a.info.name, mark = W.movingMark(a.value, sym);
    if (name === "노양" || name === "노음") assert.equal(mark, WANT[sym][name], `${method}/${mapping}/${sym}/${calc}: ${name} → ${mark}`);
    else assert.equal(mark, "", "소양·소음은 기호 없음");
    if (mapping === "inverted" && calc === 9) assert.equal(name, "노음", "반전에서 9는 노음");
    const meaning = W.lineMeaning(a.value, sym);
    if (mark) assert(meaning.includes(`변효(${mark})`), meaning);
    const text = W.readingText(e, method, mapping, sym).join(" ");
    if (method === "jeong" && mark) assert(text.includes(`변효(${mark})`) && !text.includes(`변효(${mark === "×" ? "○" : "×"})`), text);
    checks++;
  }
  const table = SC.lineTable(method, mapping, sym);
  assert(table.includes(`노양(변하는 양, ${WANT[sym].노양})`) && table.includes(`노음(변하는 음, ${WANT[sym].노음})`), table);
  if (method === "jeong") assert(table.includes(mapping === "inverted" ? `36 → 9 노음(변하는 음, ${WANT[sym].노음})` : `36 → 9 노양(변하는 양, ${WANT[sym].노양})`), table);
}
assert.equal(W.movingMark(9, "nope"), "×", "모르는 값은 기본 기호");
// 설정
let saved = {};
global.localStorage = { getItem: (k) => saved[k] ?? null, setItem: (k, v) => (saved[k] = v), removeItem: (k) => delete saved[k] };
const S = await import(base + settingsPath);
assert.equal(S.loadSettings().symbols, "iyeok", "기본값");
saved[S.STORAGE_KEY] = JSON.stringify({ takeSide: "left", pace: "fast", readingMethod: "yun", yunMapping: "inverted" });
assert.deepEqual(S.loadSettings(), { takeSide: "left", pace: "fast", readingMethod: "yun", yunMapping: "inverted", symbols: "iyeok" }, "옛 저장값 호환");
saved[S.STORAGE_KEY] = JSON.stringify({ takeSide: "left", symbols: "x" });
assert.equal(S.loadSettings().symbols, "iyeok", "잘못된 값은 기본값");
assert(S.saveSettings({ ...S.DEFAULT_SETTINGS, symbols: "classic" }));
assert.equal(S.loadSettings().symbols, "classic");
assert(!saved["iyeok.coin.settings.v1"], "동전점 설정은 건드리지 않음");
// 화면 파일: 고정 기호 문자열 없음
const body = js.split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
assert(!/"×"|"○"/.test(body) && !/\.mark\b(?!\s*=)/.test(body.replace(/c\.mark = /g, "")), "learn 모듈에 고정 기호·.mark 사용 남음");
const opt = read("yarrow/options/index.html");
assert(opt.includes('name="symbols" value="iyeok" checked') && opt.includes('name="symbols" value="classic"') && opt.includes("기호 선택은 표시만 바꾸며 계산과 점괘에는 영향을 주지 않습니다."));
console.log({ checks, tables: 8, settings: "passed", files: "passed" });
