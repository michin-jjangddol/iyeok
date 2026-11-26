// 261126_2242 LAUDE: 반대 짝 막대 4개를 더한 8구슬 여의봉 — 정적 검사 + 같은 식으로 글에 적은 내용을 계산해 확인.
//   반대 짝 막대를 빼면: 막대 하나를 바꿔도 다른 막대 0%(뼈대가 흔들림). 넣으면: 다른 막대가 버팀(변형 > 0, 단단). 반대 짝 넷을 늘이면 정육면체째 커짐.
// 실행: node tests/261126_2242_trigram-opp-rods_Laude.mjs
import assert from "node:assert";
import { readFileSync } from "node:fs";
const R = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, R), "utf8");
const T = "261126_2242";
const keyFor = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return "text." + h.toString(16).padStart(8, "0"); };
const page = read("trigrams/beads/index.html"), js = read(`trigrams/beads/${T}_rods_Laude.js`);
assert(page.includes(`${T}_rods_Laude.js`) && page.includes('data-rod-group="3"') && page.includes('id="rods-opp" aria-pressed="true"'), "반대 짝 버튼·넣기/빼기");
assert(js.includes("let useOpp = true;") && js.includes("if (d === 3) RODS.push({ i, j, line: 3, mul: 1, base: BASE_LEN * Math.sqrt(3), opp: true"), "반대 짝 막대 = 가운데를 지나는 대각선");

const data = JSON.parse(read("data/hexagrams.json"));
const ks = Object.keys(data.trigrams), code = (k) => [...data.trigrams[k].lines].reverse().join("");
const home = (k) => [code(k)[2], code(k)[1], code(k)[0]].map((b) => (b === "1" ? 1 : -1));
const hd = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
const EDGE = [], OPP = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const h = hd(code(ks[i]), code(ks[j])); if (h === 1) EDGE.push({ i, j, base: 2 }); if (h === 3) OPP.push({ i, j, base: 2 * Math.sqrt(3) }); }
assert(EDGE.length === 12 && OPP.length === 4, "모서리 12 + 반대 짝 4");
function run(rods, mul, steps = 5000) {
  const P = ks.map(home), V = ks.map(() => [0, 0, 0]);
  for (let n = 0; n < steps; n++) {
    const F = ks.map(() => [0, 0, 0]);
    rods.forEach((r, e) => { const d = P[r.j].map((c, a) => c - P[r.i][a]), l = Math.hypot(...d), f = 12 * (l - r.base * mul[e]); for (let a = 0; a < 3; a++) { F[r.i][a] += (f * d[a]) / l; F[r.j][a] -= (f * d[a]) / l; } });
    for (let i = 0; i < 8; i++) for (let a = 0; a < 3; a++) { V[i][a] = (V[i][a] + F[i][a] * 0.02) * 0.93; P[i][a] += V[i][a] * 0.02; }
  }
  return rods.map((r, e) => Math.hypot(...P[r.j].map((c, a) => c - P[r.i][a])) / (r.base * mul[e]));
}
// 빼면: 모서리 하나 ×1.4 → 다른 막대 0%
let ratio = run(EDGE, EDGE.map((_, e) => (e === 0 ? 1.4 : 1)));
assert(ratio.every((x) => Math.abs(x - 1) < 0.005), "반대 짝 없이: 다른 막대 0%");
// 넣으면: 같은 일에 다른 막대가 버팀(1% 넘게 변형)
const ALL = [...EDGE, ...OPP];
ratio = run(ALL, ALL.map((_, e) => (e === 0 ? 1.4 : 1)));
assert(Math.max(...ratio.slice(1).map((x) => Math.abs(x - 1))) > 0.01, "반대 짝을 넣으면 단단: 다른 막대 변형 > 1%");
// 반대 짝 넷 ×1.5 → 모든 모서리 같은 비율로 늘고, 반대 짝도 서로 같음(모양 그대로 커짐)
ratio = run(ALL, ALL.map((_, e) => (e >= 12 ? 1.5 : 1)));
const er = ratio.slice(0, 12), orr = ratio.slice(12);
assert(er.every((x) => Math.abs(x - er[0]) < 0.005 && x > 1.05) && orr.every((x) => Math.abs(x - orr[0]) < 0.005 && x < 1), "반대 짝 넷을 늘이면 정육면체째 커지고 모서리가 버팀");
const en = JSON.parse(read(`assets/i18n/${T}_en_Laude.json`));
for (const s of ["반대 짝 막대 4개", "반대 짝 막대: 넣음", "반대 짝 막대: 뺌"]) assert(en.messages[keyFor(s)]?.trim(), "영어 " + s);
assert(read("app/sw.js").includes('"iyeok-app-v96"'), "캐시 v96");
console.log("trigram opposite rods (2242): passed");
