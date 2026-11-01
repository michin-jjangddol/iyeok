// 아이역 동전점 맛보기 — 화면 동작
import {
  tossCoins, countYang, lineTypeFromYangCount, fillOrder,
  primaryLines, changedLines, changingPositions, findHexagram, lineName,
} from "./iching.js";

const DEFAULT_SETTINGS = { coin: "basic", yangFace: "picture", order: "earth", symbols: "iyeok" };
const STORAGE_KEY = "iyeok.coin.settings.v1";

const LABELS = {
  coin: { basic: "기본 동전", won100: "100원", won500: "500원" },
  yangFace: { picture: "그림 면", number: "숫자 면" },
  order: { earth: "땅괘 · 아래 → 위", heaven: "하늘괘 · 위 → 아래", human: "인간괘 · 자리를 골라서" },
  symbols: { iyeok: "노양 × · 노음 ○", classic: "노양 ○ · 노음 ×" },
};
const SUMMARY_TITLES = { coin: "동전", yangFace: "양으로 삼을 면", order: "효를 채우는 순서", symbols: "변효 기호" };

const COIN_FACES = {
  basic: { picture: "易", number: "1" },
  won100: { picture: "人", number: "100" },
  won500: { picture: "鶴", number: "500" },
};
const FACE_NAMES = { picture: "그림", number: "숫자" };
const POSITION_LABELS = ["초효", "이효", "삼효", "사효", "오효", "상효"];

const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let data = null;
let settings = loadSettings();
let reading = null; // 진행 중인 점: { settings, throws, lines, selected, busy }

// ---------- 설정 ----------

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") {
      const merged = { ...DEFAULT_SETTINGS };
      for (const key of Object.keys(DEFAULT_SETTINGS)) {
        if (saved[key] in LABELS[key]) merged[key] = saved[key];
      }
      return merged;
    }
  } catch {
    // 저장소를 쓸 수 없으면 기본값으로 시작
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // 개인 정보 보호 모드 등에서는 저장하지 않고 계속 진행
  }
}

function syncForm() {
  const form = $("settings");
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    for (const input of form.elements[key]) input.checked = input.value === settings[key];
  }
}

function renderSummary() {
  const dl = $("summary");
  dl.replaceChildren();
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const dt = document.createElement("dt");
    dt.textContent = SUMMARY_TITLES[key];
    const dd = document.createElement("dd");
    dd.textContent = LABELS[key][settings[key]];
    dl.append(dt, dd);
  }
}

function describeSettings(s) {
  return [LABELS.coin[s.coin], `양: ${LABELS.yangFace[s.yangFace]}`, LABELS.order[s.order], LABELS.symbols[s.symbols]].join(" · ");
}

function changingSymbol(s, type) {
  if (!type.changing) return "";
  const oldYang = s.symbols === "iyeok" ? "×" : "○";
  const oldYin = s.symbols === "iyeok" ? "○" : "×";
  return type.yang ? oldYang : oldYin;
}

// ---------- 화면 전환 ----------

function show(id) {
  for (const section of ["setup", "cast", "result"]) $(section).hidden = section !== id;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
}

// ---------- 점 진행 ----------

function startReading() {
  if (!data) return;
  cancelWaits();
  reading = {
    settings: { ...settings }, // 시작한 점의 설정은 끝날 때까지 고정
    throws: [],
    lines: Array(6).fill(null),
    selected: null,
    busy: false,
  };
  $("fixed-settings").textContent = describeSettings(reading.settings);
  renderCoins(null);
  renderCast();
  show("cast");
}

function nextPosition() {
  const order = fillOrder(reading.settings.order);
  return order ? order[reading.throws.length] : reading.selected;
}

function renderCast() {
  const r = reading;
  const human = r.settings.order === "human";
  $("progress").textContent = r.throws.length;

  const board = $("board");
  board.replaceChildren();
  const target = nextPosition();
  for (let pos = 5; pos >= 0; pos--) {
    const li = document.createElement("li");
    li.className = "slot";
    const label = document.createElement("span");
    label.className = "slot-label";
    label.textContent = POSITION_LABELS[pos];

    const type = r.lines[pos];
    let body;
    if (type) {
      body = lineElement(type.yang, type.changing);
      li.classList.add("filled");
      if (pos === r.throws.at(-1)?.position) li.classList.add("just-filled");
    } else if (human) {
      body = document.createElement("button");
      body.type = "button";
      body.className = "slot-pick";
      body.textContent = pos === r.selected ? "이 자리에 채웁니다" : "이 자리 고르기";
      body.setAttribute("aria-pressed", String(pos === r.selected));
      body.addEventListener("click", () => {
        if (r.busy) return;
        r.selected = pos;
        renderCast();
      });
    } else {
      body = document.createElement("span");
      body.className = "slot-empty";
    }
    if (!type && pos === target) li.classList.add("target");

    const note = document.createElement("span");
    note.className = "slot-note";
    if (type) {
      const sym = changingSymbol(r.settings, type);
      note.textContent = sym ? `${sym} ${type.name}` : type.name;
      if (sym) note.classList.add("is-changing");
    }
    li.append(label, body, note);
    board.append(li);
  }

  const done = r.throws.length === 6;
  const needPick = human && r.selected === null && !done;
  $("throw").disabled = r.busy || done || needPick;
  if (!r.throws.length) {
    $("toss-note").textContent = needPick
      ? "먼저 채울 자리를 고르세요."
      : `${POSITION_LABELS[target]}부터 채웁니다. 마음을 가다듬고 던져 보세요.`;
  }
}

async function throwCoins() {
  const r = reading;
  if (!r || r.busy || r.throws.length >= 6) return;
  const position = nextPosition();
  if (position === null || position === undefined || r.lines[position]) return;

  r.busy = true;
  $("throw").disabled = true;
  const faces = tossCoins();
  await spinCoins();
  if (reading !== r) return; // 도는 사이에 그만둔 점
  renderCoins(faces);

  const yangCount = countYang(faces, r.settings.yangFace);
  const type = lineTypeFromYangCount(yangCount);
  r.lines[position] = type;
  r.throws.push({ position, faces, yangCount, type });
  r.selected = null;
  r.busy = false;

  const sym = changingSymbol(r.settings, type);
  const change = type.changing ? `, 변효 ${sym} (지괘에서 ${type.yang ? "음" : "양"}으로 바뀜)` : "";
  const next = r.settings.order === "human" && r.throws.length < 6 ? " 다음에 채울 자리를 고르세요." : "";
  $("toss-note").textContent =
    `${POSITION_LABELS[position]}: 양의 면 ${yangCount}개 → ${type.name} (${type.yang ? "양" : "음"}${change}).${next}`;
  renderCast();

  if (r.throws.length === 6) {
    await wait(reduceMotion ? 0 : 700);
    if (reading === r) showResult();
  }
}

// ---------- 동전 ----------

function renderCoins(faces, flipping = false) {
  const s = reading ? reading.settings : settings;
  const wrap = $("coins");
  wrap.replaceChildren();
  for (let i = 0; i < 3; i++) {
    const face = faces ? faces[i] : null;
    const coin = document.createElement("div");
    coin.className = `coin coin-${s.coin}`;
    if (flipping) coin.classList.add("flipping");
    if (face) {
      coin.classList.add(`face-${face}`);
      if (face === s.yangFace) coin.classList.add("is-yang");
    }
    const mark = document.createElement("span");
    mark.className = "coin-mark";
    mark.textContent = face ? COIN_FACES[s.coin][face] : "?";
    const cap = document.createElement("span");
    cap.className = "coin-cap";
    cap.textContent = face ? `${FACE_NAMES[face]}${face === s.yangFace ? " · 양" : ""}` : "";
    coin.append(mark, cap);
    coin.setAttribute("aria-label", face ? `${FACE_NAMES[face]} 면${face === s.yangFace ? ", 양" : ""}` : "아직 던지지 않음");
    wrap.append(coin);
  }
}

// 동전이 도는 동안 기다린다. 결과 면은 호출한 쪽에서 점이 아직 유효한지 확인한 뒤 그린다.
function spinCoins() {
  if (reduceMotion) return Promise.resolve();
  renderCoins(null, true);
  return wait(650);
}

// 진행 중인 점에 묶인 대기. 점을 그만두면 cancelWaits()로 모두 버린다.
let waits = [];

function wait(ms) {
  return new Promise((resolve) => waits.push(setTimeout(resolve, ms)));
}

function cancelWaits() {
  waits.forEach(clearTimeout);
  waits = [];
}

// ---------- 결과 ----------

function lineElement(yang, changing) {
  const el = document.createElement("span");
  el.className = `hline ${yang ? "yang" : "yin"}${changing ? " changing" : ""}`;
  return el;
}

function hexCard(title, hex, types, s) {
  const card = document.createDocumentFragment();
  const h2 = document.createElement("h2");
  h2.textContent = title;

  const fig = document.createElement("div");
  fig.className = "hex-figure";
  const lines = document.createElement("div");
  lines.className = "hex-lines";
  for (let pos = 5; pos >= 0; pos--) {
    const row = document.createElement("div");
    row.className = "hex-row";
    const yang = hex.lines[pos] === 1;
    const type = types ? types[pos] : null;
    row.append(lineElement(yang, Boolean(type && type.changing)));
    const sym = document.createElement("span");
    sym.className = "hex-sym";
    sym.textContent = type ? changingSymbol(s, type) : "";
    row.append(sym);
    lines.append(row);
  }
  fig.append(lines);

  const name = document.createElement("p");
  name.className = "hex-title";
  name.innerHTML = `<span class="hex-no">제${hex.number}괘</span> <b>${hex.titleKo}</b> <span class="hex-han">${hex.title}</span>`;

  const up = data.trigrams[hex.upper];
  const lo = data.trigrams[hex.lower];
  const tri = document.createElement("p");
  tri.className = "hex-tri";
  tri.textContent = `위 ${up.symbol} ${up.nameKo}(${up.name}) ${up.natureKo} · 아래 ${lo.symbol} ${lo.nameKo}(${lo.name}) ${lo.natureKo}`;

  card.append(h2, fig, name, tri);
  return card;
}

function showResult() {
  const r = reading;
  const types = r.lines;
  const primary = findHexagram(data, primaryLines(types));
  const changed = findHexagram(data, changedLines(types));
  const moving = changingPositions(types);

  $("primary-card").replaceChildren(hexCard("본괘", primary, types, r.settings));
  $("changed-card").replaceChildren(hexCard("지괘", changed, null, r.settings));
  document.querySelector(".result-pair").classList.toggle("no-change", moving.length === 0);

  $("changing-summary").textContent = moving.length
    ? `변효 ${moving.length}개: ${moving.map((p) => `${lineName(p, types[p].yang)}(${types[p].name} ${changingSymbol(r.settings, types[p])})`).join(", ")}`
    : "변효 없음 · 본괘와 지괘가 같습니다.";

  const body = $("log-body");
  body.replaceChildren();
  r.throws.forEach((t, i) => {
    const tr = document.createElement("tr");
    const coins = t.faces.map((f) => FACE_NAMES[f]).join(" · ");
    const sym = changingSymbol(r.settings, t.type);
    for (const text of [`${i + 1}`, POSITION_LABELS[t.position], coins, `${t.type.name}${sym ? ` ${sym}` : ""}`]) {
      const td = document.createElement("td");
      td.textContent = text;
      tr.append(td);
    }
    body.append(tr);
  });
  $("log-settings").textContent = `이번 점의 방식: ${describeSettings(r.settings)}`;
  show("result");
}

// ---------- 시작 ----------

function bindEvents() {
  $("start").addEventListener("click", startReading);
  $("again").addEventListener("click", startReading);
  $("throw").addEventListener("click", throwCoins);
  $("abort").addEventListener("click", () => {
    cancelWaits();
    reading = null;
    show("setup");
  });
  $("back-setup").addEventListener("click", () => {
    show("setup");
    openSettings(true);
  });
  $("toggle-settings").addEventListener("click", () => openSettings($("settings").hidden));
  $("settings").addEventListener("change", (e) => {
    if (!(e.target.name in DEFAULT_SETTINGS)) return;
    settings[e.target.name] = e.target.value;
    saveSettings();
    renderSummary();
  });
  $("reset-settings").addEventListener("click", () => {
    settings = { ...DEFAULT_SETTINGS };
    saveSettings();
    syncForm();
    renderSummary();
  });
}

function openSettings(open) {
  $("settings").hidden = !open;
  $("toggle-settings").setAttribute("aria-expanded", String(open));
  $("toggle-settings").textContent = open ? "설정 닫기" : "방식 설정";
}

async function init() {
  syncForm();
  renderSummary();
  bindEvents();
  try {
    const res = await fetch("../data/hexagrams.json");
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch {
    $("load-error").hidden = false;
    $("start").disabled = true;
  }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

init();
