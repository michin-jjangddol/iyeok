// 261124_0800 LAUDE: 원본 261124_0732_hexagram-texts_Laude.js. 동전점도 이 모듈을 쓰게 되어 [다시 시도] 버튼 클래스를 두 화면용으로, prefetch 추가.
// 261124_0732 LAUDE: 원본 261123_1831_hexagram-texts_Laude.js. 괘사 앞에 '괘의 모습'(intro) 글을 넣을 수 있게 함(JJDD). 그 밖의 동작은 같다.
// 261123_1831 LAUDE: 괘사·효사 불러오기와 표시(공용 모듈). 시초점 맛보기(yarrow/try/)가 쓴다.
//   동전점(app/app.js)의 같은 부분(fetchJson·ensureContentIndex·loadContent·loadJudgment·textBlock·judgmentSection·linesSection·renderTexts)을
//   그대로 옮겨 모듈로 만들었다: 일시적 오류 재시도, 실패 시 [다시 시도], 아직 없는 글은 '준비 중' 표시가 같다.
//   동전점은 이번에 바꾸지 않았다(동전점 기능 변경 금지). 나중에 동전점도 이 모듈을 쓰게 하면 한 곳에서 관리할 수 있다.
import { lineName } from "../app/iching.js";

const PENDING = { judgment: "괘사를 준비 중입니다.", line: "효사를 준비 중입니다.", other: "준비 중입니다." };
const LOAD_FAILED = "내용을 불러오지 못했습니다.";
const RETRY_DELAYS = [400, 1200];
const SHANA_DRAFT_NOTE =
  "번역·풀이: 샤나(GPT)가 작성한 검토용 초안입니다. 특정 해설서의 번역·풀이를 인용한 것이 아니며, 추후 문헌 대조와 검토를 통해 보완할 예정입니다.";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 괘 식별자: 위가 상효(bit 5), 오른쪽 끝이 초효(bit 0). 문왕괘 번호와 따로 둔다.
export function hexId(hex) {
  return [...hex.lines].reverse().join("");
}

// JSON을 받는다. 연결 오류나 일시적인 서버 오류(408, 429, 5xx)는 몇 번 더 시도하고, 그래도 안 되면 오류를 던진다.
export async function fetchJson(url) {
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

// contentIndexUrl: 괘사·효사 목록 파일(페이지 기준 상대 경로 가능)
export function createTextLoader(contentIndexUrl) {
  const indexUrl = new URL(contentIndexUrl, location.href);
  let contentIndex = null;
  let contentIndexLoading = null;
  const contentCache = new Map(); // 성공한 요청만 남긴다

  function ensureContentIndex() {
    if (contentIndex) return Promise.resolve(contentIndex);
    if (!contentIndexLoading) {
      contentIndexLoading = fetchJson(indexUrl)
        .then((index) => (contentIndex = index))
        .finally(() => {
          contentIndexLoading = null;
        });
    }
    return contentIndexLoading;
  }

  function loadContent(path) {
    if (!contentCache.has(path)) {
      const request = fetchJson(new URL(path, indexUrl));
      contentCache.set(path, request);
      request.catch(() => contentCache.delete(path));
    }
    return contentCache.get(path);
  }

  // 결과: { status: "ok", original, ko } | { status: "none" } | { status: "error" }
  async function loadJudgment(hex) {
    try {
      const index = await ensureContentIndex();
      const entry = index?.hexagrams?.[hexId(hex)]?.judgment;
      if (!entry?.original) return { status: "none" };
      const [original, ko] = await Promise.all([loadContent(entry.original), entry.ko ? loadContent(entry.ko) : null]);
      return { status: "ok", original, ko };
    } catch {
      return { status: "error" };
    }
  }

  // box 에 괘사를 그린다. isCurrent(): 불러오는 사이에 새 괘를 시작했으면 false.
  // types: 여섯 효의 { yang, changing } (iching.js 의 효 종류), moving: 변효 자리.
  // intro(hex): 괘사 앞에 보여 줄 짧은 글 줄(없으면 생략). 예: 위·아래 팔괘로 본 괘의 모습.
  async function renderTexts(box, { primary, changed, types, moving, isCurrent = () => true, retrying = false, intro = null }) {
    if (!retrying) box.replaceChildren();
    const [pc, cc] = await Promise.all([loadJudgment(primary), moving.length ? loadJudgment(changed) : null]);
    if (!isCurrent()) return;
    const retry = () => renderTexts(box, { primary, changed, types, moving, isCurrent, retrying: true, intro });
    box.replaceChildren(judgmentSection("본괘", primary, pc, retry, intro));
    if (moving.length) {
      box.append(linesSection(types, moving));
      box.append(judgmentSection("지괘", changed, cc, retry, intro));
    }
  }

  // 목록을 미리 받아 둔다(실패해도 결과를 볼 때 다시 시도)
  const prefetch = () => ensureContentIndex().catch(() => {});
  return { renderTexts, loadJudgment, prefetch };
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

function judgmentSection(title, hex, content, retry, intro = null) {
  const sec = document.createElement("section");
  sec.className = "text-section";
  const h3 = document.createElement("h3");
  h3.append(`${title} `);
  const span = document.createElement("span");
  span.className = "text-hex";
  span.textContent = `${hex.titleKo} 괘사`;
  h3.append(span);
  sec.append(h3);
  const lines = intro ? intro(hex) : null;
  if (lines?.length) {
    const box = document.createElement("div");
    box.className = "text-block is-imagery";
    const h = document.createElement("h4");
    h.textContent = "괘의 모습";
    box.append(h, ...lines.map((t) => Object.assign(document.createElement("p"), { textContent: t })));
    sec.append(box);
  }
  if (content?.status === "error") {
    const box = document.createElement("div");
    box.className = "load-failed";
    const p = document.createElement("p");
    p.textContent = LOAD_FAILED;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn retry learn-btn learn-ghost"; // 동전점(.btn)·시초점(.learn-btn) 모두
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
