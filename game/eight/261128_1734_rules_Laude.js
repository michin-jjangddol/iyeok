// 261128_1734 LAUDE: 원본 261128_1731_rules_Laude.js. 8괘 자리 한 번 더: 노양 = 반대괘 점프, 노음 = 상대 말 3칸 뒤로(JJDD).
// 261128_1731 LAUDE: 원본 261128_1722_rules_Laude.js. 목표 인에는 딱 맞게 도착, 넘치면 넘친 만큼 되돌아감(JJDD).
// 261128_1722 LAUDE: 원본 261128_1705_rules_Laude.js. 목표를 반대쪽 끝 괘가 아니라 그 너머의 인으로(JJDD).
// 261128_1705 LAUDE: 8괘 1단 게임 규칙(화면과 떨어진 순수 계산). JJDD 구상 · SHANA 게임 문서(docs/261128_1557_eight-trigram-game_Shana.md) 바탕.
//   말판: 8구슬을 세는 순서(곤 000 → 건 111)로 가로로 늘이고, 괘 사이 칸 수 = 8구슬 거리 비(1 : √2 : √3).
//   출발: 곤 아래 인(땅 쪽) 또는 건 위 인(하늘 쪽). 목표: 반대쪽 끝 괘를 지나 그 너머의 인(261128_1722, JJDD: 진짜 인간으로 승리).
//   평소: 소양 1칸 · 소음 2칸 · 노양 3칸 · 노음 뒤로 3칸. 8괘 자리에 딱 멈추면 한 번 더: 소양·소음 1·2칸, 노양·노음 반대괘로 점프.
//   처음 만들어 보는 규칙이라 놀면서 고친다(JJDD).

export const ORDER = ["kun", "zhen", "kan", "dui", "gen", "li", "xun", "qian"]; // 세는 순서 0 → 7
export const CODE = { kun: "000", zhen: "001", kan: "010", dui: "011", gen: "100", li: "101", xun: "110", qian: "111" };
// 괘 사이 칸 수: 효 차이 1 · 2 · 3 → 거리 1 · √2 · √3 를 칸으로
export const LENGTHS = { short: { 1: 2, 2: 3, 3: 4 }, normal: { 1: 3, 2: 4, 3: 5 }, long: { 1: 5, 2: 7, 3: 9 } };
export const STEP = { youngYang: 1, youngYin: 2, oldYang: 3, oldYin: -3 };
export const RESULT_NAME = { youngYang: "소양", youngYin: "소음", oldYang: "노양", oldYin: "노음" };

const hd = (a, b) => [...CODE[a]].filter((c, i) => c !== CODE[b][i]).length;

// 말판: 자리 0..N. 괘 자리 8개(stations[i] = ORDER[i]의 자리), 사이는 징검돌(효 차이 d 를 기억).
export function makeBoard(len = "normal") {
  const steps = LENGTHS[len] ?? LENGTHS.normal;
  const cells = [], stations = [];
  let p = 0;
  ORDER.forEach((k, i) => {
    stations.push(p);
    cells[p] = { station: k, index: i };
    if (i < 7) {
      const d = hd(k, ORDER[i + 1]);
      for (let s = 1; s < steps[d]; s++) cells[p + s] = { stone: d };
      p += steps[d];
    }
  });
  return { len, N: p, cells, stations };
}

// 동전 세 개(앞 = 3, 뒤 = 2) → 합 6 노음 · 7 소양 · 8 소음 · 9 노양
export function coinsToResult(coins) {
  const sum = coins.reduce((t, c) => t + (c ? 3 : 2), 0);
  return { 6: "oldYin", 7: "youngYang", 8: "youngYin", 9: "oldYang" }[sum];
}

// 출발 쪽: 땅(곤 아래 인, 자리 -1 → 앞으로 +) / 하늘(건 아래 인, 자리 N+1 → 앞으로 -)
export function sideInfo(side, board) {
  return side === "earth" ? { start: -1, dir: 1, goal: board.N + 1 } : { start: board.N + 1, dir: -1, goal: -1 };
}
export const stationAt = (board, pos) => (board.cells[pos]?.station ? board.cells[pos] : null);
export const oppositeStation = (board, pos) => {
  const c = stationAt(board, pos);
  return c ? board.stations[7 - c.index] : null; // 세는 순서에서 반대괘 = 거울 자리(7 - i)
};

export function newGame({ players, len = "normal", capture = true }) {
  const board = makeBoard(len);
  return {
    board,
    capture,
    players: players.map((p) => ({ ...p, pos: sideInfo(p.side, board).start, throws: 0 })),
    turn: 0,
    phase: "normal", // normal | bonus
    winner: null,
  };
}

// 한 번 던진 결과를 적용한다. 돌려주는 값: 사건 목록(화면이 차례대로 보여 줌).
export function play(state, coins) {
  if (state.winner !== null) return [];
  const me = state.players[state.turn], { start, dir, goal } = sideInfo(me.side, state.board);
  const result = coinsToResult(coins), ev = [{ type: "throw", who: state.turn, coins, result, phase: state.phase }];
  me.throws++;
  const land = (to, how) => {
    const from = me.pos;
    me.pos = to;
    ev.push({ type: how, who: state.turn, from, to });
    if (me.pos === goal) { state.winner = state.turn; ev.push({ type: "win", who: state.turn }); return true; }
    if (state.capture) for (const [i, o] of state.players.entries()) {
      if (i !== state.turn && o.pos === me.pos && o.pos !== sideInfo(o.side, state.board).start) {
        const back = sideInfo(o.side, state.board).start;
        ev.push({ type: "capture", who: state.turn, victim: i, from: o.pos, to: back });
        o.pos = back;
      }
    }
    return false;
  };
  const walk = (n) => {
    let to = me.pos + dir * n;
    if (dir > 0 ? to > goal : to < goal) { // 261128_1731: 인에는 딱 맞게. 넘치면 넘친 만큼 되돌아간다(JJDD)
      const back = (to - goal) * dir;
      to = goal - dir * back;
      ev.push({ type: "bounce", who: state.turn, from: me.pos, via: goal, to, back });
    }
    if (dir > 0 ? to < start : to > start) { to = start; ev.push({ type: "clamp", who: state.turn }); } // 출발점 밖으로는 못 감
    return land(to, "move");
  };
  const endTurn = () => {
    state.phase = "normal";
    if (state.winner === null) state.turn = (state.turn + 1) % state.players.length;
  };
  if (state.phase === "bonus") {
    if (result === "oldYin") {
      // 261128_1734: 노음은 내가 아니라 상대 말을 3칸 뒤로(JJDD). 상대 출발점(인)보다 뒤로는 가지 않고, 밀려서는 잡지 않는다.
      const others = [...state.players.keys()].filter((i) => i !== state.turn);
      if (!others.length) ev.push({ type: "push-none", who: state.turn });
      for (const i of others) {
        const o = state.players[i], si = sideInfo(o.side, state.board);
        let to = o.pos - si.dir * 3;
        if (si.dir > 0 ? to < si.start : to > si.start) to = si.start;
        ev.push({ type: "push", who: state.turn, victim: i, from: o.pos, to });
        o.pos = to;
      }
    } else if (result === "oldYang") {
      const to = oppositeStation(state.board, me.pos);
      const good = (to - me.pos) * dir > 0; // 앞으로 가면 인생역전, 뒤로 가면 망함
      ev.push({ type: "door", who: state.turn, good });
      land(to, "jump");
    } else walk(STEP[result]);
    endTurn(); // 보너스 뒤에는 또 던지지 않는다(무한 왕복 방지)
    return ev;
  }
  const won = walk(STEP[result]);
  if (!won && stationAt(state.board, me.pos) && me.pos !== start) {
    state.phase = "bonus";
    ev.push({ type: "bonus", who: state.turn });
  } else endTurn();
  return ev;
}
