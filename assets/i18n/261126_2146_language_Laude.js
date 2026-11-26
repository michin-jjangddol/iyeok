// 261126_2146 LAUDE: 원본 261126_2130_language_Laude.js. 사전 새 판(261126_2146): 8괘 구슬 글. 동작 변경 없음.
// 261126_2130 LAUDE: 원본 261126_2110_language_Laude.js. 사전 새 판(261126_2130): 태극기 그려 보기 단계 글. 동작 변경 없음.
// 261126_2110 LAUDE: 원본 261126_2028_language_Laude.js. 사전 새 판(261126_2110): 8괘 더 알아보기(8면체) 글. 동작 변경 없음.
// 261126_2028 LAUDE: 원본 261126_1240_language_Laude.js. 사전 새 판(261126_2028): 8괘 쉬어 가기(태극기) 글. 동작 변경 없음.
// 261126_1240 LAUDE: 원본 261126_0821_language_Laude.js. 사전 새 판(261126_1240): 8괘 돌려 보고 뒤집어 보기 글. 동작 변경 없음.
// 261126_0821 LAUDE: 원본 261126_0805_language_Laude.js. 사전 새 판(261126_0821): 8괘 효로 셈하기 글. 동작 변경 없음.
// 261126_0805 LAUDE: 원본 261126_0736_language_Laude.js. 사전 새 판(261126_0805): 8괘 짝으로 보기 글. 동작 변경 없음.
// 261126_0736 LAUDE: 원본 261126_0725_language_Laude.js. 사전 새 판(261126_0736): 8괘 순서 따라가기 글. 동작 변경 없음.
// 261126_0725 LAUDE: 원본 261126_0707_language_Laude.js. 사전 새 판(261126_0725): 8괘 배치 이름표. 동작 변경 없음.
// 261126_0707 LAUDE: 원본 261125_2209_language_Laude.js. 사전 새 판(261126_0707): 8괘 '좌우를 바꾸면' 문장 틀. 동작 변경 없음.
// 261125_2209 LAUDE: 원본 261125_1716_language_Laude.js. 사전 새 판(261125_2209): 8괘 페이지 이진수 노트. 동작 변경 없음.
// 261125_1716 LAUDE: 원본 261125_1255_language_Laude.js. 사전 새 판(261125_1716): 8괘 페이지·홈 '8괘' 글 추가. 동작 변경 없음.
// 261125_1255 LAUDE: 원본 261125_1223_language_Shana.js. 사전 새 판(261125_1255): 홈 '하나와 둘' 머리글·연결 글 추가. 동작 변경 없음.
// SHANA: home menu translations; language behavior preserved.
// 261125_1202 LAUDE: 원본 261125_0744_language_Laude.js. 사전 새 판(261125_1202): 홈 '나의 기록' 설명·안내문 새 문장. 동작 변경 없음.
// 261125_0744 LAUDE: 원본 261124_0800_language_Laude.js. 사전 새 판(261125_0744): 설정 '팔괘 순서' 글 추가. 동작 변경 없음.
// 261124_0800 LAUDE: 원본 261123_1831_language_Laude.js. 사전 새 판(261124_0800): 위·아래 팔괘 안내(메시지·템플릿) 추가. 동작 변경 없음.
// 261123_1831 LAUDE: 원본 261123_0801_language_Laude.js. 사전 새 판(261123_1831): 홈 안내문(시초점 맛보기 연결) 두 줄 추가. 동작 변경 없음.
// 261123_0801 LAUDE: 원본 261121_1836_language_Laude.js. 사전 새 판(261123_0801): 동전점 '설정' 버튼(Settings) 추가. 동작 변경 없음.
// 공통 언어 기반. 번역이 없으면 한글 원문을 보존한다. 점/배우기 상태는 변경하지 않는다.
// 261121_1823 LAUDE: 원본 261121_1715_language_Shana.js 를 복사해 새 locale 목록(영어 홈 첫 장 번역 포함)을 읽도록만 바꿈.
// 261121_1836 LAUDE: 동전점 영어판. 문장 틀(templates)의 빈칸에 들어간 한글 이름(효 이름·괘 이름 등)도 같은 카탈로그로 번역한다.
//   빈칸 값이 ", "로 이어진 목록이면 항목마다 번역한다. 깊이는 3단계까지. 번역이 없는 값은 그대로 둔다.
export const STORAGE_KEY = "iyeok.language.v1";
const BASE = new URL("./", import.meta.url);
const normalize = (s) => String(s).replace(/\s+/g, " ").trim();
export function keyFor(source) {
  let hash = 2166136261;
  for (const char of normalize(source)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `text.${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
let requested = "ko", registry = [], korean = {}, translated = {}, templates = {};
let storageOK = true, loadFailed = false, bootstrapFailed = false, generation = 0;
const records = new WeakMap();
const attributes = ["aria-label", "aria-valuetext", "alt", "title", "placeholder"];
// 261121_1836: 원문 상자의 제목(원문)은 번역하고, 한문 본문 문단은 계속 제외한다.
const excluded = "script,style,code,pre,[data-no-i18n],.is-original > p,[lang='zh-Hant'],[lang='lzh']";
const cache = new Map();
let observer;

function readPreference() {
  try { return localStorage.getItem(STORAGE_KEY) || "ko"; }
  catch { storageOK = false; return requested; }
}
function valid(code) { return registry.some((r) => r.code === code) ? code : "ko"; }
async function json(path) {
  const url = new URL(path, BASE).href;
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Language file HTTP ${r.status}`);
    return r.json();
  }).catch((error) => { cache.delete(url); throw error; }));
  return cache.get(url);
}
function format(text, params) {
  return text.replace(/\{([a-zA-Z][\w]*)\}/g, (all, name) => params[name] == null ? all : String(params[name]));
}
export function t(key, params = {}, fallback = "") {
  const value = translated[key];
  return format(typeof value === "string" && value.trim() ? value : korean[key] ?? templates[key]?.source ?? fallback, params);
}
function translateParam(value, depth) {
  if (!/[가-힣]/.test(value) || depth > 3) return value;
  if (value.includes(", ")) return value.split(", ").map((part) => translate(part, depth + 1)).join(", ");
  return translate(value, depth + 1);
}
function translate(source, depth = 0) {
  if (requested === "ko") return source;
  const key = keyFor(source);
  if (korean[key] === source && typeof translated[key] === "string" && translated[key].trim()) {
    return t(key, {}, source);
  }
  for (const [id, entry] of Object.entries(templates)) {
    if (typeof translated[id] !== "string" || !translated[id].trim()) continue;
    const names = [];
    const escaped = entry.source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\\\{([a-zA-Z][\w]*)\\\}/g, (_, name) => { names.push(name); return "(.+?)"; });
    const match = source.match(new RegExp(`^${escaped}$`, "u"));
    if (match) return t(id, Object.fromEntries(names.map((name, i) => [name, translateParam(match[i + 1], depth)])), source);
  }
  return source;
}
function applyValue(owner, slot, current, write) {
  const saved = records.get(owner) || {};
  let record = saved[slot];
  // 앱이 새 안내문을 썼다면 그 글이 새 원문이다. 언어 변경으로 쓴 글은 원문으로 오인하지 않는다.
  if (!record || current !== record.rendered) record = { source: current, rendered: current };
  const source = normalize(record.source);
  const value = translate(source);
  const next = value === source ? record.source : `${record.source.match(/^\s*/)[0]}${value}${record.source.match(/\s*$/)[0]}`;
  if (current !== next) write(next);
  record.rendered = next;
  saved[slot] = record;
  records.set(owner, saved);
}
export function localize(root = document) {
  if (root.nodeType === Node.TEXT_NODE) {
    if (root.parentElement && !root.parentElement.closest(excluded)) {
      applyValue(root, "text", root.data, (s) => { root.data = s; });
    }
    return;
  }
  if (root.nodeType === Node.ELEMENT_NODE && root.closest(excluded)) return;
  if (root.nodeType === Node.ELEMENT_NODE) {
    for (const attr of attributes) if (root.hasAttribute(attr)) {
      applyValue(root, attr, root.getAttribute(attr), (s) => root.setAttribute(attr, s));
    }
    if (root.matches('meta[name="description"],meta[property="og:title"],meta[property="og:description"]')) {
      applyValue(root, "content", root.content, (s) => { root.content = s; });
    }
  }
  for (const child of root.childNodes) localize(child);
}
function updateNotice() {
  document.documentElement.dataset.language = requested;
  // 아직 없는 번역을 영어로 잘못 읽지 않도록 문서의 기본 실제 언어는 한국어로 둔다.
  const selected = registry.find((r) => r.code === requested);
  document.documentElement.lang = !loadFailed && selected?.status === "ready" ? requested : "ko";
  for (const select of document.querySelectorAll("[data-language-select]")) select.value = requested;
  for (const label of document.querySelectorAll("[data-language-label]")) label.textContent = t("controls.label", {}, "언어 선택");
  for (const link of document.querySelectorAll("[data-language-home]")) link.textContent = t("controls.home", {}, "언어 설정은 아이역 홈에서");
  for (const panel of document.querySelectorAll(".iyeok-language")) panel.setAttribute("aria-label", t("controls.region", {}, "언어 설정"));
  for (const option of document.querySelectorAll("[data-language-select] option")) {
    const locale = registry.find((r) => r.code === option.value);
    option.textContent = locale.label + (locale.status === "preparing" ? t("controls.pendingSuffix", {}, " · 번역 준비 중") : "");
  }
  for (const box of document.querySelectorAll("[data-language-status]")) {
    const label = registry.find((r) => r.code === requested)?.label || "한국어";
    box.textContent = loadFailed
      ? t("controls.failed", {}, "언어 자료를 불러오지 못해 한국어로 표시합니다. 다시 방문하면 재시도합니다.")
      : requested === "ko"
        ? t("controls.korean", {}, "한국어로 표시합니다. 다른 언어는 번역 준비 중입니다.")
        : t("controls.preparing", { language: label }, `${label} 번역 준비 중입니다. 번역된 항목부터 적용하며, 아직 없는 글은 한국어로 표시합니다.`);
    if (!storageOK) box.textContent += t("controls.storageBlocked", {}, " 이 브라우저에서는 언어 선택을 저장할 수 없습니다.");
  }
}
export async function setLanguage(code, { persist = true } = {}) {
  const ticket = ++generation;
  requested = valid(code);
  if (persist) try { localStorage.setItem(STORAGE_KEY, requested); } catch { storageOK = false; }
  const selected = requested;
  let messages = {}, failed = bootstrapFailed;
  if (selected !== "ko") try {
    const data = await json(registry.find((r) => r.code === selected).file);
    messages = data.messages || {};
  } catch { failed = true; }
  if (ticket !== generation) return;
  translated = messages;
  loadFailed = failed;
  observer?.disconnect();
  localize();
  updateNotice();
  observe();
  window.dispatchEvent(new CustomEvent("iyeok:languagechange", { detail: { requested: selected, fallback: "ko" } }));
}
function observe() {
  observer?.observe(document.documentElement, {
    subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: [...attributes, "content"],
  });
}
function mountControls() {
  const home = new URL("../../", import.meta.url);
  const isHome = location.pathname === home.pathname || location.pathname === `${home.pathname}index.html`;
  const panel = document.createElement("section");
  panel.className = "iyeok-language";
  panel.dataset.noI18n = "";
  panel.setAttribute("aria-label", "언어 설정");
  if (isHome) {
    const label = document.createElement("label");
    label.htmlFor = "iyeok-language-select";
    label.dataset.languageLabel = "";
    label.textContent = "언어 선택";
    const select = document.createElement("select");
    select.id = label.htmlFor;
    select.dataset.languageSelect = "";
    for (const locale of registry) {
      const option = document.createElement("option");
      option.value = locale.code;
      option.textContent = locale.label + (locale.status === "preparing" ? " · 번역 준비 중" : "");
      select.append(option);
    }
    select.addEventListener("change", () => { void setLanguage(select.value); });
    panel.append(label, select);
  } else {
    const link = document.createElement("a");
    home.hash = "iyeok-language";
    link.href = home.href;
    link.dataset.languageHome = "";
    link.textContent = "언어 설정은 아이역 홈에서";
    panel.append(link);
  }
  panel.id = "iyeok-language";
  const status = document.createElement("p");
  status.dataset.languageStatus = "";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  if (isHome) document.getElementById("iyeok-language-select")?.setAttribute("aria-describedby", "iyeok-language-status");
  status.id = "iyeok-language-status";
  panel.append(status);
  const header = document.querySelector(".site-header");
  if (header) header.after(panel); else document.body.prepend(panel);
  panel.querySelector("select")?.setAttribute("aria-describedby", status.id);
}
async function initialize() {
  try {
    const config = await json("261126_2146_locales_Laude.json");
    registry = config.locales;
    const data = await json(registry.find((r) => r.code === "ko").file);
    korean = data.messages || {};
    templates = data.templates || {};
  } catch {
    registry = [{ code: "ko", label: "한국어", status: "ready" }];
    loadFailed = true;
    bootstrapFailed = true;
  }
  mountControls();
  observer = new MutationObserver((mutations) => {
    observer.disconnect();
    for (const change of mutations) {
      if (change.type === "childList") for (const node of change.addedNodes) localize(node);
      else localize(change.target);
    }
    observe();
  });
  await setLanguage(readPreference(), { persist: false });
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY || e.key === null) void setLanguage(readPreference(), { persist: false });
  });
  window.addEventListener("pageshow", () => {
    const code = valid(readPreference());
    if (code !== requested) void setLanguage(code, { persist: false });
  });
}
export const ready = initialize();
window.iyeokLanguage = { ready, setLanguage, getLanguage: () => requested, t, keyFor, localize };
