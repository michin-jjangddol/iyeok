// 261128_1823 LAUDE: 원본 261128_1816_game-eight_Laude.mjs. 2단 말판.
// 261128_1816 LAUDE: 원본 261128_1810_game-eight_Laude.mjs. 페이지 스크립트 261128_1816.
// 261128_1810 LAUDE: 원본 261128_1802_game-eight_Laude.mjs. 페이지 스크립트 261128_1810.
// 261128_1802 LAUDE: 원본 261128_1756_game-eight_Laude.mjs. 페이지 스크립트 261128_1802.
// 261128_1756 LAUDE: 원본 261128_1745_game-eight_Laude.mjs. 페이지 스크립트 261128_1756.
// 261128_1745 LAUDE: 원본 261128_1734_game-eight_Laude.mjs. 페이지 스크립트 261128_1745.
// 261128_1734 LAUDE: 원본 261128_1731_game-eight_Laude.mjs. 노음 보너스 = 상대 말 3칸 뒤로.
// 261128_1731 LAUDE: 원본 261128_1722_game-eight_Laude.mjs. 인에 딱 맞게 도착, 넘치면 되돌아감.
// 261128_1722 LAUDE: 원본 261128_1705_game-eight_Laude.mjs. 목표 = 반대쪽 인, 건 위·곤 아래.
// 261128_1705 LAUDE: 8괘 1단 게임 규칙 확인. 실행: node tests/261128_1705_game-eight_Laude.mjs
import assert from "node:assert";
import { readFileSync } from "node:fs";
import * as R from "../game/eight/261128_1823_rules_Laude.js";
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
// 대박: 인 → 소양(곤) → 한 번 더 → 노양 → 건. 아직 끝이 아니고, 한 칸 더 가서 반대쪽 인에 닿아야 승리
let s = two();
assert.deepStrictEqual(R.play(s, C.youngYang).map((e) => e.type), ["throw", "move", "bonus"]);
assert.strictEqual(s.phase, "bonus");
assert.deepStrictEqual(R.play(s, C.oldYang).map((e) => e.type), ["throw", "door", "jump"]);
assert.ok(s.winner === null && s.players[0].pos === s.board.N, "건에 왔지만 아직");
s.turn = 0;
R.play(s, C.youngYang);
assert.ok(s.winner === 0 && s.players[0].pos === s.board.N + 1, "한 칸 더 → 반대쪽 인 = 승리");
s = two(); s.turn = 1;
R.play(s, C.youngYang); R.play(s, C.oldYang);
assert.ok(s.winner === null && s.players[1].pos === 0, "하늘 쪽: 건 → 노양 점프 → 곤");
s.turn = 1; R.play(s, C.youngYang);
assert.ok(s.winner === 1 && s.players[1].pos === -1, "곤에서 소양 = 인에 딱 → 승리");
assert.deepStrictEqual(R.sideInfo("earth", s.board), { start: -1, dir: 1, goal: s.board.N + 1 });

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

// 인에는 딱 맞게: 넘치면 넘친 만큼 되돌아감 (JJDD 예시: 끝 괘에서)
s = two();
s.players[0].pos = s.board.N; // 건(끝 괘), 목표 인은 N+1
let evB = R.play(s, C.youngYin); // 2칸: 인 찍고 1칸 되돌아 → 건 → 끝 괘라 한 번 더
assert.ok(evB.some((e) => e.type === "bounce") && s.players[0].pos === s.board.N && s.phase === "bonus" && s.winner === null, "소음: 인 찍고 끝 괘로 되돌아와 한 번 더");
evB = R.play(s, C.youngYin); // 보너스 소음: 또 되돌아 → 건, 차례 넘김(세 번째 던지기 없음)
assert.ok(s.players[0].pos === s.board.N && s.turn === 1 && s.phase === "normal" && !evB.some((e) => e.type === "bonus"), "보너스 소음: 끝 괘에 머물고 차례 넘김");
s.turn = 0;
R.play(s, C.youngYin); R.play(s, C.youngYang);
assert.strictEqual(s.winner, 0, "보너스 소양 = 승리");
s = two(); s.players[0].pos = s.board.N; R.play(s, C.youngYin); R.play(s, C.oldYang);
assert.ok(s.players[0].pos === 0 && s.winner === null, "보너스 노양 = 반대괘(곤)로 점프");
s = two(); s.players[0].pos = s.board.N; R.play(s, C.oldYang);
assert.ok(s.players[0].pos === s.board.N - 1 && s.winner === null, "노양 3칸: 인 찍고 2칸 되돌아옴");
s = two();
s.players[0].pos = s.board.N - 2;
R.play(s, C.youngYin);
assert.ok(s.winner === null && s.players[0].pos === s.board.N, "끝 괘(건)에 멈추면 승리 아님");

// 혼자: 차례가 그대로
s = R.newGame({ players: [{ name: "나", side: "heaven" }] });
R.play(s, C.youngYin);
assert.strictEqual(s.turn, 0);

// 페이지·홈 연결
const home = read("index.html"), page = read("game/eight/index.html");
assert.ok(/<strong>소통<\/strong>[^\n]*\n[^]*?<strong>괘 게임<\/strong>[^<]*<a href="game\/eight\/">/.test(home), "홈: 소통 아래 괘 게임");
assert.ok(page.includes("261128_1823_game_Laude.js") && ["solo", "cpu", "two"].every((m) => page.includes(`value="${m}"`)), "모드 선택");
// 노음 보너스: 내가 아니라 상대 말이 3칸 뒤로(상대 출발점에서 멈춤, 밀려서는 잡지 않음)
s = two();
s.players[1].pos = 10; // 하늘 쪽(아래로 가는) 말
R.play(s, C.youngYang); // 땅 쪽: 곤에 멈춤 → 보너스
let evP = R.play(s, C.oldYin);
assert.ok(evP.some((e) => e.type === "push" && e.victim === 1) && s.players[1].pos === 13 && s.players[0].pos === 0, "상대 말 3칸 뒤로(하늘 쪽 말은 위로)");
s = two(); s.players[1].pos = s.board.N; s.turn = 0;
R.play(s, C.youngYang); R.play(s, C.oldYin);
assert.strictEqual(s.players[1].pos, s.board.N + 1, "상대 출발점(인)보다 뒤로는 안 감");
s = R.newGame({ players: [{ name: "나", side: "earth" }] });
R.play(s, C.youngYang);
evP = R.play(s, C.oldYin);
assert.ok(evP.some((e) => e.type === "push-none") && s.players[0].pos === 0, "혼자: 밀 상대 없음, 내 말 그대로");
// 261128_1823: 2단 = 8괘 띠 두 개를 이어 붙임(JJDD)
for (const len of Object.keys(R.LENGTHS)) {
  const b1 = R.makeBoard(len), b2 = R.makeBoard(len, 2);
  assert.strictEqual(b2.stations.length, 16);
  assert.strictEqual(b2.N, 2 * b1.N + R.LENGTHS[len][3], "건 → 곤 이음은 √3 칸 " + len);
  assert.ok(b2.stations.every((p, i) => p + b2.stations[15 - i] === b2.N), "2단도 거울 대칭 " + len);
  assert.ok(!b2.cells.some((c) => c?.human), "가운데 인 없음");
  assert.strictEqual(R.oppositeStation(b2, b2.stations[8]), b2.stations[15], "둘째 띠 곤 → 같은 띠 건");
  assert.strictEqual(R.oppositeStation(b2, b2.stations[3]), b2.stations[4], "첫 띠 태 → 같은 띠 간");
}
assert.strictEqual(R.makeBoard("normal", 9).levels, R.MAX_LEVELS, "지금은 2단까지");
s = R.newGame({ players: [{ name: "A", side: "earth" }, { name: "B", side: "heaven" }], levels: 2 });
assert.ok(s.players[0].pos === -1 && s.players[1].pos === s.board.N + 1 && s.board.levels === 2, "2단 출발 인은 양 끝");
s.players[0].pos = s.board.N; R.play(s, C.youngYang);
assert.strictEqual(s.winner, 0, "2단: 둘째 띠 건에서 소양 = 끝 인 도착");
// 2단 보너스: 노양 = 다른 단 반대괘, 노음 = 같은 단 반대괘(JJDD)
s = R.newGame({ players: [{ name: "A", side: "earth" }, { name: "B", side: "heaven" }], levels: 2 });
const st = s.board.stations;
s.players[0].pos = st[0] - 1; // 곤 바로 앞
R.play(s, C.youngYang); // 첫 띠 곤 → 한 번 더
let eLv = R.play(s, C.oldYang);
assert.ok(s.players[0].pos === st[15] && eLv.some((e) => e.type === "door" && e.kind === "other" && e.good), "노양: 첫 띠 곤 → 둘째 띠 건");
s = R.newGame({ players: [{ name: "A", side: "earth" }, { name: "B", side: "heaven" }], levels: 2 });
s.players[0].pos = s.board.stations[1] - 1;
R.play(s, C.youngYang); // 첫 띠 진
eLv = R.play(s, C.oldYin);
assert.ok(s.players[0].pos === s.board.stations[6] && s.players[1].pos === s.board.N + 1 && !eLv.some((e) => e.type === "push"), "노음: 첫 띠 진 → 같은 띠 손, 상대 그대로");
s = R.newGame({ players: [{ name: "A", side: "earth" }, { name: "B", side: "heaven" }], levels: 2 }); s.turn = 1;
s.players[1].pos = s.board.stations[15] + 1; R.play(s, C.youngYang); R.play(s, C.oldYang);
assert.ok(s.players[1].pos === s.board.stations[0], "하늘 쪽: 둘째 띠 건 → 첫 띠 곤(다른 단)");
s = two(); s.players[0].pos = 0; s.phase = "bonus"; R.play(s, C.oldYin);
assert.ok(s.players[0].pos === 0 && s.players[1].pos === s.board.N + 1, "1단 노음은 그대로 밀기(상대는 출발점이라 그대로)");
console.log("game eight (1823): passed");
