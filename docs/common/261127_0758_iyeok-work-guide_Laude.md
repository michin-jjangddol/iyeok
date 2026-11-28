# iYeok — Shared Work Guide

Updated 2026-11-27 07:58 KST. Editor: LAUDE (Claude). This version copies SHANA's 2026-11-17 12:06 guide (`docs/common/261117_1206_iyeok-work-guide_Shana.md`) unchanged and adds section 8 on public names. Sections 1–7 keep SHANA's original wording and snapshot; their original header follows. Original header: Updated 2026-11-17 12:06 KST. Editor: SHANA (Codex/GPT). Repository snapshot: `4abc4fcb57a61bfee338c93380ed42918401a66d`. This shared guide records JJDD's decisions and the current implementation; it does not authorize a new task by itself. Earlier documents and the unmerged growth-roadmap branch are preserved. State below is a dated snapshot, not a permanent count.

## 1. People, decisions, and messages

- **[JJDD decision]** JJDD sets direction, authorizes scope, and carries messages between assistants. SHANA and LAUDE can each write, implement, test, and perform GitHub work within that scope. Avoid simultaneous repository work; finish the handoff before the next person starts.
- **[JJDD decision]** Wrap conversational messages in both opening and closing tags: `@@SHANA@@` / `@@/SHANA@@`, `@@LAUDE@@` / `@@/LAUDE@@`, or `@@JJDD@@` / `@@/JJDD@@`. Untagged user messages are JJDD's. Do not add these tags to artifact contents unless requested.
- **[JJDD decision]** Attribute forwarded statements to their speaker. An assistant's proposal, prompt, or question is not JJDD's approval. A self-written prompt also requires JJDD's execution instruction. Do not start work merely because references or rules were shared.
- **[JJDD decision]** Once JJDD authorizes a task, carry it through the authorized steps without asking the same permission at each step. Do not expand beyond scope. Merge only when authorized conditions hold.
- **[SHANA proposal; adopted by JJDD]** Use a common prompt independent of who wrote it; use the actual editor/translator's identity in files and content metadata.
- **[LAUDE proposal; adopted by JJDD]** Keep common documents together in `docs/common/`; use the existing dated editor suffix to show who made each version.

## 2. Files and versions

**[JJDD decision]** Use `docs/common/YYMMDD_HHMM_subject_Shana.md` or `_Laude.md` for shared documents. Use Asia/Seoul time, without seconds. Save each edited version as a new file; keep earlier filenames and contents intact. Replace any old date/editor suffix rather than stacking them. Check collisions before saving; use `_v02`, `_v03` before the editor suffix when necessary. JJDD may omit the editor suffix. Do not rename existing files retroactively or infer that every unmarked legacy file was written by JJDD.

Unchanged copies preserve their original authorship; a copy alone does not make the copier an author. Record actual saved paths in the completion report.

**[JJDD-approved workflow exception]** When the task explicitly includes the existing fixed runtime-file procedure, edit `app/app.js` and `app/sw.js` in place only after preserving exact originals as `backups/app/YYMMDD_HHMM_app.js` and `..._sw.js`. These are unchanged copies, so do not add the copier's suffix. Check backup collisions and byte equality. This exception does not authorize unrelated fixed-file edits. Other new content and indexes retain dates and the current editor suffix.

## 3. Start, validate, merge, hand off

**[JJDD decision]** Latest main → isolated work branch → scoped changes and validation → push and PR → conditional merge → deployment and live checks → next person. Avoid simultaneous work. If main changes before merging, incorporate it and revalidate affected behavior. Never reset away local work.

**[SHANA practice]** In the existing checkout, inspect status and instructions; fetch `origin main`, then create a new branch from `origin/main`. Do not mix in `shana/update-growth-roadmap-20261117`. Each cloud task is isolated already; do not create a Git worktree unless JJDD requests it.

**[LAUDE practice]** LAUDE may reuse its work branch, fetching and merging latest main first. Verify that no stale, unmerged changes are carried into the new PR; reusing a branch is not permission to reset or discard work.

Validate the actual final PR file list, conflict state, and checks. Wait for running checks; distinguish no registered checks from passed checks. Report confirmed blockers without guessing their cause. CLI permission settings such as `.claude/settings.json` are separate from JJDD's authorization to merge a PR and do not configure SHANA.

Report deployment success separately from checking the public site. Do not promise a fixed deployment duration. Never put credentials, private information, or credential values into public files.

## 4. Adding a judgment

**[Current implementation]**

1. Read `data/hexagrams.json`; derive the six-bit ID by reversing `lines` (bottom to top). Bottom line is bit 0, rightmost character. Yin = 0, yang = 1; preserve leading zeros. Decimal ID and King Wen number are different. XOR with the changing-line mask and verify the resulting hexagram.
2. Read `app/app.js`'s **active `CONTENT_INDEX`**, regardless of `_Shana` or `_Laude`. Create a new dated index by extending that exact index; preserve every existing entry. A filename chosen only by author or timestamp can drop prior content.
3. Follow existing judgment schemas under `data/hexagrams/<id>/judgment/original/` and `/ko/`. Keep original text, reading, translation, interpretation, sources, and internal notes separate. Use `status: "draft"` for unreviewed translations/interpretations.
4. Put the actual writer in `sources.translation` and `sources.interpretation`. **Current rendering:** a Korean draft with `SHANA` in any source value receives the Shana authorship note; other drafts receive a generic draft notice. Do not misattribute LAUDE text to trigger SHANA's notice. This UI rule is implementation, not an authorship policy.
5. `translationNote` is a string shown below a nonempty translation; internal `notes` are not shown there. Use it when historical language or a translation choice needs a short visible explanation.
6. With the fixed-file exception authorized, back up originals, change only `CONTENT_INDEX`, increment the current `sw.js` cache version once, replace the index path, and add the two new judgment paths to `FILES`. Preserve cache-update and retry behavior.
7. Run `node tests/iching.test.mjs` (currently 9 checks), parse new JSON, verify identity/paths, preserve previous entries, and check backups. In a browser, exercise requested changing lines, the no-change case, text order, authorship notice, pending content, mobile layout, and page errors. Distinguish executed from unexecuted checks.
8. Use only photographs actually available to the executor for photo comparison. Record punctuation/readings and disagreements accurately. If no photograph or reference edition was checked, say so in metadata and the report. Do not copy a book's translation or commentary. Do not claim a traditional interpretation was independently verified when it was not.

## 5. Reusable judgment prompt

Replace the bracketed fields. The approval line must come from JJDD; this template is not standing approval.

```text
Add only the judgment for [hexagram name / Chinese title / King Wen number].
JJDD inputs: original [text], reading [text], changing lines [positions or none].
Expected identity: [six-bit ID], [decimal], [upper/lower trigrams], [line array].
Expected changed hexagram: [ID, title, number]. Verify all of this from data.

Wait for the other person's current task to finish. Inspect instructions and local changes.
Fetch latest main and use a clean task branch based on it (or a verified existing branch).
Do not include unrelated pending work. Read the active CONTENT_INDEX and cache version.
Write your own close translation and two modern interpretation paragraphs; attribute the
actual writer, mark draft, and state exactly which photo/edition was or was not checked.
Do not add line statements or the changed hexagram's judgment unless separately requested.

Scope: two dated judgment JSON files, one new dated index preserving all existing entries,
two exact original backups, and only the CONTENT_INDEX line plus sw.js cache/index/new paths.
JJDD permits those two fixed runtime files to be edited in place after backups for this task.
Use KST dates, actual editor suffix, collision checks and preserved prior versions.

Validate JSON, ID/XOR, previous entries, backup equality, all existing logic tests, and browser
behavior (changing/no-change, text/notice/source, pending state, mobile and page errors).
Commit, push, and create a PR explaining scope, evidence, and limitations.
Merge only if JJDD authorizes it, the final file list stays in scope, there are no conflicts,
and checks have no failures; wait for running checks. Say explicitly if none are registered.
Verify deployment and the live cache/content/UI separately; report commit, PR, merge,
checks not run, limitations, and full paths. If blocked, report verified cause and next step.

JJDD approval: [JJDD supplies authorized steps and merge conditions here].
```

## 6. Confirmed state at this snapshot

**[Current]** Active index: `data/hexagrams/261117_1148_content-index_Laude.json`. **17 judgments**, 47 still in preparation; line statements are not yet indexed. Cache: `iyeok-app-v21`. Entries below have original and Korean judgment files. This is repository verification, not a claim that every screen was rechecked in this documentation task.

| No. | Hexagram | Fixed ID |
|---|---|---|
| 1 | 乾爲天 중천건 | `111111` |
| 2 | 坤爲地 중지곤 | `000000` |
| 3 | 水雷屯 수뢰준 | `010001` |
| 6 | 天水訟 천수송 | `111010` |
| 11 | 地天泰 지천태 | `000111` |
| 16 | 雷地豫 뢰지예 | `001000` |
| 17 | 澤雷隨 택뢰수 | `011001` |
| 20 | 風地觀 풍지관 | `110000` |
| 33 | 天山遯 천산둔 | `111100` |
| 35 | 火地晉 화지진 | `101000` |
| 42 | 風雷益 풍뢰익 | `110001` |
| 44 | 天風姤 천풍구 | `111110` |
| 45 | 澤地萃 택지췌 | `011000` |
| 51 | 震爲雷 중뢰진 | `001001` |
| 53 | 風山漸 풍산점 | `110100` |
| 57 | 巽爲風 중풍손 | `110110` |
| 62 | 雷山小過 뢰산소과 | `001100` |

**[JJDD decision]** Keep **뢰** in Korean hexagram names; do not silently normalize it to 뇌.

**[Current, GitHub verified]** PRs [#1](https://github.com/michin-jjangddol/iyeok/pull/1) through [#21](https://github.com/michin-jjangddol/iyeok/pull/21) are merged. #19 added Tai (SHANA draft), #20 changed LAUDE's command permissions, and #21 added Guan (LAUDE draft). Earlier feature changes include #8 authorship notices, #10 cache refresh, #16 translationNote, and #18 content-load retry. This new document's own PR is not included in that historical range.

## 7. Open work, not authorization to change it

- **[Open]** Unify 利 readings (리/이), with JJDD's decision and reference evidence. Kun currently retains 리 while other phrase-initial uses may say 이; do not silently alter existing readings.
- **[Open]** Decide whether Jian (풍산점) and Kun (중지곤) need visible `translationNote`. Their existing internal `notes` discuss historical marriage/gender context and interpretive choices; neither current Korean file has `translationNote`. Do not claim those internal notes are already visible translation annotations.
- **[Open]** Compare originals/readings/translations with identified editions; resolve variants and punctuation with evidence. Existing drafts do not establish that review is complete.
- **[Open]** Decide whether `backups/` and `docs/` should remain publicly served. Current static publication can expose their files.

## 8. Public names and Git identity

- **[JJDD decision, 2026-11-27]** Never publish JJDD's legal name. In public, use **JJDD** or the GitHub handle **michin-jjangddol**. Do not write the legal name anywhere, not even as an example of what to hide.
- Scope: documents, code comments, file names, commit author and committer (name and email), PR titles, bodies, comments and merge records, public logs, screenshots, and work reports.
- Names: **LAUDE** for Claude's work, **SHANA** for GPT's work, **JJDD** or **michin-jjangddol** for JJDD.
- Email: use only a public address that has been confirmed, such as the GitHub noreply address shown in the account's email settings or the assistant tool's own published noreply address. Never invent an address.
- Before committing, check the effective `git config user.name` and `git config user.email`. If either shows a legal name or a personal address, do not commit. Fix it with the repository's local setting (`git config --local …`); do not change global settings that affect other repositories.
- After committing, check the actual author and committer, for example with `git log -1 --format='%an <%ae> / %cn <%ce>'`.
- Merges made on the GitHub website or through the API use the GitHub account's profile name and email, not local Git settings. Check the author of a merge commit. If it shows a legal name or personal address, stop publishing further merges that way and report the cause and the needed change to JJDD first.
- Rewriting history, force-pushing, or changing the GitHub profile require JJDD's separate, explicit decision.

---

# 아이역 — 공동 작업 안내서

2026-11-27 07:58(한국시간), 이번 편집자 LAUDE(Claude). 이 판은 SHANA의 2026-11-17 12:06 안내서(`docs/common/261117_1206_iyeok-work-guide_Shana.md`)를 그대로 옮기고 8절 '공개 이름'을 더했습니다. 1~7절은 SHANA의 원래 문장과 그 시점 현황입니다. 원래 머리말: 2026-11-17 12:06(한국시간), 이번 편집자 SHANA(Codex/GPT). 기준 커밋 `4abc4fcb57a61bfee338c93380ed42918401a66d`. JJDD의 결정과 현재 구현을 기록한 공통 안내서이며, 이 문서 자체가 새 작업 승인은 아닙니다. 이전 문서와 미머지 성장 방향 문서 브랜치는 보존합니다. 아래 현황은 작성 시점의 기록입니다.

## 1. 참여자·결정·발언

- **[JJDD 결정]** JJDD는 방향·작업 범위를 정하고 두 작업자 사이의 발언을 전달합니다. 샤나와 로드는 각각 승인 범위 안에서 작성·구현·검증·GitHub 작업을 할 수 있습니다. 동시 작업을 피하고 한 작업의 인계가 끝난 뒤 다음 사람이 시작합니다.
- **[JJDD 결정]** 대화에는 `@@SHANA@@` / `@@/SHANA@@`, `@@LAUDE@@` / `@@/LAUDE@@`, `@@JJDD@@` / `@@/JJDD@@` 시작·종료 태그를 씁니다. 태그 없는 사용자 메시지는 JJDD 발언입니다. 결과물 본문에는 요청한 경우에만 태그를 넣습니다.
- **[JJDD 결정]** 전달문은 원 발언자를 구분합니다. 상대의 제안·프롬프트·질문은 JJDD 승인이 아니며, 자신이 만든 프롬프트도 실행 지시가 필요합니다. 참고자료나 규칙이 공유됐다는 이유만으로 실무 작업을 시작하지 않습니다.
- **[JJDD 결정]** 승인된 작업은 단계마다 같은 허락을 다시 묻지 않고 끝까지 진행합니다. 범위를 넓히지 않으며, PR 머지는 승인된 조건을 만족할 때만 합니다.
- **[SHANA 제안·JJDD 채택]** 프롬프트 작성자와 실행자가 달라도 공통으로 사용하되 실제 편집자·번역자를 파일과 출처에 표시합니다.
- **[LAUDE 제안·JJDD 채택]** 공통 문서는 `docs/common/`에 모으고 파일명 끝에는 이번 판 편집자 한 명만 표시합니다.

## 2. 파일과 버전

**[JJDD 결정]** 공동 문서는 `docs/common/YYMMDD_HHMM_문서명_Shana.md` 또는 `_Laude.md`로 저장합니다. 한국시간(Asia/Seoul), 초 없는 날짜·시간을 사용합니다. 수정판은 새 파일로 만들고 이전 이름과 내용은 보존합니다. 기존 날짜·편집자를 교체하며 중복해서 붙이지 않습니다. 충돌하면 편집자 앞에 `_v02`, `_v03`을 넣습니다. JJDD는 필요할 때만 작성자를 표시합니다. 기존 파일을 소급해 개명하거나 무표시 파일을 모두 JJDD 작성이라고 단정하지 않습니다.

내용이 같은 단순 복사본에는 복사자의 작성자 표시를 새로 붙이지 않습니다. 완료 보고에는 실제 저장한 전체 경로를 적습니다.

**[JJDD 승인 작업 방식의 예외]** 해당 작업에 기존 고정 실행 파일 절차가 명시적으로 포함된 경우, `app/app.js`, `app/sw.js`만 원본을 먼저 `backups/app/YYMMDD_HHMM_app.js`, `..._sw.js`에 보존한 뒤 제자리 수정합니다. 백업은 단순 복사이므로 복사자 접미사를 붙이지 않습니다. 이름 충돌과 바이트 일치를 확인합니다. 이 예외로 다른 고정 파일 수정까지 허용되지는 않습니다. 새 콘텐츠와 목록에는 날짜와 이번 편집자 표시를 붙입니다.

## 3. 시작·검증·머지·교대

**[JJDD 결정]** 최신 main → 작업 브랜치 → 범위 안 변경·검증 → 푸시·PR → 조건부 머지 → 배포·실사이트 확인 → 다음 사람 순서입니다. 동시 작업을 피하고, 머지 전 main이 바뀌었다면 반영 후 관련 검증을 다시 합니다. 로컬 작업을 reset으로 버리지 않습니다.

**[SHANA 방식]** 기존 체크아웃의 상태와 지침을 읽고 `origin main`을 fetch한 뒤 `origin/main`에서 새 브랜치를 만듭니다. `shana/update-growth-roadmap-20261117`의 미머지 작업을 섞지 않습니다. 클라우드 작업은 이미 격리되어 있으므로 JJDD가 요청하지 않으면 Git worktree를 만들지 않습니다.

**[LAUDE 방식]** 작업 브랜치를 재사용할 수 있으나 시작 전에 최신 main을 fetch·merge하고, 새 PR에 이전 미머지 변경이 섞이지 않는지 확인합니다. 브랜치 재사용이 작업 삭제나 reset 허가는 아닙니다.

최종 PR의 파일 목록·충돌·검사를 확인합니다. 실행 중 검사는 기다리고, 등록된 검사 없음과 검사 통과는 구분합니다. 막힌 원인은 확인된 것만 보고합니다. `.claude/settings.json` 같은 명령 승인 설정은 JJDD의 PR 머지 승인과 별개이며 샤나 설정이 아닙니다.

배포 성공과 공개 사이트 확인을 나눠 보고하고 고정 배포 시간을 약속하지 않습니다. 비밀번호·토큰·개인정보를 공개 파일에 넣지 않습니다.

## 4. 괘사 추가 방법

**[현재 구현]**

1. `data/hexagrams.json`의 `lines`는 아래→위입니다. 뒤집어 6비트 문자열을 만들며 초효는 bit 0·오른쪽 끝입니다. 음 0·양 1, 앞자리 0 유지. 십진 식별자와 문왕 번호를 구분합니다. 변효 마스크 XOR와 지괘도 검산합니다.
2. 파일명의 작성자나 날짜만으로 고르지 말고 **`app/app.js`의 현재 `CONTENT_INDEX`**를 읽습니다. 그 목록의 모든 항목을 유지한 새 날짜 목록에 추가합니다.
3. `data/hexagrams/<id>/judgment/original/`, `/ko/`의 기존 스키마를 따릅니다. 원문·독음·번역·풀이·출처·내부 메모를 구분하고 검토 전 번역·풀이는 `status: "draft"`로 둡니다.
4. `sources.translation`, `sources.interpretation`에 실제 작성자를 적습니다. **현재 화면 동작:** 한국어 초안의 출처 값 중 `SHANA`가 있으면 샤나 작성 노트, 그 밖에는 일반 초안 안내가 나옵니다. 로드 글을 샤나로 잘못 표시하지 않습니다. 이는 현재 구현이며 저자 표시 원칙 자체는 아닙니다.
5. `translationNote`는 번역이 있을 때 번역 아래 표시하는 문자열입니다. 내부 `notes`와 구분하고 필요한 맥락·번역 선택을 짧게 설명합니다.
6. 고정 실행 파일 예외가 승인된 경우 원본 백업 후 `CONTENT_INDEX`만 바꾸고, `sw.js` 현재 캐시를 한 단계 올리며 목록 경로 교체·새 괘사 두 파일 추가만 합니다. 갱신·재시도 로직은 유지합니다.
7. `node tests/iching.test.mjs`(현재 9개), 새 JSON·식별자·경로·기존 항목 보존·백업을 검사합니다. 브라우저에서 요청 변효와 무변효, 본문 순서, 작성 안내, 준비 중, 모바일, 페이지 오류를 확인합니다. 실행하지 못한 검사는 따로 적습니다.
8. 실제 전달받은 사진만 대조 근거로 삼습니다. 구두점·독음·해석 차이를 정확히 기록하며, 사진이나 판본을 확인하지 않았다면 데이터와 보고에 밝힙니다. 책 번역·해설은 옮기지 않고, 전통적 해석을 독립 검증했다고 과장하지 않습니다.

## 5. 공통 괘사 추가 프롬프트 틀

대괄호를 채우고 마지막 승인 줄은 JJDD가 직접 지시합니다. 이 틀 자체는 상시 승인이 아닙니다.

```text
[괘명 / 한자 / 문왕 번호]의 괘사만 추가해 줘.
JJDD 제공 원문 [내용], 독음 [내용], 변효 [위치 또는 없음].
예상 식별자 [6비트/십진], 상·하괘 [내용], 효 배열 [내용], 지괘 [ID/괘명/번호].
실제 데이터로 모두 검산해 줘.

다른 작업자가 마친 뒤 시작하고, 지침·로컬 변경을 확인해 줘.
최신 main을 fetch하고 거기서 작업 브랜치를 만들거나 기존 브랜치 상태를 검증해 줘.
다른 미완료 작업은 섞지 말고 현재 CONTENT_INDEX와 캐시를 확인해 줘.
번역과 현대적 풀이 두 문단은 직접 쓰고 실제 작성자·draft를 표시해 줘.
사진·문헌의 실제 대조 범위를 밝히고, 별도 요청 없는 효사·지괘 괘사는 추가하지 마.

범위는 날짜 붙은 괘사 JSON 2개, 기존 항목을 보존한 새 목록 1개,
원본 그대로의 백업 2개, app/app.js의 CONTENT_INDEX와 sw.js의 캐시·목록·새 경로뿐이야.
이번 작업에서는 백업 후 두 고정 실행 파일의 제자리 수정을 허용해.
한국시간·실제 편집자·충돌 확인·이전 판 보존 규칙을 지켜 줘.

JSON·식별자/XOR·기존 항목·백업·기존 테스트·브라우저를 검증해 줘.
변효/무변효, 본문·안내·출처, 준비 중, 모바일·오류도 확인해 줘.
커밋·푸시·PR에 범위와 검증·제한을 적어 줘.
JJDD가 승인했고 범위·무충돌·실패 없음 조건을 만족할 때만 머지해 줘.
실행 중 검사는 기다리고 등록 검사가 없으면 없다고 밝혀 줘.
배포와 공개 캐시·콘텐츠·화면 확인을 구분하고 커밋·PR·머지·미실행 검사·전체 경로를 보고해 줘.
막히면 확인된 원인과 필요한 다음 단계만 보고해 줘.

JJDD 승인: [JJDD가 승인 단계와 머지 조건을 적음].
```

## 6. 작성 시점 현황

**[현재]** 활성 목록 `data/hexagrams/261117_1148_content-index_Laude.json`, **17괘 괘사**, 나머지 47괘는 준비 중이며 효사는 아직 목록에 없습니다. 캐시는 `iyeok-app-v21`입니다. 아래 괘는 원문·한국어 괘사 파일을 확인했습니다. 이번 문서 작업에서 모든 화면을 재검사했다는 뜻은 아닙니다.

| 번호 | 괘명 | 고정 식별자 |
|---|---|---|
| 1 | 乾爲天 중천건 | `111111` |
| 2 | 坤爲地 중지곤 | `000000` |
| 3 | 水雷屯 수뢰준 | `010001` |
| 6 | 天水訟 천수송 | `111010` |
| 11 | 地天泰 지천태 | `000111` |
| 16 | 雷地豫 뢰지예 | `001000` |
| 17 | 澤雷隨 택뢰수 | `011001` |
| 20 | 風地觀 풍지관 | `110000` |
| 33 | 天山遯 천산둔 | `111100` |
| 35 | 火地晉 화지진 | `101000` |
| 42 | 風雷益 풍뢰익 | `110001` |
| 44 | 天風姤 천풍구 | `111110` |
| 45 | 澤地萃 택지췌 | `011000` |
| 51 | 震爲雷 중뢰진 | `001001` |
| 53 | 風山漸 풍산점 | `110100` |
| 57 | 巽爲風 중풍손 | `110110` |
| 62 | 雷山小過 뢰산소과 | `001100` |

**[JJDD 결정]** 한글 괘명의 **뢰 표기 유지**. 임의로 뇌로 바꾸지 않습니다.

**[현재·GitHub 확인]** PR [#1](https://github.com/michin-jjangddol/iyeok/pull/1)~[#21](https://github.com/michin-jjangddol/iyeok/pull/21)이 머지됐습니다. #19는 태괘(샤나 초안), #20은 로드 명령 승인 설정, #21은 관괘(로드 초안)입니다. 주요 구현은 #8 작성 노트, #10 캐시 갱신, #16 translationNote, #18 재시도입니다. 이 문서 자체의 PR은 이 과거 범위에 포함하지 않습니다.

## 7. 미결정 사항 — 변경 승인이 아님

- **[미정]** 利 독음 리/이 통일: JJDD 결정과 문헌 근거가 필요합니다. 곤괘는 리, 다른 괘의 문장 첫머리에서는 이를 쓰는 경우가 있습니다. 기존 독음을 임의 변경하지 않습니다.
- **[미정]** 풍산점·중지곤의 화면용 `translationNote`: 현재 두 파일 모두 이 필드는 없고, 혼인·성별 맥락과 해석 선택은 내부 `notes`에 있습니다. 이미 화면 주석으로 나온다고 적지 않습니다.
- **[미정]** 특정 판본을 정한 원문·독음·번역 대조와 이문·구두점 검토. 기존 초안이 검토 완료를 뜻하지 않습니다.
- **[미정]** `backups/`, `docs/`를 공개 사이트 범위에 계속 둘지. 현재 정적 배포에서는 해당 파일이 공개될 수 있습니다.

## 8. 공개 이름과 Git 작성자

- **[JJDD 결정, 2026-11-27]** JJDD의 본명은 공개하지 않습니다. 공개용 이름은 **JJDD** 또는 GitHub 닉네임 **michin-jjangddol**입니다. 숨기려는 본명을 예시로도 적지 않습니다.
- 적용 범위: 문서·코드 주석·파일명, 커밋의 author·committer(이름·이메일), PR 제목·본문·댓글·머지 기록, 공개 로그·스크린샷·작업 보고.
- 이름 표시: 로드 작업은 **LAUDE**, 샤나 작업은 **SHANA**, JJDD는 **JJDD** 또는 **michin-jjangddol**.
- 이메일: GitHub 계정 이메일 설정에 표시된 noreply 주소나 작업 도구가 공개한 noreply 주소처럼 **확인된 공개용 주소**만 씁니다. 주소를 추측해서 만들지 않습니다.
- 커밋 전: 실제로 적용되는 `git config user.name`, `git config user.email`을 확인합니다. 본명이나 개인 이메일이 보이면 커밋하지 않고, 저장소 로컬 설정(`git config --local …`)으로 고칩니다. 다른 저장소에 영향을 주는 전역 설정은 임의로 바꾸지 않습니다.
- 커밋 후: 실제 author·committer를 확인합니다(예: `git log -1 --format='%an <%ae> / %cn <%ce>'`).
- GitHub 웹이나 API로 한 머지는 로컬 Git 설정이 아니라 **GitHub 계정의 프로필 이름·이메일**로 기록됩니다. 머지 커밋의 작성자를 확인하고, 본명이나 개인 이메일이 보이면 그 방식의 머지를 더 공개하기 전에 원인과 필요한 조치를 JJDD에게 먼저 알립니다.
- 과거 기록 재작성·강제 푸시·GitHub 프로필 변경은 JJDD의 별도 명시 결정이 있어야 합니다.
