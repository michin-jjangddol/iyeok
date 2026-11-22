// 261123_0709 LAUDE: 정시초 나누기(움직이다 멈추기) 시작 자리·방향 8가지와 빠르기 1~9 검사.
// 실행: node tests/261123_0709_yarrow-motion-options_Laude.mjs
import fs from "node:fs";
import assert from "node:assert/strict";
const base = new URL("../", import.meta.url).pathname;
const read = (p) => fs.readFileSync(base + p, "utf8");
const learnJs = read("yarrow/learn/index.html").match(/src="(\d{6}_\d{4}_learn_\w+\.js)"/)[1];
const js = read("yarrow/learn/" + learnJs);
const settingsPath = "yarrow/" + js.match(/from "\.\.\/(\d{6}_\d{4}_settings_\w+\.js)"/)[1];
let saved = {};
global.localStorage = { getItem: (k) => saved[k] ?? null, setItem: (k, v) => (saved[k] = v), removeItem: (k) => delete saved[k] };
const S = await import(base + settingsPath);
const tri = (x) => (x < 0.5 ? 2 * x : 2 - 2 * x);
const WANT = { LLL: ["좌좌좌", 0, 1], LL: ["좌좌", 0.25, -1], LC: ["좌중", 0.25, 1], CL: ["중좌", 0.5, -1], CR: ["중우", 0.5, 1], RL: ["우좌", 0.75, -1], RR: ["우우", 0.75, 1], RRR: ["우우우", 1, -1] };
assert.deepEqual(S.MOTION_STARTS, Object.keys(WANT));
for (const [k, [name, p, d]] of Object.entries(WANT)) {
  assert.equal(S.MOTION_START_LABELS[k], name);
  const c = S.motionConfig({ motionStart: k, motionSpeed: "5" });
  assert.equal(c.start, p);
  assert(Math.abs(tri(c.offset) - p) < 1e-9, k + " 시작 자리");
  assert.equal(Math.sign(tri((c.offset + 0.01) % 1) - tri(c.offset)), d, k + " 방향");
}
// 기본값 = 이전 동작(가운데 → 오른쪽, 왕복 3.2초, 시작 위상 0.25)
assert.deepEqual(S.motionConfig(S.DEFAULT_SETTINGS), { start: 0.5, offset: 0.25, period: 3200 });
const periods = S.MOTION_SPEEDS.map(S.motionPeriod);
assert(periods.every((v, i) => i === 0 || v < periods[i - 1]), "빠를수록 짧다");
assert(periods[0] <= 5200 && periods[8] >= 1900, "1과 9는 조금 느리게·조금 빠르게 " + periods);
// 설정
assert.equal(S.loadSettings().motionStart, "CR"); assert.equal(S.loadSettings().motionSpeed, "5");
saved[S.STORAGE_KEY] = JSON.stringify({ takeSide: "left", symbols: "classic" });
assert.deepEqual([S.loadSettings().motionStart, S.loadSettings().motionSpeed], ["CR", "5"], "옛 저장값 호환");
saved[S.STORAGE_KEY] = JSON.stringify({ motionStart: "XX", motionSpeed: 12 });
assert.deepEqual([S.loadSettings().motionStart, S.loadSettings().motionSpeed], ["CR", "5"], "잘못된 값은 기본값");
saved[S.STORAGE_KEY] = JSON.stringify({ motionStart: "RRR", motionSpeed: 9 });
assert.deepEqual([S.loadSettings().motionStart, S.loadSettings().motionSpeed], ["RRR", "9"], "숫자 빠르기도 받음");
assert.deepEqual(S.motionConfig({}), { start: 0.5, offset: 0.25, period: 3200 }, "없는 값은 기본");
// 화면 파일
const opt = read("yarrow/options/index.html");
for (const v of S.MOTION_STARTS) assert(opt.includes(`name="motionStart" value="${v}"`));
for (const v of S.MOTION_SPEEDS) assert(opt.includes(`name="motionSpeed" value="${v}"`));
assert(opt.includes('value="CR" checked') && opt.includes('value="5" checked') && opt.includes("<legend>정시초 나누기</legend>"));
assert(js.includes("motionCfg = motionConfig(settings)") && !js.includes("MOTION_PERIOD_MS"), "learn 이 옵션을 쓴다");
console.log({ starts: 8, speeds: periods.join("/"), settings: "passed", files: "passed" });
