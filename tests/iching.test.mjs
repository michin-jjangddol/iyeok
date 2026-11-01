// 아이역 괘 계산 검증. 실행: node tests/iching.test.mjs
import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const m = await import(new URL("app/iching.js", root));
const data = JSON.parse(readFileSync(new URL("data/hexagrams.json", root), "utf8"));
const T = (n) => m.lineTypeFromYangCount(n);
let passed = 0;

function check(name, fn) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

check("양의 면 개수 → 효 종류 (3 노양, 2 소음, 1 소양, 0 노음)", () => {
  assert.equal(T(3).name, "노양");
  assert.equal(T(2).name, "소음");
  assert.equal(T(1).name, "소양");
  assert.equal(T(0).name, "노음");
  assert.throws(() => T(4));
});

check("양으로 삼은 면이 계산에 반영됨", () => {
  const faces = ["picture", "picture", "number"];
  assert.equal(m.countYang(faces, "picture"), 2);
  assert.equal(m.countYang(faces, "number"), 1);
});

check("효를 채우는 순서 (땅괘·하늘괘·인간괘)", () => {
  assert.deepEqual(m.fillOrder("earth"), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(m.fillOrder("heaven"), [5, 4, 3, 2, 1, 0]);
  assert.equal(m.fillOrder("human"), null);
});

check("64개 효 조합이 모두 서로 다른 괘에 대응", () => {
  const seen = new Set();
  for (let bits = 0; bits < 64; bits++) {
    const lines = [0, 1, 2, 3, 4, 5].map((i) => (bits >> i) & 1);
    const h = m.findHexagram(data, lines);
    assert.ok(h, `no hexagram for ${lines}`);
    assert.deepEqual(h.lines, lines);
    seen.add(h.number);
  }
  assert.equal(seen.size, 64);
  assert.equal(new Set(data.hexagrams.map((h) => h.lines.join(""))).size, 64);
});

check("효 종류 4,096개 조합의 본괘·지괘 일관성 (샤나 검산)", () => {
  for (let i = 0; i < 4096; i++) {
    let x = i;
    const types = Array.from({ length: 6 }, () => {
      const count = x % 4;
      x = Math.floor(x / 4);
      return T(count);
    });
    for (const lines of [m.primaryLines(types), m.changedLines(types)]) {
      const h = m.findHexagram(data, lines);
      assert.ok(h && h.lines.join() === lines.join(), `mismatch at ${i}`);
    }
    const changed = m.changedLines(types);
    types.forEach((t, j) => {
      assert.equal(changed[j], t.key === "oldYang" || t.key === "youngYin" ? 0 : 1);
    });
  }
});

check("알려진 괘와 변효 반전", () => {
  const guan = [T(2), T(2), T(2), T(2), T(1), T(1)];
  assert.equal(m.findHexagram(data, m.primaryLines(guan)).title, "風地觀");

  const pi = [T(0), T(2), T(2), T(3), T(1), T(1)]; // 천지비, 초효·사효 변
  assert.equal(m.findHexagram(data, m.primaryLines(pi)).titleKo, "천지비");
  assert.deepEqual(m.changingPositions(pi), [0, 3]);
  assert.equal(m.findHexagram(data, m.changedLines(pi)).titleKo, "풍뢰익");

  const still = [T(1), T(2), T(1), T(2), T(1), T(2)];
  assert.deepEqual(m.primaryLines(still), m.changedLines(still));
});

check("효 이름 (초구, 육이, 구오, 상육)", () => {
  assert.equal(m.lineName(0, true), "초구");
  assert.equal(m.lineName(1, false), "육이");
  assert.equal(m.lineName(4, true), "구오");
  assert.equal(m.lineName(5, false), "상육");
});

check("확률: 노양 1/8, 소음 3/8, 소양 3/8, 노음 1/8", () => {
  const counts = [0, 0, 0, 0];
  const n = 200000;
  for (let i = 0; i < n; i++) counts[m.countYang(m.tossCoins(Math.random), "picture")]++;
  [1 / 8, 3 / 8, 3 / 8, 1 / 8].forEach((p, i) => assert.ok(Math.abs(counts[i] / n - p) < 0.01, `count ${i}: ${counts[i] / n}`));
});

check("오프라인 저장 목록의 파일이 모두 있음", () => {
  const sw = readFileSync(new URL("app/sw.js", root), "utf8");
  const paths = [...sw.matchAll(/^  "([^"]+)",/gm)].map((x) => x[1]);
  assert.ok(paths.length > 5);
  for (const path of paths) assert.ok(existsSync(new URL(path, new URL("app/", root))), `missing ${path}`);
});

console.log(`\n${passed} checks passed`);
