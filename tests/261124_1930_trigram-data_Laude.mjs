// 261124_1930 LAUDE: 팔괘 공용 자료(data/trigrams/) 검사. 실행: node tests/261124_1930_trigram-data_Laude.mjs
// - 여덟 팔괘: 번호·value·식별자·효 배열·이름이 data/hexagrams.json 과 같은지, 고유 번호 유일·선행 0
// - 목록·정보 파일·폴더 경로가 실제와 맞는지, 아이콘 미등록 상태가 올바른 값인지
// - 64괘 전체: 상괘 code + 하괘 code = 6자리 고유 번호
// - 순서·배치: 여덟 괘가 중복·누락 없이, 화면 순서가 공용 모듈과 같은지, 확인 전 배열은 verified=false
import fs from "node:fs";
import assert from "node:assert/strict";
const base = new URL("../", import.meta.url).pathname;
const read = (p) => fs.readFileSync(base + p, "utf8");
const exists = (p) => fs.existsSync(base + p);
const data = JSON.parse(read("data/hexagrams.json"));

const indexFile = fs.readdirSync(base + "data/trigrams").filter((f) => /^\d{6}_\d{4}_trigram-index_\w+\.json$/.test(f)).sort().pop();
const index = JSON.parse(read("data/trigrams/" + indexFile));
const codeOf = (lines) => [...lines].reverse().join("");

// 1) 여덟 팔괘
assert.equal(index.trigrams.length, 8);
const codes = index.trigrams.map((e) => e.code);
assert.equal(new Set(codes).size, 8, "고유 번호 중복");
assert.deepEqual([...codes].sort(), ["000", "001", "010", "011", "100", "101", "110", "111"], "3자리·선행 0");
const byCode = {};
for (const e of index.trigrams) {
  assert.equal(typeof e.code, "string");
  const t = data.trigrams[e.id];
  assert(t, "모르는 식별자 " + e.id);
  assert.equal(e.code, codeOf(t.lines), e.id + " code = 위 효부터 쓴 효 배열");
  assert.equal(parseInt(e.code, 2), t.value, e.id + " value");
  assert.equal(e.value, t.value);
  assert.equal(e.info, `data/trigrams/${e.code}/` + e.info.split("/").pop(), "정보 파일은 자기 폴더에");
  assert(exists(e.info), "정보 파일 없음 " + e.info);
  assert.equal(e.images, `data/trigrams/${e.code}/images/`);
  assert(fs.statSync(base + e.images).isDirectory() && fs.readdirSync(base + e.images).length > 0, "images 폴더(안내 파일 포함)");
  const info = JSON.parse(read(e.info));
  for (const k of ["code", "value", "id"]) assert.equal(info[k], e[k], `${e.code} ${k}`);
  for (const k of ["nameKo", "name", "symbol", "natureKo", "nature"]) assert.equal(info[k], t[k], `${e.code} ${k}`);
  assert.deepEqual(info.lines, t.lines, e.code + " lines(아래 효부터)");
  assert.equal(info.imageFolder, e.images);
  // 아이콘 미등록: 경로·설명 없이 명확한 값
  if (info.icon.status === "unregistered") {
    assert(info.icon.current === null && info.icon.intent === null && info.icon.alt === null && info.icon.versions.length === 0, e.code + " 미등록 아이콘");
  } else {
    // 등록 후: 현재 파일이 실제로 있고 버전 목록에 있으며, 의도·대체 설명이 있다
    assert(exists(info.icon.current) && info.icon.current.startsWith(e.images), e.code + " 아이콘 파일");
    assert(info.icon.versions.some((v) => v.path === info.icon.current) && info.icon.intent && info.icon.alt, e.code + " 아이콘 정보");
  }
  byCode[e.code] = e.id;
}
// 폴더에 목록에 없는 팔괘 폴더가 없다
const folders = fs.readdirSync(base + "data/trigrams").filter((f) => fs.statSync(base + "data/trigrams/" + f).isDirectory());
assert.deepEqual(folders.sort(), [...codes].sort(), "폴더 = 목록");

// 2) 64괘: 상괘 + 하괘 = 6자리 고유 번호
const idOfCode = Object.fromEntries(index.trigrams.map((e) => [e.id, e.code]));
for (const h of data.hexagrams) {
  const hexId = [...h.lines].reverse().join("");
  assert.equal(idOfCode[h.upper] + idOfCode[h.lower], hexId, `${h.number} ${h.titleKo}`);
}
for (const dir of fs.readdirSync(base + "data/hexagrams").filter((f) => /^[01]{6}$/.test(f))) {
  assert(data.hexagrams.some((h) => [...h.lines].reverse().join("") === dir), "모르는 괘 폴더 " + dir);
}
assert.equal(idOfCode.kun + idOfCode.xun, "000110", "지풍승 예");

// 3) 순서·배치
const all8 = (list, name) => assert.deepEqual([...list].sort(), [...codes].sort(), name + ": 여덟 괘 중복·누락 없이");
for (const [name, o] of Object.entries(index.orders)) {
  if (o.codes) all8(o.codes, name);
  if (o.numbers) { all8(Object.keys(o.numbers), name); assert.deepEqual(Object.values(o.numbers).sort(), [1, 2, 3, 4, 5, 6, 7, 8], name + " 수"); }
  assert.equal(typeof o.verified, "boolean", name + " verified");
}
assert.deepEqual(index.orders.binary.codes, ["000", "001", "010", "011", "100", "101", "110", "111"]);
// 화면 순서 = 공용 모듈의 TRIGRAM_ORDER
const mod = await import(base + "assets/261124_0800_trigrams-ko_Laude.js");
assert.deepEqual(index.orders.screen.codes.map((c) => byCode[c]), mod.TRIGRAM_ORDER, "화면 순서");
for (const [name, a] of Object.entries(index.arrangements)) {
  assert.deepEqual(Object.keys(a.directions).sort(), ["E", "N", "NE", "NW", "S", "SE", "SW", "W"], name + " 여덟 방위");
  all8(Object.values(a.directions), name);
  assert.equal(typeof a.verified, "boolean");
}
// 확인 전 배열은 화면이 쓰지 않는다(공용 모듈·화면 코드가 목록 파일을 읽지 않음)
for (const p of ["assets/261124_0800_trigrams-ko_Laude.js", "app/app.js"]) assert(!read(p).includes("trigram-index"), p);
const unverified = Object.entries({ ...index.orders, ...index.arrangements }).filter(([, o]) => !o.verified).map(([k]) => k);
console.log({ trigrams: 8, hexagrams: data.hexagrams.length, orders: Object.keys(index.orders), arrangements: Object.keys(index.arrangements), unverified });
