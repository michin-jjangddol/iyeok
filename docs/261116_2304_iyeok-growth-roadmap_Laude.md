# iYeok — How It Grows and How We Work

Written 2026-11-16 (KST). This document records the development direction and collaboration rules agreed by J (JJDD) with Shana and Laude.
It works alongside [iyeok-roadmap.md](iyeok-roadmap.md), which holds the long-term vision. This document covers the practical side: how content is added, how the code is organized, and how changes reach the site.

Each item is marked as one of:

- **[Decided]** direction set by J
- **[Now]** confirmed in the repository as of 2026-11-16
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

| Hexagram | ID | No. | Judgment | Line statements | Live on iyeok.org |
|---|---|---|---|---|---|
| 天水訟 천수송 | `111010` | 6 | Original, reading, translation, interpretation | In preparation | Yes ([#1](https://github.com/michin-jjangddol/iyeok/pull/1), merged 2026-11-16) |
| 風雷益 풍뢰익 | `110001` | 42 | Original, reading, translation, interpretation | In preparation | Yes ([#2](https://github.com/michin-jjangddol/iyeok/pull/2), merged 2026-11-16) |
| The other 62 | | | In preparation | In preparation | |

Translations and interpretations of both are drafts written by Shana and marked as drafts in the data and on screen.

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
- Backups of fixed app files changed in place go to `backups/app/`. **[Open]** whether `backups/` should stay in the published site.

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
- **Shana (GPT)**: planning, wording, design review based on what J passes on
- **Laude (Claude)**: implementation, tests, and GitHub work in the connected repository

- Shana and Laude do not talk to each other directly or share a workspace. Shana's access to this repository is not confirmed, so reviewing the latest code needs J to pass it on.
- A message passed on from the other assistant is not J's approval. Within a scope J has approved, the same permission is not asked again at every step.

## 6. Changing, checking, and publishing

**[Decided]**

- Work in small changes and check each one.
- When adding content, check: the target hexagram, existing content, "in preparation" text, the mobile screen, and the related tests.
- Commit = a record of the change. Pull request = description and review space. Merge = joining the change into `main`.
- `iyeok.org` is published from `main` by GitHub Pages. **[Now]** It goes live about 20–30 seconds after a merge.
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
Read docs/261116_2304_iyeok-growth-roadmap_Laude.md in the iyeok repository first and follow it.
Check main and the work branch, then wait for my instructions.
```

---

This document was prepared with the assistance of Shana (GPT) and Laude (Claude).

---
<br>
<br>

# 아이역 — 자라는 방식과 일하는 방식

2026-11-16(한국시간) 작성. J(JJDD)가 샤나·로드와 정한 개발 방향과 협업 원칙을 기록합니다.
장기 비전은 [iyeok-roadmap.md](iyeok-roadmap.md)에 있고, 이 문서는 실제로 일하는 방법을 다룹니다. 콘텐츠를 채우는 방식, 코드를 나누는 방식, 변경이 홈피에 반영되는 과정입니다.

각 항목에는 다음 표시를 붙였습니다.

- **[결정]** J가 정한 방향
- **[현재]** 2026-11-16 저장소에서 확인한 상태
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

| 괘 | 식별자 | 번호 | 괘사 | 효사 | iyeok.org 반영 |
|---|---|---|---|---|---|
| 天水訟 천수송 | `111010` | 6 | 원문, 독음, 번역, 해석 | 준비 중 | 반영됨 ([#1](https://github.com/michin-jjangddol/iyeok/pull/1), 2026-11-16 머지) |
| 風雷益 풍뢰익 | `110001` | 42 | 원문, 독음, 번역, 해석 | 준비 중 | 반영됨 ([#2](https://github.com/michin-jjangddol/iyeok/pull/2), 2026-11-16 머지) |
| 나머지 62괘 | | | 준비 중 | 준비 중 | |

두 괘의 번역과 해석은 샤나가 쓴 초안이며, 데이터와 화면에 초안으로 표시되어 있습니다.

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
- 고정 실행 파일을 제자리에서 고칠 때는 수정 전 원본 백업을 `backups/app/`에 둡니다. **[미정]** `backups/`를 홈피 공개 범위에 둘지.

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
- **샤나(GPT)**: 전달받은 자료를 바탕으로 기획, 문구 작성, 설계 검토
- **로드(Claude)**: 연결된 저장소에서 구현, 테스트, GitHub 작업

- 샤나와 로드는 서로 직접 대화하거나 같은 작업 환경을 쓰지 않습니다. 샤나의 저장소 접근은 확인되지 않았으므로, 최신 코드를 검토하려면 J가 자료를 전달해야 합니다.
- 상대의 발언을 전달한 것만으로는 J의 승인이 아닙니다. J가 승인한 범위 안에서는 단계마다 같은 허락을 다시 구하지 않습니다.

## 6. 변경·검증·배포 원칙

**[결정]**

- 작은 단위로 바꾸고 확인합니다.
- 콘텐츠를 추가할 때는 대상 괘, 기존 콘텐츠, "준비 중" 표시, 모바일 화면, 관련 테스트를 확인합니다.
- 커밋은 변경 기록, PR은 변경 설명과 검토 공간, 머지는 `main`에 합치는 단계입니다.
- `iyeok.org`는 GitHub Pages가 `main`에서 배포합니다. **[현재]** 머지 후 약 20~30초 뒤 반영됩니다.
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
iyeok 저장소의 docs/261116_2304_iyeok-growth-roadmap_Laude.md를 먼저 읽고 따라 줘.
main과 작업 브랜치 상태를 확인한 뒤 내 지시를 기다려 줘.
```

---

이 문서는 샤나(GPT)와 로드(Claude)의 도움을 받아 작성되었습니다.
