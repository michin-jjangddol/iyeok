// 261127_0708 LAUDE: 여의봉 길이 배율 눈금(×1 가운데)·반대 짝 만남(견우와 직녀) 확인. 실행: node tests/261127_0708_trigram-rods-meet_Laude.mjs
import assert from "node:assert";
import { readFileSync } from "node:fs";
const R = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, R), "utf8");
const T = "261127_0708";
const keyFor = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return "text." + h.toString(16).padStart(8, "0"); };
const page = read("trigrams/beads/index.html"), js = read(`trigrams/beads/${T}_rods_Laude.js`);
const m = page.match(/id="rods-len" min="([-\d.]+)" max="([-\d.]+)" step="([\d.]+)" value="([-\d.]+)"/);
assert(m && Number(m[1]) === -Number(m[2]) && Number(m[4]) === 0, "눈금 좌우 대칭, 처음 값 가운데");
assert(Math.abs(Math.exp(Number(m[1])) - 0.2) < 0.001 && Math.abs(Math.exp(Number(m[2])) - 5) < 0.01, "끝 = ×0.2, ×5");
assert(Number.isInteger(Math.round((Number(m[2]) - Number(m[1])) / Number(m[3]) * 1e6) / 1e6), "눈금 끝이 걸음에 맞음");
assert(js.includes("MIN = 0.2, MAX = 5;") && js.includes("Math.exp(Number(slider.value))") && js.includes("len(r) < 2 * RAD + 0.06"), "배율 눈금·만남 판정");
assert(page.includes('id="rods-meet"') && page.includes(`${T}_rods_Laude.js`), "만남 알림 자리");
// 같은 식: 반대 짝 막대(건–곤) ×0.2 → 맞닿음(거리 ≈ 0.7 = 구슬 지름)
const data = JSON.parse(read("data/hexagrams.json"));
const ks = Object.keys(data.trigrams), code = (k) => [...data.trigrams[k].lines].reverse().join("");
const home = (k) => [code(k)[2], code(k)[1], code(k)[0]].map((b) => (b === "1" ? 1 : -1));
const hd = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
const rods = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const h = hd(code(ks[i]), code(ks[j])); if (h === 1) rods.push({ i, j, base: 2, mul: 1 }); if (h === 3) rods.push({ i, j, base: 2 * Math.sqrt(3), mul: 1, opp: true }); }
const qk = rods.find((r) => r.opp && [ks[r.i], ks[r.j]].sort().join() === "kun,qian");
qk.mul = 0.2;
const P = ks.map(home), V = ks.map(() => [0, 0, 0]);
for (let n = 0; n < 8000; n++) {
  const F = ks.map(() => [0, 0, 0]);
  const push = (i, j, f) => { const d = P[j].map((c, a) => c - P[i][a]), l = Math.hypot(...d) || 1e-9; for (let a = 0; a < 3; a++) { F[i][a] += (f * d[a]) / l; F[j][a] -= (f * d[a]) / l; } };
  for (const r of rods) push(r.i, r.j, 12 * (Math.hypot(...P[r.j].map((c, a) => c - P[r.i][a])) - r.base * r.mul));
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const l = Math.hypot(...P[j].map((c, a) => c - P[i][a])); if (l < 0.7) push(i, j, -150 * (0.7 - l)); }
  for (let i = 0; i < 8; i++) for (let a = 0; a < 3; a++) { V[i][a] = (V[i][a] + F[i][a] * 0.01) * 0.93; P[i][a] += V[i][a] * 0.01; }
}
const dqk = Math.hypot(...P[qk.j].map((c, a) => c - P[qk.i][a]));
assert(dqk < 0.76, "반대 짝 ×0.2 → 만남 " + dqk.toFixed(3));
const en = JSON.parse(read(`assets/i18n/${T}_en_Laude.json`));
assert(en.messages[keyFor("반대 짝이 가운데에서 만났습니다! 견우와 직녀처럼요.")]?.trim(), "영어");
assert(read("app/sw.js").includes('"iyeok-app-v97"'), "캐시 v97");
console.log("trigram rods meet (0708): passed");
