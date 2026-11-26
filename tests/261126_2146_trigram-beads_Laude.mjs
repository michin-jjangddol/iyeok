// 261126_2146 LAUDE: 2탄 8괘 구슬 페이지 정적 검사 + 같은 물리 식으로 온도 실험 결과(표에 적은 내용)를 계산해 확인.
// 실행: node tests/261126_2146_trigram-beads_Laude.mjs
import assert from "node:assert";
import { readFileSync } from "node:fs";
const R = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, R), "utf8");
const T = "261126_2146";
const keyFor = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return "text." + h.toString(16).padStart(8, "0"); };

const more = read("trigrams/more/index.html"), page = read("trigrams/beads/index.html"), js = read(`trigrams/beads/${T}_beads_Laude.js`);
assert(/id="net-h"[^]*?class="octa-next"[^]*?href="\.\.\/beads\/"[^]*?octa-back/.test(more), "8면체 페이지 맨 아래 2탄 버튼");
assert(page.includes(`${T}_beads_Laude.js`) && page.includes(`${T}_beads_Laude.css`) && page.includes(`${T}_language_Laude.js`), "페이지 파일");
assert(page.includes('id="beads-temp" min="-1" max="1"') && ["all", "qiankun", "kanli", "duigen", "zhenxun"].every((k) => page.includes(`data-pair="${k}"`)), "온도·짝");
assert(["calm", "cold-one", "hot-one", "cold-all", "hot-all"].every((r) => page.includes(`data-regime="${r}"`)), "상황 글 다섯");
assert(js.includes("const K = 3, REST = 2, RAD = 0.35, HARD = 150, DT = 0.02, SUB = 8, DAMP = 0.95, SMAX = 0.6 * K;"), "물리 값");

// 처음 자리: 거리 = 효 차이(제곱 비례)
const data = JSON.parse(read("data/hexagrams.json"));
const ks = Object.keys(data.trigrams), code = (k) => [...data.trigrams[k].lines].reverse().join("");
const home = (k) => [code(k)[2], code(k)[1], code(k)[0]].map((b) => (b === "1" ? 1 : -1));
const hd = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
for (const a of ks) for (const b of ks) if (a !== b) { const d2 = home(a).reduce((t, v, i) => t + (v - home(b)[i]) ** 2, 0); assert(d2 === 4 * hd(code(a), code(b)), "거리² ∝ 효 차이"); }

// 같은 식으로 시뮬레이션: 표에 적은 네 실험
const K = 3, REST = 2, RAD = 0.35, HARD = 150, DT = 0.02, DAMP = 0.95, SMAX = 0.6 * K;
const E = []; for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (hd(code(ks[i]), code(ks[j])) === 1) E.push([i, j]);
assert(E.length === 12, "고무줄 12");
const OPP = [["qian", "kun"], ["kan", "li"], ["dui", "gen"], ["zhen", "xun"]].map(([a, b]) => [ks.indexOf(a), ks.indexOf(b)]);
function run(pairs, temp, steps = 6000) {
  const P = ks.map(home), V = ks.map(() => [0, 0, 0]), s = -temp * SMAX;
  for (let n = 0; n < steps; n++) {
    const F = ks.map(() => [0, 0, 0]);
    const pull = (i, j, f) => { const d = P[j].map((c, a) => c - P[i][a]), L = Math.hypot(...d) || 1e-9; for (let a = 0; a < 3; a++) { F[i][a] += (f * d[a]) / L; F[j][a] -= (f * d[a]) / L; } };
    for (const [i, j] of E) { const L = Math.hypot(...P[j].map((c, a) => c - P[i][a])); if (L > REST) pull(i, j, K * (L - REST)); }
    for (const [i, j] of pairs) pull(i, j, s);
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const L = Math.hypot(...P[j].map((c, a) => c - P[i][a])); if (L < 2 * RAD) pull(i, j, -HARD * (2 * RAD - L)); }
    for (let i = 0; i < 8; i++) for (let a = 0; a < 3; a++) { V[i][a] = (V[i][a] + F[i][a] * DT) * DAMP; P[i][a] += V[i][a] * DT; }
  }
  const dist = (i, j) => Math.hypot(...P[j].map((c, a) => c - P[i][a]));
  return { dist, taut: E.filter(([i, j]) => dist(i, j) > REST * 1.01).length, slack: E.filter(([i, j]) => dist(i, j) < REST * 0.99).length };
}
const [qk, kl] = OPP;
let r = run([qk], -1);
assert(r.dist(...qk) < 0.8 && Math.abs(r.dist(...kl) - 2 * Math.sqrt(3)) < 0.05 && r.taut === 0 && r.slack === 6, "추움·한 쌍: 붙고, 나머지 그대로, 여섯 줄 느슨");
r = run([qk], 1);
assert(r.dist(...qk) > 6 && r.dist(...kl) < 2.4 && r.taut === 12, "더움·한 쌍: 멀어지고, 여섯이 끌려 들어가고, 열두 줄 팽팽");
r = run(OPP, -1);
assert(OPP.every((p) => r.dist(...p) < 1.4) && r.taut === 0, "추움·네 쌍: 작은 정육면체로 뭉침");
r = run(OPP, 1);
const o = OPP.map((p) => r.dist(...p));
assert(o.every((d) => Math.abs(d - o[0]) < 0.02 && d > 3.8) && r.taut === 12, "더움·네 쌍: 큰 정육면체, 고르게 팽팽");

const en = JSON.parse(read(`assets/i18n/${T}_en_Laude.json`));
for (const s of ["8괘 구슬", "2탄: 8괘 구슬 →", "온도 실험", "구슬의 기분", "추움", "더움", "보통"]) assert(en.messages[keyFor(s)]?.trim(), "영어 " + s);
assert(read("app/sw.js").includes('"iyeok-app-v94"'), "캐시 v94");
for (const f of ["index.html", "app/index.html", "yarrow/index.html", "yarrow/try/index.html", "yarrow/learn/index.html", "yarrow/options/index.html", "thoughts/one-and-two/index.html", "trigrams/index.html", "trigrams/more/index.html", "trigrams/beads/index.html"]) assert(read(f).includes(`${T}_language_Laude.js`), "사전 판 " + f);
console.log("trigram beads (2146): passed");
