// 261126_2206 LAUDE: 8구슬 여의봉 정적 검사 + 같은 물리 식으로 글에 적은 내용(한 효 무리 → 상자, 막대 하나 → 다른 막대 0%)을 계산해 확인.
// 실행: node tests/261126_2206_trigram-rods_Laude.mjs
import assert from "node:assert";
import { readFileSync } from "node:fs";
const R = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, R), "utf8");
const T = "261126_2206";
const keyFor = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return "text." + h.toString(16).padStart(8, "0"); };
const page = read("trigrams/beads/index.html"), js = read(`trigrams/beads/${T}_rods_Laude.js`);
assert(/id="e-title"[^]*?class="beads-text rods-section"[^]*?id="rods"[^]*?beads-back/.test(page), "구슬 실험 아래 여의봉");
assert(page.includes(`${T}_rods_Laude.js`) && page.includes("261126_2146_beads_Laude.js") && page.includes(`${T}_beads_Laude.css`), "스크립트 둘·CSS");
assert(["0", "1", "2", "all", "none"].every((g) => page.includes(`data-rod-group="${g}"`)) && ["shrink", "grow", "reset", "all-reset"].every((a) => page.includes(`data-rod-act="${a}"`)), "고르기·늘이기 버튼");
assert(js.includes("const KS = 12, BASE_LEN = 2, RAD = 0.35, HARD = 150, DT = 0.02, SUB = 8, DAMP = 0.93, MIN = 0.4, MAX = 2.5;"), "물리 값");

const data = JSON.parse(read("data/hexagrams.json"));
const ks = Object.keys(data.trigrams), code = (k) => [...data.trigrams[k].lines].reverse().join("");
const home = (k) => [code(k)[2], code(k)[1], code(k)[0]].map((b) => (b === "1" ? 1 : -1));
const hd = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
const RODS = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (hd(code(ks[i]), code(ks[j])) === 1) RODS.push({ i, j, line: [...code(ks[i])].findIndex((c, n) => c !== code(ks[j])[n]) });
assert(RODS.length === 12 && [0, 1, 2].every((l) => RODS.filter((r) => r.line === l).length === 4), "막대 12 = 효마다 4");
function run(mul, steps = 4000) {
  const P = ks.map(home), V = ks.map(() => [0, 0, 0]), KS = 12, DT = 0.02, DAMP = 0.93;
  const L = (r) => Math.hypot(...P[r.j].map((c, a) => c - P[r.i][a]));
  for (let n = 0; n < steps; n++) {
    const F = ks.map(() => [0, 0, 0]);
    RODS.forEach((r, e) => { const d = P[r.j].map((c, a) => c - P[r.i][a]), l = Math.hypot(...d), f = KS * (l - 2 * mul[e]); for (let a = 0; a < 3; a++) { F[r.i][a] += (f * d[a]) / l; F[r.j][a] -= (f * d[a]) / l; } });
    for (let i = 0; i < 8; i++) for (let a = 0; a < 3; a++) { V[i][a] = (V[i][a] + F[i][a] * DT) * DAMP; P[i][a] += V[i][a] * DT; }
  }
  return { L, P };
}
// 한 효(위 효) 무리 ×2 → 상자: 위 효 막대 4, 나머지 2
let mul = RODS.map((r) => (r.line === 0 ? 2 : 1)), s = run(mul);
assert(RODS.every((r, e) => Math.abs(s.L(r) - 2 * mul[e]) < 0.01), "한 효 무리: 모든 막대 제 길이(상자)");
// 막대 하나 ×1.5 / ×0.6 → 다른 막대 0% 변형, 그래도 모양은 바뀜(면의 대각선 하나 이상 달라짐)
for (const m of [1.5, 0.6]) {
  mul = RODS.map((_, e) => (e === 0 ? m : 1)); s = run(mul);
  assert(RODS.every((r, e) => Math.abs(s.L(r) / (2 * mul[e]) - 1) < 0.005), "막대 하나: 다른 막대 변형 0% (" + m + ")");
  const diag = [];
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (hd(code(ks[i]), code(ks[j])) === 2) diag.push(Math.hypot(...s.P[j].map((c, a) => c - s.P[i][a])));
  assert(diag.some((x) => Math.abs(x - 2 * Math.SQRT2) > 0.1), "막대 하나: 상자가 비틀림 (" + m + ")");
}
const en = JSON.parse(read(`assets/i18n/${T}_en_Laude.json`));
for (const s2 of ["8구슬 여의봉", "늘어나라!", "줄어들어라!", "다른 막대의 변형", "위 효 막대 4개"]) assert(en.messages[keyFor(s2)]?.trim(), "영어 " + s2);
assert(read("app/sw.js").includes('"iyeok-app-v95"'), "캐시 v95");
console.log("trigram rods (2206): passed");
