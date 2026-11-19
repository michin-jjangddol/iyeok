// 아이역 동전점 맛보기 — 화면 동작
import {
  tossCoins, countYang, lineTypeFromYangCount, fillOrder,
  primaryLines, changedLines, changingPositions, findHexagram, lineName,
} from "./iching.js";

const DEFAULT_SETTINGS = { coin: "basic", yangFace: "picture", order: "earth", symbols: "iyeok" };
const STORAGE_KEY = "iyeok.coin.settings.v1";
// 화면이 쓰는 괘사·효사 목록 파일. 내용을 고치면 새 날짜 파일을 만들고 이 경로만 바꾼다.
const CONTENT_INDEX = "../data/hexagrams/261119_1236_content-index_Shana.json";
const PENDING = { judgment: "괘사를 준비 중입니다.", line: "효사를 준비 중입니다.", other: "준비 중입니다." };
const LOAD_FAILED = "내용을 불러오지 못했습니다.";
// 일시적인 오류(연결 끊김, 서버 5xx 등)일 때 다시 시도하기 전 기다리는 시간. 처음 시도까지 합쳐 최대 3번.
const RETRY_DELAYS = [400, 1200];
// 번역·풀이가 샤나(GPT)의 초안일 때 풀이 아래에 붙이는 작성 노트
const SHANA_DRAFT_NOTE =
  "번역·풀이: 샤나(GPT)가 작성한 검토용 초안입니다. 특정 해설서의 번역·풀이를 인용한 것이 아니며, 추후 문헌 대조와 검토를 통해 보완할 예정입니다.";

const LABELS = {
  coin: { basic: "기본 동전", won100: "100원", won500: "500원" },
  yangFace: { picture: "그림 면", number: "숫자 면" },
  order: { earth: "땅괘 · 아래 → 위", heaven: "하늘괘 · 위 → 아래", human: "인간괘 · 자리를 골라서" },
  symbols: { iyeok: "노양 × · 노음 ○", classic: "노양 ○ · 노음 ×" },
};
const SUMMARY_TITLES = { coin: "동전", yangFace: "양으로 삼을 면", order: "효를 채우는 순서", symbols: "변효 기호" };

// 숫자 면에 적힌 금액 (그림 면 표시는 coinMark 참고)
const COIN_FACES = {
  won100: { number: "100" },
  won500: { number: "500" },
};
const FACE_NAMES = { picture: "그림", number: "숫자" };
const POSITION_LABELS = ["초효", "이효", "삼효", "사효", "오효", "상효"];

const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let data = null;
let contentIndex = null; // 괘사·효사 목록. 불러오기에 성공했을 때만 채운다.
let contentIndexLoading = null;
const contentCache = new Map(); // 성공한 요청만 남긴다. 실패한 요청은 지워서 다음에 다시 시도할 수 있게 한다.
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
  $("throw").disabled = r.busy || needPick;
  $("throw").textContent = done ? "괘상 보기 →" : "동전 던지기";
  $("calm").hidden = done;
  if (!r.throws.length) {
    $("toss-note").textContent = needPick
      ? "먼저 채울 자리를 고르세요."
      : `${POSITION_LABELS[target]}부터 채웁니다.`;
  }
}

async function throwCoins() {
  const r = reading;
  if (!r || r.busy) return;
  if (r.throws.length === 6) {
    // 여섯 효가 다 차면 같은 버튼이 "괘상 보기"가 된다
    showResult();
    return;
  }
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
  let next = "";
  if (r.throws.length === 6) next = " 여섯 효가 완성되었습니다. 괘상을 확인해 보세요.";
  else if (r.settings.order === "human") next = " 다음에 채울 자리를 고르세요.";
  $("toss-note").textContent =
    `${POSITION_LABELS[position]}: 양의 면 ${yangCount}개 → ${type.name} (${type.yang ? "양" : "음"}${change}).${next}`;
  renderCast();
  if (r.throws.length === 6) $("throw").focus();
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
    const yang = face === s.yangFace;
    const mark = document.createElement("span");
    mark.className = "coin-mark";
    mark.textContent = face ? coinMark(s.coin, face, yang) : "?";
    const cap = document.createElement("span");
    cap.className = "coin-cap";
    cap.textContent = face ? coinCaption(s.coin, face, yang) : "";
    coin.append(mark, cap);
    coin.setAttribute("aria-label", face ? coinCaption(s.coin, face, yang).replace(" · ", " 면, ") : "아직 던지지 않음");
    wrap.append(coin);
  }
}

// 기본 동전은 두 면 모두 陽/陰. 100원·500원은 숫자 면에 금액, 그림 면에 그 면의 음양.
function coinMark(coin, face, yang) {
  if (coin === "basic" || face === "picture") return yang ? "陽" : "陰";
  return COIN_FACES[coin].number;
}

function coinCaption(coin, face, yang) {
  if (coin === "basic") return yang ? "양" : "음";
  return `${FACE_NAMES[face]} · ${yang ? "양" : "음"}`;
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
    const coins = t.faces
      .map((f) => coinMark(r.settings.coin, f, f === r.settings.yangFace))
      .join(" · ");
    const sym = changingSymbol(r.settings, t.type);
    for (const text of [`${i + 1}`, POSITION_LABELS[t.position], coins, `${t.type.name}${sym ? ` ${sym}` : ""}`]) {
      const td = document.createElement("td");
      td.textContent = text;
      tr.append(td);
    }
    body.append(tr);
  });
  $("log-settings").textContent = `이번 점의 방식: ${describeSettings(r.settings)}`;
  renderTexts(r, primary, changed, moving);
  show("result");
}

// ---------- 괘사·효사 ----------

// 괘 식별자: 위가 상효(bit 5), 오른쪽 끝이 초효(bit 0). 문왕괘 번호와 따로 둔다.
function hexId(hex) {
  return [...hex.lines].reverse().join("");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// JSON을 받는다. 연결 오류나 일시적인 서버 오류(408, 429, 5xx)는 몇 번 더 시도하고, 그래도 안 되면 오류를 던진다.
async function fetchJson(url) {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    if (attempt) await sleep(RETRY_DELAYS[attempt - 1]);
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      lastError = new Error(`HTTP ${res.status}`);
      const temporary = res.status === 408 || res.status === 429 || res.status >= 500;
      if (!temporary) break;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// 괘사·효사 목록. 실패하면 다음에 필요할 때 다시 받는다.
function ensureContentIndex() {
  if (contentIndex) return Promise.resolve(contentIndex);
  if (!contentIndexLoading) {
    contentIndexLoading = fetchJson(CONTENT_INDEX)
      .then((index) => (contentIndex = index))
      .finally(() => {
        contentIndexLoading = null;
      });
  }
  return contentIndexLoading;
}

function loadContent(path) {
  if (!contentCache.has(path)) {
    const url = new URL(path, new URL(CONTENT_INDEX, location.href));
    const request = fetchJson(url);
    contentCache.set(path, request);
    request.catch(() => contentCache.delete(path));
  }
  return contentCache.get(path);
}

// 결과: { status: "ok", original, ko } | { status: "none" } (아직 쓰지 않은 괘) | { status: "error" } (불러오기 실패)
async function loadJudgment(hex) {
  try {
    const index = await ensureContentIndex();
    const entry = index?.hexagrams?.[hexId(hex)]?.judgment;
    if (!entry?.original) return { status: "none" };
    const [original, ko] = await Promise.all([
      loadContent(entry.original),
      entry.ko ? loadContent(entry.ko) : null,
    ]);
    return { status: "ok", original, ko };
  } catch {
    return { status: "error" };
  }
}

function textBlock(label, lines, lang, className) {
  const wrap = document.createElement("div");
  wrap.className = `text-block ${className}`;
  const h = document.createElement("h4");
  h.textContent = label;
  wrap.append(h);
  const list = lines?.length ? lines : null;
  const p = document.createElement("p");
  if (list) {
    if (lang) p.lang = lang;
    list.forEach((line, i) => {
      if (i) p.append(document.createElement("br"));
      p.append(line);
    });
  } else {
    p.className = "pending";
    p.textContent = PENDING.other;
  }
  wrap.append(p);
  return wrap;
}

function judgmentSection(title, hex, content, retry) {
  const sec = document.createElement("section");
  sec.className = "text-section";
  const h3 = document.createElement("h3");
  h3.innerHTML = `${title} <span class="text-hex">${hex.titleKo} 괘사</span>`;
  sec.append(h3);
  if (content?.status === "error") {
    const box = document.createElement("div");
    box.className = "load-failed";
    const p = document.createElement("p");
    p.textContent = LOAD_FAILED;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn retry";
    btn.textContent = "다시 시도";
    btn.addEventListener("click", () => {
      btn.disabled = true;
      btn.textContent = "불러오는 중…";
      retry();
    });
    box.append(p, btn);
    sec.append(box);
    return sec;
  }
  if (!content?.original?.text?.length) {
    const p = document.createElement("p");
    p.className = "pending";
    p.textContent = PENDING.judgment;
    sec.append(p);
    return sec;
  }
  const ko = content.ko;
  const translation = textBlock("번역", ko?.translation, "ko", "is-translation");
  if (ko?.translation?.length && ko.translationNote) {
    // 번역에 붙는 짧은 주석 (예: 고대 관념을 오늘날의 규범으로 적용하지 않는다는 설명)
    const note = document.createElement("p");
    note.className = "text-annotation";
    note.textContent = `주석: ${ko.translationNote}`;
    translation.append(note);
  }
  sec.append(
    textBlock("원문", content.original.text, "zh-Hant", "is-original"),
    textBlock("독음", ko?.reading, "ko", "is-reading"),
    translation,
    textBlock("풀이", ko?.interpretation, "ko", "is-interpretation"),
  );
  if (ko?.status === "draft") {
    const byShana = Object.values(ko.sources ?? {}).some((s) => String(s).includes("SHANA"));
    const draft = document.createElement("p");
    draft.className = "draft-note";
    draft.textContent = byShana ? SHANA_DRAFT_NOTE : "번역·풀이: 검토 중인 초안입니다.";
    sec.append(draft);
  }
  const note = document.createElement("p");
  note.className = "hint text-source";
  note.textContent = `원문: ${content.original.source ?? "출처 확인 중"}`;
  sec.append(note);
  return sec;
}

function linesSection(types, moving) {
  const sec = document.createElement("section");
  sec.className = "text-section";
  const h3 = document.createElement("h3");
  h3.textContent = "변효 효사";
  sec.append(h3);
  const ul = document.createElement("ul");
  ul.className = "line-texts";
  for (const pos of [...moving].reverse()) {
    const li = document.createElement("li");
    const b = document.createElement("b");
    b.textContent = lineName(pos, types[pos].yang);
    const span = document.createElement("span");
    span.className = "pending";
    span.textContent = PENDING.line;
    li.append(b, span);
    ul.append(li);
  }
  sec.append(ul);
  return sec;
}

// retrying=true면 "다시 시도" 중이라 지금 화면을 둔 채 불러오고, 새 점이면 이전 점의 글을 먼저 지운다.
async function renderTexts(r, primary, changed, moving, retrying = false) {
  const box = $("texts");
  if (!retrying) box.replaceChildren();
  const [pc, cc] = await Promise.all([
    loadJudgment(primary),
    moving.length ? loadJudgment(changed) : null,
  ]);
  if (reading !== r) return; // 불러오는 사이에 새 점을 시작함
  const retry = () => renderTexts(r, primary, changed, moving, true);
  box.replaceChildren(judgmentSection("본괘", primary, pc, retry));
  if (moving.length) {
    box.append(linesSection(r.lines, moving));
    box.append(judgmentSection("지괘", changed, cc, retry));
  }
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
  // 목록을 미리 받아 둔다. 실패해도 점은 칠 수 있고, 결과를 볼 때 다시 시도한다.
  ensureContentIndex().catch(() => {});
  if ("serviceWorker" in navigator) {
    // 새 버전의 서비스 워커가 자리를 잡으면, 점을 치는 중이 아닐 때 한 번 새로고침해서 새 화면을 쓴다.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || reloaded || reading) return;
      reloaded = true;
      location.reload();
    });
    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch(() => {});
  }
}

init();
