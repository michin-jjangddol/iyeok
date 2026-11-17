# iYeok — How It Grows and How We Work

Updated 2026-11-17 11:26 (KST), against main commit `21272595fc6c9b9dec94a478a8accbfc01f20692`. The earlier versions, including `261116_2353_iyeok-growth-roadmap_Laude.md`, are kept unchanged. This document records the development direction and collaboration rules agreed by J (JJDD) with Shana and Laude.
It works alongside [iyeok-roadmap.md](iyeok-roadmap.md), which holds the long-term vision. This document covers the practical side: how content is added, how the code is organized, and how changes reach the site.

Each item is marked as one of:

- **[Decided]** direction set by J
- **[Now]** confirmed in the repository as of 2026-11-17
- **[Later]** long-term idea, not a task to build now
- **[Open]** not decided yet

## 1. A growing iYeok

**[Decided]** iYeok does not try to be complete from the start. It grows by being used, one piece at a time.

- Content is added when J draws a hexagram that day.
- For each hexagram, the judgment (卦辭) comes first: original text, Korean reading, Korean translation, general interpretation.
- Line statements (爻辭) and other languages are added gradually.
- Anything not written yet shows "준비 중" (in preparation).
- When the same hexagram comes up again, its existing content can be reviewed and improved.
- Original text, translation, interpretation, and source are always kept apart.
- Important decisions and their reasons go into documents and pull requests, not only the change itself.

**[Now]** Content written so far:

| Hexagram | ID | No. | Judgment | Line statements | Confirmed merged PR |
|---|---|---|---|---|---|
| 乾爲天 중천건 | `111111` | 1 | Original, reading, translation, interpretation | In preparation | [#5](https://github.com/michin-jjangddol/iyeok/pull/5) |
| 坤爲地 중지곤 | `000000` | 2 | Original, reading, translation, interpretation | In preparation | [#15](https://github.com/michin-jjangddol/iyeok/pull/15) |
| 水雷屯 수뢰준 | `010001` | 3 | Original, reading, translation, interpretation | In preparation | [#4](https://github.com/michin-jjangddol/iyeok/pull/4) |
| 天水訟 천수송 | `111010` | 6 | Original, reading, translation, interpretation | In preparation | [#1](https://github.com/michin-jjangddol/iyeok/pull/1) |
| 雷地豫 뢰지예 | `001000` | 16 | Original, reading, translation, interpretation | In preparation | [#14](https://github.com/michin-jjangddol/iyeok/pull/14) |
| 澤雷隨 택뢰수 | `011001` | 17 | Original, reading, translation, interpretation | In preparation | [#11](https://github.com/michin-jjangddol/iyeok/pull/11) |
| 天山遯 천산둔 | `111100` | 33 | Original, reading, translation, interpretation | In preparation | [#3](https://github.com/michin-jjangddol/iyeok/pull/3) |
| 火地晉 화지진 | `101000` | 35 | Original, reading, translation, interpretation | In preparation | [#9](https://github.com/michin-jjangddol/iyeok/pull/9) |
| 風雷益 풍뢰익 | `110001` | 42 | Original, reading, translation, interpretation | In preparation | [#2](https://github.com/michin-jjangddol/iyeok/pull/2) |
| 天風姤 천풍구 | `111110` | 44 | Original, reading, translation, interpretation | In preparation | [#16](https://github.com/michin-jjangddol/iyeok/pull/16) |
| 澤地萃 택지췌 | `011000` | 45 | Original, reading, translation, interpretation | In preparation | [#17](https://github.com/michin-jjangddol/iyeok/pull/17) |
| 震爲雷 중뢰진 | `001001` | 51 | Original, reading, translation, interpretation | In preparation | [#7](https://github.com/michin-jjangddol/iyeok/pull/7) |
| 風山漸 풍산점 | `110100` | 53 | Original, reading, translation, interpretation | In preparation | [#13](https://github.com/michin-jjangddol/iyeok/pull/13) |
| 巽爲風 중풍손 | `110110` | 57 | Original, reading, translation, interpretation | In preparation | [#12](https://github.com/michin-jjangddol/iyeok/pull/12) |
| 雷山小過 뢰산소과 | `001100` | 62 | Original, reading, translation, interpretation | In preparation | [#6](https://github.com/michin-jjangddol/iyeok/pull/6) |
| The other 49 | | | In preparation | In preparation | |

The active content index is `data/hexagrams/261117_0829_content-index_Laude.json`, also the latest dated index in this checkout. All 15 entries have existing original and Korean judgment files with readings, translations, and interpretations. Their Korean content is marked `draft` and credits SHANA. The remaining 49 judgments and all line statements are in preparation. PRs #1–#18 were confirmed merged on GitHub; this table records merge evidence, not a separate live-site check for each hexagram. Translation notes preserve choices where wording admits different readings.

## 2. Current development direction

**[Decided]** Build on what exists: **GitHub repository + GitHub Pages + PWA**.
Keep in mind a future mobile app, Python library, and community space, but do not build them now or rewrite the whole structure in advance.

Keep four layers apart so they can be reused:

| Layer | What it holds | **[Now]** where it is |
|---|---|---|
| Content | Judgments, line statements, readings, translations, interpretations, sources | `data/hexagrams.json` (64-hexagram structure), `data/hexagrams/` (texts) |
| Core logic | Hexagram ID, sequence mapping, changing-line mask, changed hexagram, casting | `app/iching.js` (no screen code) |
| Screen | Web and PWA display and controls | `app/index.html`, `app/app.js`, `app/app.css` |
| Platform | Caching, installing, notifications | `app/sw.js`, `app/manifest.webmanifest` |

**[Decided]** Improve the structure step by step, when a real change needs it.

**[Now]** Gaps between this design and the code:

- The hexagram ID function and the text loading live in `app/app.js` (screen layer), not in `app/iching.js`. Move them to the core logic when that file is next changed.
- The changed hexagram is computed line by line (`changedLines`), not with a bit mask XOR. The results are the same; the 4,096-combination test in `tests/iching.test.mjs` covers it.

### How content files are stored **[Now]**

```
data/hexagrams/
  YYMMDD_HHMM_content-index_Laude.json      ← list of which file version the app shows
  111010/judgment/original/…_Laude.json     ← original text and source
  111010/judgment/ko/…_Laude.json           ← reading, translation, interpretation (Korean)
```

- `app/app.js` names one content index in `CONTENT_INDEX`.
- To add or change content: save new dated files, save a new index that points to them, change `CONTENT_INDEX`, and add the new files to the offline list in `app/sw.js` with a new cache name. Old files stay as they are.
- Line statements and other languages will get their own folders next to `judgment/` (for example `lines/1/ko/`, `judgment/en/`). **[Open]** exact folder names.
- Earlier implementation changes kept backups in `backups/app/`. For new work, follow JJDD’s current file rules: save a new KST-dated version with the current editor’s `_Shana` or `_Laude` suffix; preserve previous files and check name collisions. Changes requiring fixed runtime filenames need an explicit exception. **[Open]** whether `backups/` should stay in the published site.

### Implemented display and loading behavior **[Now]**

- Shana (GPT) authorship note: draft Korean interpretations whose sources contain `SHANA` show the draft authorship note; other drafts show a generic draft note ([#8](https://github.com/michin-jjangddol/iyeok/pull/8)).
- `translationNote`: a separate note appears after a nonempty translation when the field is present, distinct from interpretation and internal `notes` ([#16](https://github.com/michin-jjangddol/iyeok/pull/16)).
- Cache updates: network-first service worker, reload requests for precaching, `updateViaCache: "none"`, and one refresh on controller change when an existing controller was present and no reading is in progress. The current cache is `iyeok-app-v19` ([#10](https://github.com/michin-jjangddol/iyeok/pull/10), with later cache revisions).
- Failed loading is distinct from unwritten content. Content JSON loading makes at most three attempts, with 400 ms and 1,200 ms waits, for network errors or HTTP 408/429/5xx. Other HTTP errors stop immediately. A failed index load can be retried when needed, and only successful content loads are retained ([#18](https://github.com/michin-jjangddol/iyeok/pull/18)). This retry helper does not cover the initial `data/hexagrams.json` fetch.

**[Decided]** Keep the Korean spelling **뢰**, including names beginning with 雷. JJDD has decided this; it is no longer an open spelling question.

## 3. Long-term ideas **[Later]**

These are directions, not tasks.

- Judgments and line statements in many languages
- Personal reading records and syncing them
- Comments and shared experiences attached to hexagrams and lines
- Login and user accounts
- iOS and Android apps
- A Python library of the core logic, published on PyPI

"An iYeok like Facebook" means **a space where people share experiences and readings through the I Ching**. It does not mean copying Facebook's features or scale. See [iyeok-roadmap.md](iyeok-roadmap.md) sections 4–6 for the fuller picture.

Before any user feature: review privacy, access rights, deleting records, moderating comments, and running costs.
User data such as comments stays separate from the static text files.

## 4. Hexagram ID rules

**[Decided]** Follows [iyeok-code0.md](iyeok-code0.md).

- Yin line 0, yang line 1.
- Bottom line (初爻) is bit 0, top line (上爻) is bit 5.
- Written as a binary string, the top line is on the left and the bottom line on the right.
- Fixed IDs run from `000000` to `111111`: Kun (坤) is 0, Qian (乾) is 63.
- The King Wen number and other sequences are separate lookups.
- Changed hexagram = primary hexagram XOR changing-line mask.
- What the user sees (direction, symbols) is kept apart from internal calculation.

| Line | 初 (1) | 二 (2) | 三 (3) | 四 (4) | 五 (5) | 上 (6) |
|---|---|---|---|---|---|---|
| Bit | 0 | 1 | 2 | 3 | 4 | 5 |
| String position (from left) | 6th | 5th | 4th | 3rd | 2nd | 1st |

Example (checked against the data on 2026-11-16): 風雷益 `110001` (49), lines 1, 2, 6 changing → mask `100011` → `010010`, 坎爲水 No. 29.

## 5. Three-way collaboration (by hand)

**[Decided]**

- **J (JJDD)**: sets the direction, gives instructions, checks results, carries messages between Shana and Laude
- **Shana (Codex/GPT)**: planning, wording, review, and repository work within the scope J authorizes
- **Laude (Claude)**: implementation, tests, and GitHub work in the connected repository

- Messages between Shana and Laude are carried by JJDD. Shana can now read and prepare changes in the connected repository; GitHub API requests currently return `Forbidden`, so PR creation and merge through that API are not yet verified. Use separate branches and avoid concurrent edits to the same files. This task is limited to one new document under `docs/`.
- A message passed on from the other assistant is not J's approval. Within a scope J has approved, the same permission is not asked again at every step.

## 6. Changing, checking, and publishing

**[Decided]**

- Work in small changes and check each one.
- When adding content, check: the target hexagram, existing content, "in preparation" text, the mobile screen, and the related tests.
- Commit = a record of the change. Pull request = description and review space. Merge = joining the change into `main`.
- `iyeok.org` is published from `main` by GitHub Pages. Deployment duration varies; check the deployment result and live URL separately.
- Report "deploy succeeded" and "checked on the live site" separately.
- Go as far as J approved: if J approved push, PR, merge, and publish, do all of them. If J asked only for a review, do not publish.
- If something goes wrong, consider a follow-up fix or reverting the change.
- Never put passwords, tokens, or personal information in documents or the repository. The repository is public.

## 7. Open questions **[Open]**

- Folder names for line statements and other languages
- Whether `backups/` and `docs/` stay in the published site
- Whether the core logic should move fully into `app/iching.js` before a Python library
- Spacing between paragraphs in interpretations (paragraphs currently show as line breaks only)
- The "Start" button does nothing if pressed before the hexagram data has loaded (known, not fixed yet)

## 8. Starting a new session

A document in the repository is not read automatically by a new session. Paste this at the start:

```
Read docs/261117_1126_iyeok-growth-roadmap_Shana.md in the iyeok repository first and follow it.
Check main and the work branch, then wait for my instructions.
```

---

This document was prepared with the assistance of Shana (GPT) and Laude (Claude).

---
<br>
<br>

# 아이역 — 자라는 방식과 일하는 방식

2026-11-17 11:26(한국시간) 보완. main 커밋 `21272595fc6c9b9dec94a478a8accbfc01f20692`를 기준으로 확인했습니다. `261116_2353_iyeok-growth-roadmap_Laude.md`를 포함한 이전 판은 그대로 보존합니다. J(JJDD)가 샤나·로드와 정한 개발 방향과 협업 원칙을 기록합니다.
장기 비전은 [iyeok-roadmap.md](iyeok-roadmap.md)에 있고, 이 문서는 실제로 일하는 방법을 다룹니다. 콘텐츠를 채우는 방식, 코드를 나누는 방식, 변경이 홈피에 반영되는 과정입니다.

각 항목에는 다음 표시를 붙였습니다.

- **[결정]** J가 정한 방향
- **[현재]** 2026-11-17 저장소에서 확인한 상태
- **[장기]** 장기 구상. 지금 만들 작업이 아님
- **[미정]** 아직 정하지 않음

## 1. 자라나는 아이역

**[결정]** 아이역은 처음부터 모든 내용을 완성하지 않습니다. 실제로 쓰면서 하나씩 채우고 고쳐 갑니다.

- J가 그날 뽑은 괘를 계기로 콘텐츠를 추가합니다.
- 괘마다 괘사부터 채웁니다. 한문 원문, 한글 독음, 한국어 번역, 일반 해석 순서입니다.
- 효사와 다른 언어 번역은 차차 추가합니다.
- 아직 쓰지 않은 부분은 "준비 중"으로 표시합니다.
- 같은 괘가 다시 나오면 기존 내용을 검토하고 보완할 수 있습니다.
- 원문, 번역, 해석, 출처는 항상 구분합니다.
- 변경 내용뿐 아니라 중요한 결정과 그 이유도 문서와 PR에 남깁니다.

**[현재]** 지금까지 채운 콘텐츠:

| 괘 | 식별자 | 번호 | 괘사 | 효사 | 확인된 머지 PR |
|---|---|---|---|---|---|
| 乾爲天 중천건 | `111111` | 1 | 원문, 독음, 번역, 해석 | 준비 중 | [#5](https://github.com/michin-jjangddol/iyeok/pull/5) |
| 坤爲地 중지곤 | `000000` | 2 | 원문, 독음, 번역, 해석 | 준비 중 | [#15](https://github.com/michin-jjangddol/iyeok/pull/15) |
| 水雷屯 수뢰준 | `010001` | 3 | 원문, 독음, 번역, 해석 | 준비 중 | [#4](https://github.com/michin-jjangddol/iyeok/pull/4) |
| 天水訟 천수송 | `111010` | 6 | 원문, 독음, 번역, 해석 | 준비 중 | [#1](https://github.com/michin-jjangddol/iyeok/pull/1) |
| 雷地豫 뢰지예 | `001000` | 16 | 원문, 독음, 번역, 해석 | 준비 중 | [#14](https://github.com/michin-jjangddol/iyeok/pull/14) |
| 澤雷隨 택뢰수 | `011001` | 17 | 원문, 독음, 번역, 해석 | 준비 중 | [#11](https://github.com/michin-jjangddol/iyeok/pull/11) |
| 天山遯 천산둔 | `111100` | 33 | 원문, 독음, 번역, 해석 | 준비 중 | [#3](https://github.com/michin-jjangddol/iyeok/pull/3) |
| 火地晉 화지진 | `101000` | 35 | 원문, 독음, 번역, 해석 | 준비 중 | [#9](https://github.com/michin-jjangddol/iyeok/pull/9) |
| 風雷益 풍뢰익 | `110001` | 42 | 원문, 독음, 번역, 해석 | 준비 중 | [#2](https://github.com/michin-jjangddol/iyeok/pull/2) |
| 天風姤 천풍구 | `111110` | 44 | 원문, 독음, 번역, 해석 | 준비 중 | [#16](https://github.com/michin-jjangddol/iyeok/pull/16) |
| 澤地萃 택지췌 | `011000` | 45 | 원문, 독음, 번역, 해석 | 준비 중 | [#17](https://github.com/michin-jjangddol/iyeok/pull/17) |
| 震爲雷 중뢰진 | `001001` | 51 | 원문, 독음, 번역, 해석 | 준비 중 | [#7](https://github.com/michin-jjangddol/iyeok/pull/7) |
| 風山漸 풍산점 | `110100` | 53 | 원문, 독음, 번역, 해석 | 준비 중 | [#13](https://github.com/michin-jjangddol/iyeok/pull/13) |
| 巽爲風 중풍손 | `110110` | 57 | 원문, 독음, 번역, 해석 | 준비 중 | [#12](https://github.com/michin-jjangddol/iyeok/pull/12) |
| 雷山小過 뢰산소과 | `001100` | 62 | 원문, 독음, 번역, 해석 | 준비 중 | [#6](https://github.com/michin-jjangddol/iyeok/pull/6) |
| 나머지 49괘 | | | 준비 중 | 준비 중 | |

앱이 참조하는 목록은 `data/hexagrams/261117_0829_content-index_Laude.json`이며, 이 체크아웃에서 날짜가 가장 최신인 목록이기도 합니다. 15개 항목 모두 원문과 한국어 괘사 파일이 실제로 있고, 독음·번역·해석이 채워져 있습니다. 한국어 내용은 `draft`이며 출처에 SHANA를 표시합니다. 나머지 49괘의 괘사와 전체 효사는 준비 중입니다. GitHub에서 PR #1~#18의 머지 상태를 확인했습니다. 위 표는 머지 근거이며, 각 괘의 실제 사이트 반영을 별도로 확인했다는 뜻은 아닙니다. 해석이 갈리는 표현에는 번역 주석을 남깁니다.

## 2. 현재 개발 방향

**[결정]** 지금 있는 것을 바탕으로 발전시킵니다. **GitHub 저장소 + GitHub Pages + PWA**입니다.
앞으로 모바일 앱, 파이썬 라이브러리, 사용자 공간으로 넓힐 가능성은 염두에 두지만, 지금 미리 만들거나 전체 구조를 다시 짜지는 않습니다.

다시 쓰기 쉽도록 네 층을 나눕니다.

| 층 | 담는 것 | **[현재]** 위치 |
|---|---|---|
| 콘텐츠 | 괘사, 효사, 독음, 언어별 번역, 해석, 출처 | `data/hexagrams.json`(64괘 구조), `data/hexagrams/`(글) |
| 핵심 로직 | 괘 식별, 배열 대응, 변효 마스크, 지괘 계산, 점법 | `app/iching.js`(화면 코드 없음) |
| 사용자 화면 | 웹·PWA 표시와 조작 | `app/index.html`, `app/app.js`, `app/app.css` |
| 플랫폼 기능 | 캐시, 설치, 알림 | `app/sw.js`, `app/manifest.webmanifest` |

**[결정]** 구조는 실제로 바꿀 일이 생길 때 조금씩 개선합니다.

**[현재]** 설계와 코드의 차이:

- 괘 식별자 함수와 괘사 불러오기가 핵심 로직(`app/iching.js`)이 아니라 화면 코드(`app/app.js`)에 있습니다. 다음에 그 파일을 고칠 때 옮기면 됩니다.
- 지괘는 비트 XOR가 아니라 효마다 뒤집는 방식(`changedLines`)으로 계산합니다. 결과는 같고, `tests/iching.test.mjs`의 4,096가지 조합 테스트가 이를 확인합니다.

### 콘텐츠 파일 저장 방식 **[현재]**

```
data/hexagrams/
  YYMMDD_HHMM_content-index_Laude.json      ← 앱이 보여줄 파일 버전 목록
  111010/judgment/original/…_Laude.json     ← 원문과 출처
  111010/judgment/ko/…_Laude.json           ← 독음, 번역, 해석(한국어)
```

- `app/app.js`의 `CONTENT_INDEX`가 목록 파일 하나를 가리킵니다.
- 콘텐츠를 추가하거나 고치는 순서는 이렇습니다.
  1. 날짜가 붙은 새 파일을 저장합니다.
  2. 새 파일을 가리키는 새 목록 파일을 만듭니다.
  3. `CONTENT_INDEX`를 새 목록으로 바꿉니다.
  4. `app/sw.js`의 오프라인 목록에 새 파일을 넣고 캐시 이름을 올립니다.

  이전 파일은 그대로 둡니다.
- 효사와 다른 언어는 `judgment/` 옆에 폴더를 둡니다(예: `lines/1/ko/`, `judgment/en/`). **[미정]** 정확한 폴더 이름.
- 기존 구현에서는 실행 파일 수정 전 백업을 `backups/app/`에 두었습니다. 새 작업에는 JJDD의 현재 파일 규칙을 적용합니다. 한국시간 날짜·시간과 이번 편집자의 `_Shana` 또는 `_Laude`를 붙인 새 판을 저장하고, 이전 파일을 보존하며 이름 충돌을 확인합니다. 고정 실행 파일명을 유지해야 하는 변경에는 명시적 예외가 필요합니다. **[미정]** `backups/`를 홈피 공개 범위에 둘지.

### 구현된 표시·불러오기 동작 **[현재]**

- 샤나(GPT) 작성 노트: 출처에 `SHANA`가 있는 한국어 초안 풀이 아래에는 작성 노트를, 다른 초안에는 일반 초안 안내를 표시합니다 ([#8](https://github.com/michin-jjangddol/iyeok/pull/8)).
- `translationNote`: 번역이 있고 해당 필드가 있으면 번역 아래에 별도 주석을 표시합니다. 풀이 및 내부 `notes`와 구분합니다 ([#16](https://github.com/michin-jjangddol/iyeok/pull/16)).
- 캐시 갱신: 서비스 워커는 네트워크 우선이며, 사전 캐시 요청에 `reload`, 등록에 `updateViaCache: "none"`을 사용합니다. 기존 컨트롤러가 있었고 점을 치는 중이 아닐 때 컨트롤러 변경 후 한 번 새로고침합니다. 현재 캐시는 `iyeok-app-v19`입니다 ([#10](https://github.com/michin-jjangddol/iyeok/pull/10), 이후 캐시 버전 갱신 포함).
- 불러오기 실패와 미작성 콘텐츠를 구분합니다. 콘텐츠 JSON은 연결 오류 또는 HTTP 408/429/5xx일 때 400ms·1,200ms 대기 후 최대 세 번 시도합니다. 그 밖의 HTTP 오류는 바로 중단합니다. 목록 불러오기가 실패하면 필요할 때 다시 받을 수 있고, 성공한 콘텐츠만 저장합니다 ([#18](https://github.com/michin-jjangddol/iyeok/pull/18)). 이 재시도 함수는 최초 `data/hexagrams.json` 요청에는 적용되지 않습니다.

**[결정]** 雷로 시작하는 괘 이름을 포함하여 **'뢰' 표기를 유지**합니다. JJDD의 결정이며, 더 이상 표기 미정 사항으로 두지 않습니다.

## 3. 장기 구상 **[장기]**

방향일 뿐, 지금 만들 작업이 아닙니다.

- 괘사·효사 다국어 콘텐츠
- 개인 점괘 기록과 동기화
- 괘·효에 연결되는 댓글과 경험 공유
- 로그인과 사용자 계정
- iOS·안드로이드 앱
- 핵심 계산을 다시 쓰는 파이썬 라이브러리와 PyPI 배포

"페북 같은 아이역"은 **주역을 매개로 사람들이 경험과 해석을 나누는 공간**이라는 뜻입니다. Facebook의 기능이나 규모를 그대로 만든다는 뜻이 아닙니다. 더 자세한 그림은 [iyeok-roadmap.md](iyeok-roadmap.md) 4~6장에 있습니다.

사용자 기능을 들이기 전에는 개인정보 보호, 접근 권한, 기록 삭제, 댓글 관리, 운영 비용을 함께 검토합니다.
댓글 같은 사용자 데이터는 정적 괘사 파일과 분리합니다.

## 4. 괘 식별 규칙

**[결정]** [iyeok-code0.md](iyeok-code0.md)의 결정을 따릅니다.

- 음효 0, 양효 1
- 초효는 bit 0, 상효는 bit 5
- 이진 문자열로 쓰면 상효가 왼쪽, 초효가 오른쪽
- 고정 식별자는 `000000`~`111111`. 곤괘가 0, 건괘가 63
- 문왕괘 번호 등 배열 순서는 별도 대응표로 관리
- 지괘 = 본괘 XOR 변효 마스크
- 사용자에게 보이는 방향·기호와 내부 계산은 분리

| 효 | 초(1) | 이(2) | 삼(3) | 사(4) | 오(5) | 상(6) |
|---|---|---|---|---|---|---|
| 비트 | 0 | 1 | 2 | 3 | 4 | 5 |
| 문자열 자리(왼쪽부터) | 6번째 | 5번째 | 4번째 | 3번째 | 2번째 | 1번째 |

예시(2026-11-16 데이터로 확인): 풍뢰익 `110001`(49), 초효·이효·상효 변효 → 마스크 `100011` → `010010`, 중수감 29번.

## 5. 수동 3자 협업

**[결정]**

- **J(JJDD)**: 방향 결정, 작업 지시, 결과 확인, 샤나와 로드 사이의 내용 전달
- **샤나(Codex/GPT)**: 기획, 문구 작성, 검토 및 J가 승인한 범위의 저장소 작업
- **로드(Claude)**: 연결된 저장소에서 구현, 테스트, GitHub 작업

- 샤나와 로드 사이의 발언은 JJDD가 전달합니다. 이제 샤나는 연결된 저장소를 읽고 변경을 준비할 수 있습니다. 다만 현재 GitHub API 요청이 `Forbidden`이므로 해당 API를 통한 PR 생성·머지는 아직 검증되지 않았습니다. 서로 다른 브랜치를 쓰고 같은 파일의 동시 편집을 피합니다. 이번 작업 범위는 `docs/`의 새 문서 하나입니다.
- 상대의 발언을 전달한 것만으로는 J의 승인이 아닙니다. J가 승인한 범위 안에서는 단계마다 같은 허락을 다시 구하지 않습니다.

## 6. 변경·검증·배포 원칙

**[결정]**

- 작은 단위로 바꾸고 확인합니다.
- 콘텐츠를 추가할 때는 대상 괘, 기존 콘텐츠, "준비 중" 표시, 모바일 화면, 관련 테스트를 확인합니다.
- 커밋은 변경 기록, PR은 변경 설명과 검토 공간, 머지는 `main`에 합치는 단계입니다.
- `iyeok.org`는 GitHub Pages가 `main`에서 배포합니다. 배포 시간은 달라질 수 있으므로 배포 결과와 실제 URL을 별도로 확인합니다.
- "배포 성공"과 "실제 사이트에서 확인함"은 따로 보고합니다.
- J가 승인한 단계까지만 진행합니다. 푸시·PR·머지·배포까지 승인했으면 거기까지 하고, 검토만 요청했으면 배포하지 않습니다.
- 문제가 생기면 추가 수정이나 되돌리기를 검토합니다.
- 비밀번호, 토큰, 개인정보는 문서나 저장소에 넣지 않습니다. 저장소는 공개되어 있습니다.

## 7. 미결정 사항 **[미정]**

- 효사와 다른 언어의 폴더 이름
- `backups/`와 `docs/`를 홈피 공개 범위에 둘지
- 파이썬 라이브러리 전에 핵심 로직을 `app/iching.js`로 모두 옮길지
- 해석 문단 사이 간격 (지금은 줄바꿈만 됨)
- 괘 데이터를 받기 전에 "바로 시작"을 누르면 반응이 없는 문제 (알려진 문제, 아직 고치지 않음)

## 8. 새 세션 시작하기

저장소에 문서가 있어도 새 세션이 자동으로 읽지는 않습니다. 세션을 시작할 때 아래를 붙여 넣으세요.

```
iyeok 저장소의 docs/261117_1126_iyeok-growth-roadmap_Shana.md를 먼저 읽고 따라 줘.
main과 작업 브랜치 상태를 확인한 뒤 내 지시를 기다려 줘.
```

---

이 문서는 샤나(GPT)와 로드(Claude)의 도움을 받아 작성되었습니다.
