// 261126_2110 LAUDE: 8괘 더 알아보기(8면체) 페이지 정적 검사 + 페이지에 적은 개수·규칙을 직접 계산해 확인.
// 실행: node tests/261126_2110_trigram-more_Laude.mjs
import assert from "node:assert";
import { readFileSync, existsSync } from "node:fs";
const R = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, R), "utf8");
const T = "261126_2110";
const keyFor = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return "text." + h.toString(16).padStart(8, "0"); };

// 연결: 8괘 페이지 맨 아래 버튼 → trigrams/more/
const tri = read("trigrams/index.html"), page = read("trigrams/more/index.html"), js = read(`trigrams/more/${T}_octa_Laude.js`);
assert(/id="flag-title"[^]*?class="tri-more"[^]*?href="more\/"[^]*?tri-back/.test(tri), "8괘 맨 아래 버튼");
assert(page.includes(`${T}_octa_Laude.js`) && page.includes(`${T}_octa_Laude.css`) && page.includes(`${T}_language_Laude.js`), "페이지 파일");
assert(existsSync(new URL(`trigrams/more/${T}_octa_Laude.css`, R)), "CSS");
assert(js.includes('const GRAY = ["kun", "zhen", "dui", "kan", "xun", "qian", "li", "gen"];') && js.includes("TRIGRAM_ORDERS.xiantian") && js.includes("TRIGRAM_ORDERS.iyeok"), "길 세 가지");
assert(page.includes('class="octa-canvas" tabindex="0" role="img"') && page.includes('touch-action') === false && read(`trigrams/more/${T}_octa_Laude.css`).includes("touch-action: none"), "캔버스 접근성·손가락");

// 계산: 면 = 부호(아래 효 x, 가운데 y, 위 z). 이웃 면 = 부호 하나 다름 → 8괘 효 차이와 같은 구조
const data = JSON.parse(read("data/hexagrams.json"));
const code = (k) => [...data.trigrams[k].lines].reverse().join("");
const ks = Object.keys(data.trigrams);
const hd = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
const V = [0, 1, 2, 3, 4, 5, 6, 7], E = [];
for (const a of V) for (const b of V) if (a < b && [1, 2, 4].includes(a ^ b)) E.push([a, b]);
assert(E.length === 12, "모서리 12");
// 자연 배치: 면 v 에 이진수 v 의 괘 → 이웃 12/12 한 효, 맞은편 4/4 반대
const nat = (v) => ks.find((k) => parseInt(code(k), 2) === v);
assert(E.every(([a, b]) => hd(code(nat(a)), code(nat(b))) === 1) && [0, 1, 2, 3].every((v) => hd(code(nat(v)), code(nat(7 - v))) === 3), "자연 배치 12/12 · 4/4");
// 순서로 위 네 면 → 아래 네 면: 위 고리 (z=1) x,y 를 돌며
const ring = [[1, 1], [0, 1], [0, 0], [1, 0]];
const faces = [...ring.map(([x, y]) => (1 << 2) | (y << 1) | x), ...ring.map(([x, y]) => (y << 1) | x)];
const TO = { xiantian: ["qian", "dui", "li", "zhen", "xun", "kan", "gen", "kun"], iyeok: ["qian", "xun", "li", "gen", "dui", "kan", "zhen", "kun"] };
for (const seq of Object.values(TO)) {
  const at = new Map(faces.map((f, i) => [f, seq[i]]));
  assert(E.filter(([a, b]) => hd(code(at.get(a)), code(at.get(b))) === 1).length === 8, "순서 배치 이웃 8/12");
  assert([0, 1, 2, 3].filter((v) => hd(code(at.get(v)), code(at.get(7 - v))) === 3).length === 0, "순서 배치 맞은편 0/4");
  const steps = seq.slice(0, -1).map((k, i) => hd(code(k), code(seq[i + 1])));
  assert(steps.filter((d) => d === 1).length === 4, "순서 길: 이웃 4, 건너뛰기 3");
}
const GRAY = ["kun", "zhen", "dui", "kan", "xun", "qian", "li", "gen"];
assert(GRAY.slice(0, -1).every((k, i) => hd(code(k), code(GRAY[i + 1])) === 1) && new Set(GRAY).size === 8, "한 효씩 도는 길");
// 개수: 48(효 = 축), 384(반대 짝만), 16, 384 전개도(생성 나무), 11 모양, 3 일자형
const autos = [];
for (const perm of [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]) for (let m = 0; m < 8; m++) autos.push((v) => perm.reduce((s, p, i) => s | (((v >> p) & 1) << i), 0) ^ m);
assert(autos.length === 48 && new Set(autos.map((g) => V.map(g).join())).size === 48, "효 = 축 배치 48");
assert(24 * 16 === 384, "반대 짝만 384");
const trees = [];
const comb = (arr, k, start = 0, cur = []) => { if (cur.length === k) { trees.push([...cur]); return; } for (let i = start; i < arr.length; i++) { cur.push(arr[i]); comb(arr, k, i + 1, cur); cur.pop(); } };
comb(E, 7);
const isTree = (es) => { const p = [...V]; const f = (x) => (p[x] === x ? x : (p[x] = f(p[x]))); for (const [a, b] of es) { const ra = f(a), rb = f(b); if (ra === rb) return false; p[ra] = rb; } return true; };
const span = trees.filter(isTree);
assert(span.length === 384, "전개도 384");
const canon = (t) => autos.map((g) => t.map(([a, b]) => [g(a), g(b)].sort((x, y) => x - y).join("-")).sort().join()).sort()[0];
const classes = new Map(span.map((t) => [canon(t), t]));
assert(classes.size === 11, "전개도 11가지");
assert([...classes.values()].filter((t) => V.every((v) => t.filter(([a, b]) => a === v || b === v).length <= 2)).length === 3, "일자형 3가지");
// 홀짝: 이웃(한 효)은 늘 양효 홀짝이 다르다 → ▲▼ 규칙
assert(E.every(([a, b]) => (a.toString(2).split("1").length + b.toString(2).split("1").length) % 2 === 1), "이웃 면은 홀짝이 다름");
// 40,320 · 1,680
assert([1, 2, 3, 4, 5, 6, 7, 8].reduce((a, b) => a * b, 1) === 40320 && 40320 / 24 === 1680, "40,320 · 1,680");

// 언어 사전·캐시
const ko = JSON.parse(read(`assets/i18n/${T}_ko_Laude.json`)), en = JSON.parse(read(`assets/i18n/${T}_en_Laude.json`));
for (const s of ["8면체로 보는 8괘", "8괘 더 알아보기 →", "되는 것", "안 되는 것", "한 효씩 도는 길", "아이역 홈으로"]) assert(en.messages[keyFor(s)]?.trim() && ko.messages[keyFor(s)] === s, "사전 " + s);
const sw = read("app/sw.js");
assert(sw.includes('"iyeok-app-v92"') && sw.includes(`${T}_language_Laude.js`), "캐시 v92");
for (const f of ["index.html", "app/index.html", "yarrow/index.html", "yarrow/try/index.html", "yarrow/learn/index.html", "yarrow/options/index.html", "thoughts/one-and-two/index.html", "trigrams/index.html", "trigrams/more/index.html"]) assert(read(f).includes(`${T}_language_Laude.js`), "사전 판 " + f);
console.log("trigram more (2110): passed");
