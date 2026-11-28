// 261128_1705 LAUDE: 8괘 1단 게임 규칙 확인. 실행: node tests/261128_1705_game-eight_Laude.mjs
import assert from "node:assert";
import { readFileSync } from "node:fs";
import * as R from "../game/eight/261128_1705_rules_Laude.js";
const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const C = { youngYang: [true, false, false], youngYin: [true, true, false], oldYang: [true, true, true], oldYin: [false, false, false] };

// 동전: 앞 3 · 뒤 2, 합 6 노음 · 7 소양 · 8 소음 · 9 노양, 확률 1/8 · 3/8 · 3/8 · 1/8
const count = {};
for (let m = 0; m < 8; m++) { const r = R.coinsToResult([0, 1, 2].map((i) => !!(m & (1 << i)))); count[r] = (count[r] || 0) + 1; }
assert.deepStrictEqual(count, { oldYin: 1, youngYang: 3, youngYin: 3, oldYang: 1 }, "동전 확률");
for (const [k, c] of Object.entries(C)) assert.strictEqual(R.coinsToResult(c), k);

// 말판: 세는 순서, 칸 수 = 효 차이(거리 비), 거울 대칭, 반대괘 = 거울 자리
for (const [len, steps] of Object.entries(R.LENGTHS)) {
  const b = R.makeBoard(len);
  assert.strictEqual(b.stations.length, 8);
  assert.ok(b.stations.every((p, i) => p + b.stations[7 - i] === b.N), "거울 대칭 " + len);
  assert.ok(R.ORDER.every((k, i) => [...R.CODE[k]].reduce((t, c, j) => t + (c !== R.CODE[R.ORDER[7 - i]][j]), 0) === 3), "거울 자리 = 반대괘");
  assert.ok(steps[1] < steps[2] && steps[2] < steps[3], "칸 수가 거리 순서 " + len);
  assert.strictEqual(R.oppositeStation(b, b.stations[1]), b.stations[6]);
}
assert.strictEqual(R.makeBoard("normal").N, 25);

const two = (len = "normal", capture = true) => R.newGame({ players: [{ name: "A", side: "earth" }, { name: "B", side: "heaven" }], len, capture });
// 대박: 인 → 소양(곤) → 한 번 더 → 노양 → 건 = 승리 (하늘 쪽도 같음)
let s = two();
assert.deepStrictEqual(R.play(s, C.youngYang).map((e) => e.type), ["throw", "move", "bonus"]);
assert.strictEqual(s.phase, "bonus");
assert.deepStrictEqual(R.play(s, C.oldYang).map((e) => e.type), ["throw", "door", "jump", "win"]);
assert.strictEqual(s.winner, 0);
s = two(); s.turn = 1;
R.play(s, C.youngYang); R.play(s, C.oldYin);
assert.strictEqual(s.winner, 1, "하늘 쪽 대박(노음도 점프)");

// 출발점 뒤로는 못 감, 차례 넘김
s = two();
const ev = R.play(s, C.oldYin);
assert.ok(ev.some((e) => e.type === "clamp") && s.players[0].pos === -1 && s.turn === 1, "출발점 클램프");

// 한 번 더 던지기의 소양·소음은 그냥 전진, 다시 보너스 없음
s = two("short");
R.play(s, C.youngYang); // 곤(0), 보너스
const e2 = R.play(s, C.youngYin); // 2칸 → 진(2) 이지만 또 던지지 않음
assert.ok(s.players[0].pos === 2 && !e2.some((e) => e.type === "bonus") && s.turn === 1, "보너스 뒤 연쇄 없음");

// 가운데를 넘은 뒤 점프 = 망함(뒤로)
s = two();
s.players[0].pos = s.board.stations[5] - 1; // 리 바로 앞
R.play(s, C.youngYang); // 리에 멈춤 → 보너스
const e3 = R.play(s, C.oldYang);
assert.ok(e3.find((e) => e.type === "door").good === false && s.players[0].pos === s.board.stations[2], "리 → 감, 망함");

// 말 잡기 켬/끔
s = two();
s.players[1].pos = 1;
R.play(s, C.youngYin); // A: -1 → 1
assert.ok(s.players[1].pos === s.board.N + 1, "잡힌 말은 출발점으로");
s = two("normal", false);
s.players[1].pos = 1;
R.play(s, C.youngYin);
assert.strictEqual(s.players[1].pos, 1, "말 잡기 끔");

// 목표를 넘으면 도착
s = two();
s.players[0].pos = s.board.N - 1;
R.play(s, C.oldYang);
assert.strictEqual(s.winner, 0);

// 혼자: 차례가 그대로
s = R.newGame({ players: [{ name: "나", side: "heaven" }] });
R.play(s, C.youngYin);
assert.strictEqual(s.turn, 0);

// 페이지·홈 연결
const home = read("index.html"), page = read("game/eight/index.html");
assert.ok(/<strong>소통<\/strong>[^\n]*\n[^]*?<strong>괘 게임<\/strong>[^<]*<a href="game\/eight\/">/.test(home), "홈: 소통 아래 괘 게임");
assert.ok(page.includes("261128_1705_game_Laude.js") && ["solo", "cpu", "two"].every((m) => page.includes(`value="${m}"`)), "모드 선택");
console.log("game eight (1705): passed");
