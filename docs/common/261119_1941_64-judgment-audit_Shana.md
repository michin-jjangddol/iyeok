# 64 judgment drafts — structural audit / 64괘 괘사 구조 점검

Editor: SHANA. Audit snapshot: 2026-11-19 19:39 KST; base main `6bd5176`.
Active index: `data/hexagrams/261119_1939_content-index_Shana.json`. Cache: `iyeok-app-v69`.

## English

**All 64 hexagram judgment drafts are included.** This confirms structure and completeness, not scholarly review or translation accuracy. Publication is verified separately after merge; this document describes the reviewed content snapshot.

- Exactly 64 unique six-bit IDs (000000–111111) and King Wen numbers 1–64; all agree with `data/hexagrams.json` (bottom line is bit 0). Duplicate JSON object keys were rejected during parsing.
- All 128 active original/Korean JSON files exist and parse. Every entry has nonempty original text, reading, translation, interpretation, draft status, and translation/interpretation source metadata.
- Previous 63 index entries and all their active content bytes are unchanged. All 27 translation notes are retained. Existing 뢰 spelling is unchanged.
- The active index and all 128 content paths are present in the service-worker offline list. Runtime code changes only the index path, cache version, and the two new content paths; retry/update logic is unchanged.
- Current UI rule: a draft with SHANA anywhere in sources gets the SHANA note. This yields 63 SHANA notices and one generic notice (觀). This checks rendering conditions, not independent verification of historical authorship.
- New 節 text/reading and translation/interpretation follow JJDD's supplied SHANA prompt. The executing session received the other SHANA session's photo reading, not the photo. Edition/title/page are unknown; no separate literature comparison was performed.
- Validation: 9 existing tests, service-worker syntax, backups equal base originals, identity/path checks; Chromium 390px/1280px, Jie alone, Jie initial-line change → Kan, Kan initial-line change → Jie, Guan generic note; content order, overflow, page errors, local v68→v69 update and offline display after storage completes.
- Failure/retry behavior is checked with a browser-only simulated 503; no test hooks are included in application files. Actual Safari/VoiceOver is not tested. Live deployment and public-site results are reported after merge.
- Remaining work: line statements, other languages, full literature/translation review, edition identification and the previously deferred editorial consistency review. No missing judgments or structural blockers were found.

## 한국어

**64괘 괘사 초안 수록 완료.** 식별자·번호·파일과 필수 내용의 구조 및 누락 점검 결과이며, 64괘 전체의 문헌 대조나 번역 정확성 검증 완료를 뜻하지 않습니다. GitHub 머지·배포·실제 사이트 확인은 이 스냅샷 점검과 별도로 완료 보고합니다.

- 64개 식별자와 문왕괘 번호가 중복·누락 없이 대응합니다. 원문·한국어 파일 128개와 원문·독음·번역·풀이·작성 정보가 모두 있습니다.
- 기존 63괘 항목과 파일 내용은 그대로이며 번역 주석 27개 및 ‘뢰’ 표기를 보존했습니다. 활성 목록과 128개 콘텐츠 경로가 오프라인 목록에 포함됩니다.
- 현재 화면 조건상 SHANA 안내 63개, 일반 초안 안내 1개(풍지관)입니다. 이는 sources에 SHANA가 포함되는지에 따른 표시 조건 점검이며 과거 작성자의 독립적인 재검증은 아닙니다.
- 수택절 사진은 실행 세션에 없었습니다. 다른 SHANA 세션이 판독한 내용과 작성 초안을 전달받아 사용했으며, 판본·서명·쪽수 확인 및 별도 문헌 대조는 하지 않았습니다.
- 효사·다국어·문헌 및 번역 검증·보류된 표기와 주석 정리는 별도 과제입니다. 이번 구조 점검에서 누락이나 머지를 막는 문제는 발견하지 못했습니다.

## Inventory / 전체 목록

Paths below are relative to `data/hexagrams/`. Notice means the current draft-note branch, not an authorship audit.

| King Wen | ID | 괘 | Original | Korean | Notice |
|---|---|---|---|---|---|
| 1 | `111111` | 중천건 | `111111/judgment/original/261116_2344_judgment_Laude.json` | `111111/judgment/ko/261116_2344_judgment_Laude.json` | SHANA |
| 2 | `000000` | 중지곤 | `000000/judgment/original/261117_0808_judgment_Laude.json` | `000000/judgment/ko/261117_0808_judgment_Laude.json` | SHANA |
| 3 | `010001` | 수뢰준 | `010001/judgment/original/261116_2336_judgment_Laude.json` | `010001/judgment/ko/261116_2336_judgment_Laude.json` | SHANA |
| 4 | `100010` | 산수몽 | `100010/judgment/original/261118_2022_judgment_Shana.json` | `100010/judgment/ko/261118_2022_judgment_Shana.json` | SHANA |
| 5 | `010111` | 수천수 | `010111/judgment/original/261119_1217_judgment_Shana.json` | `010111/judgment/ko/261119_1217_judgment_Shana.json` | SHANA |
| 6 | `111010` | 천수송 | `111010/judgment/original/261116_2223_judgment_Laude.json` | `111010/judgment/ko/261116_2223_judgment_Laude.json` | SHANA |
| 7 | `000010` | 지수사 | `000010/judgment/original/261119_0811_judgment_Shana.json` | `000010/judgment/ko/261119_0811_judgment_Shana.json` | SHANA |
| 8 | `010000` | 수지비 | `010000/judgment/original/261118_2244_judgment_Laude.json` | `010000/judgment/ko/261118_2244_judgment_Laude.json` | SHANA |
| 9 | `110111` | 풍천소축 | `110111/judgment/original/261117_1932_judgment_Laude.json` | `110111/judgment/ko/261117_1932_judgment_Laude.json` | SHANA |
| 10 | `111011` | 천택리 | `111011/judgment/original/261119_1224_judgment_Laude.json` | `111011/judgment/ko/261119_1224_judgment_Laude.json` | SHANA |
| 11 | `000111` | 지천태 | `000111/judgment/original/261117_1138_judgment_Shana.json` | `000111/judgment/ko/261117_1138_judgment_Shana.json` | SHANA |
| 12 | `111000` | 천지비 | `111000/judgment/original/261118_2035_judgment_Laude.json` | `111000/judgment/ko/261118_2035_judgment_Laude.json` | SHANA |
| 13 | `111101` | 천화동인 | `111101/judgment/original/261118_2231_judgment_Shana.json` | `111101/judgment/ko/261118_2231_judgment_Shana.json` | SHANA |
| 14 | `101111` | 화천대유 | `101111/judgment/original/261117_2206_judgment_Laude.json` | `101111/judgment/ko/261117_2206_judgment_Laude.json` | SHANA |
| 15 | `000100` | 지산겸 | `000100/judgment/original/261119_1236_judgment_Shana.json` | `000100/judgment/ko/261119_1236_judgment_Shana.json` | SHANA |
| 16 | `001000` | 뢰지예 | `001000/judgment/original/261117_0759_judgment_Laude.json` | `001000/judgment/ko/261117_0759_judgment_Laude.json` | SHANA |
| 17 | `011001` | 택뢰수 | `011001/judgment/original/261117_0733_judgment_Laude.json` | `011001/judgment/ko/261117_0733_judgment_Laude.json` | SHANA |
| 18 | `100110` | 산풍고 | `100110/judgment/original/261117_2052_judgment_Shana.json` | `100110/judgment/ko/261117_2052_judgment_Shana.json` | SHANA |
| 19 | `000011` | 지택림 | `000011/judgment/original/261117_2223_judgment_Shana.json` | `000011/judgment/ko/261117_2223_judgment_Shana.json` | SHANA |
| 20 | `110000` | 풍지관 | `110000/judgment/original/261117_1148_judgment_Laude.json` | `110000/judgment/ko/261117_1148_judgment_Laude.json` | generic |
| 21 | `101001` | 화뢰서합 | `101001/judgment/original/261119_1316_judgment_Laude.json` | `101001/judgment/ko/261119_1316_judgment_Laude.json` | SHANA |
| 22 | `100101` | 산화비 | `100101/judgment/original/261119_0707_judgment_Shana.json` | `100101/judgment/ko/261119_0707_judgment_Shana.json` | SHANA |
| 23 | `100000` | 산지박 | `100000/judgment/original/261117_2158_judgment_Shana.json` | `100000/judgment/ko/261117_2158_judgment_Shana.json` | SHANA |
| 24 | `000001` | 지뢰복 | `000001/judgment/original/261119_0717_judgment_Laude.json` | `000001/judgment/ko/261119_0717_judgment_Laude.json` | SHANA |
| 25 | `111001` | 천뢰무망 | `111001/judgment/original/261118_1921_judgment_Shana.json` | `111001/judgment/ko/261118_1921_judgment_Shana.json` | SHANA |
| 26 | `100111` | 산천대축 | `100111/judgment/original/261119_1900_judgment_Shana.json` | `100111/judgment/ko/261119_1900_judgment_Shana.json` | SHANA |
| 27 | `100001` | 산뢰이 | `100001/judgment/original/261117_2232_judgment_Laude.json` | `100001/judgment/ko/261117_2232_judgment_Laude.json` | SHANA |
| 28 | `011110` | 택풍대과 | `011110/judgment/original/261118_1947_judgment_Shana.json` | `011110/judgment/ko/261118_1947_judgment_Shana.json` | SHANA |
| 29 | `010010` | 중수감 | `010010/judgment/original/261119_1154_judgment_Laude.json` | `010010/judgment/ko/261119_1154_judgment_Laude.json` | SHANA |
| 30 | `101101` | 중화리 | `101101/judgment/original/261118_2217_judgment_Laude.json` | `101101/judgment/ko/261118_2217_judgment_Laude.json` | SHANA |
| 31 | `011100` | 택산함 | `011100/judgment/original/261117_2304_judgment_Shana.json` | `011100/judgment/ko/261117_2304_judgment_Shana.json` | SHANA |
| 32 | `001110` | 뢰풍항 | `001110/judgment/original/261117_2014_judgment_Laude.json` | `001110/judgment/ko/261117_2014_judgment_Laude.json` | SHANA |
| 33 | `111100` | 천산둔 | `111100/judgment/original/261116_2316_judgment_Laude.json` | `111100/judgment/ko/261116_2316_judgment_Laude.json` | SHANA |
| 34 | `001111` | 뢰천대장 | `001111/judgment/original/261118_0749_judgment_Shana.json` | `001111/judgment/ko/261118_0749_judgment_Shana.json` | SHANA |
| 35 | `101000` | 화지진 | `101000/judgment/original/261117_0716_judgment_Laude.json` | `101000/judgment/ko/261117_0716_judgment_Laude.json` | SHANA |
| 36 | `000101` | 지화명이 | `000101/judgment/original/261118_2001_judgment_Laude.json` | `000101/judgment/ko/261118_2001_judgment_Laude.json` | SHANA |
| 37 | `110101` | 풍화가인 | `110101/judgment/original/261119_1905_judgment_Laude.json` | `110101/judgment/ko/261119_1905_judgment_Laude.json` | SHANA |
| 38 | `101011` | 화택규 | `101011/judgment/original/261118_0732_judgment_Laude.json` | `101011/judgment/ko/261118_0732_judgment_Laude.json` | SHANA |
| 39 | `010100` | 수산건 | `010100/judgment/original/261118_0807_judgment_Laude.json` | `010100/judgment/ko/261118_0807_judgment_Laude.json` | SHANA |
| 40 | `001010` | 뢰수해 | `001010/judgment/original/261118_1240_judgment_Shana.json` | `001010/judgment/ko/261118_1240_judgment_Shana.json` | SHANA |
| 41 | `100011` | 산택손 | `100011/judgment/original/261117_1951_judgment_Shana.json` | `100011/judgment/ko/261117_1951_judgment_Shana.json` | SHANA |
| 42 | `110001` | 풍뢰익 | `110001/judgment/original/261116_2301_judgment_Laude.json` | `110001/judgment/ko/261116_2301_judgment_Laude.json` | SHANA |
| 43 | `011111` | 택천쾌 | `011111/judgment/original/261118_1905_judgment_Laude.json` | `011111/judgment/ko/261118_1905_judgment_Laude.json` | SHANA |
| 44 | `111110` | 천풍구 | `111110/judgment/original/261117_0818_judgment_Laude.json` | `111110/judgment/ko/261117_0818_judgment_Laude.json` | SHANA |
| 45 | `011000` | 택지췌 | `011000/judgment/original/261117_0829_judgment_Laude.json` | `011000/judgment/ko/261117_0829_judgment_Laude.json` | SHANA |
| 46 | `000110` | 지풍승 | `000110/judgment/original/261117_1821_judgment_Laude.json` | `000110/judgment/ko/261117_1821_judgment_Laude.json` | SHANA |
| 47 | `011010` | 택수곤 | `011010/judgment/original/261119_1920_judgment_Shana.json` | `011010/judgment/ko/261119_1920_judgment_Shana.json` | SHANA |
| 48 | `010110` | 수풍정 | `010110/judgment/original/261117_2142_judgment_Laude.json` | `010110/judgment/ko/261117_2142_judgment_Laude.json` | SHANA |
| 49 | `011101` | 택화혁 | `011101/judgment/original/261118_0830_judgment_Shana.json` | `011101/judgment/ko/261118_0830_judgment_Shana.json` | SHANA |
| 50 | `101110` | 화풍정 | `101110/judgment/original/261118_1933_judgment_Laude.json` | `101110/judgment/ko/261118_1933_judgment_Laude.json` | SHANA |
| 51 | `001001` | 중뢰진 | `001001/judgment/original/261117_0656_judgment_Laude.json` | `001001/judgment/ko/261117_0656_judgment_Laude.json` | SHANA |
| 52 | `100100` | 중산간 | `100100/judgment/original/261118_2200_judgment_Shana.json` | `100100/judgment/ko/261118_2200_judgment_Shana.json` | SHANA |
| 53 | `110100` | 풍산점 | `110100/judgment/original/261117_0751_judgment_Laude.json` | `110100/judgment/ko/261117_0751_judgment_Laude.json` | SHANA |
| 54 | `001011` | 뢰택귀매 | `001011/judgment/original/261117_1843_judgment_Shana.json` | `001011/judgment/ko/261117_1843_judgment_Shana.json` | SHANA |
| 55 | `001101` | 뢰화풍 | `001101/judgment/original/261117_2025_judgment_Shana.json` | `001101/judgment/ko/261117_2025_judgment_Shana.json` | SHANA |
| 56 | `101100` | 화산려 | `101100/judgment/original/261117_2040_judgment_Laude.json` | `101100/judgment/ko/261117_2040_judgment_Laude.json` | SHANA |
| 57 | `110110` | 중풍손 | `110110/judgment/original/261117_0744_judgment_Laude.json` | `110110/judgment/ko/261117_0744_judgment_Laude.json` | SHANA |
| 58 | `011011` | 중택태 | `011011/judgment/original/261118_1211_judgment_Laude.json` | `011011/judgment/ko/261118_1211_judgment_Laude.json` | SHANA |
| 59 | `110010` | 풍수환 | `110010/judgment/original/261119_1927_judgment_Laude.json` | `110010/judgment/ko/261119_1927_judgment_Laude.json` | SHANA |
| 60 | `010011` | 수택절 | `010011/judgment/original/261119_1939_judgment_Shana.json` | `010011/judgment/ko/261119_1939_judgment_Shana.json` | SHANA |
| 61 | `110011` | 풍택중부 | `110011/judgment/original/261117_1244_judgment_Shana.json` | `110011/judgment/ko/261117_1244_judgment_Shana.json` | SHANA |
| 62 | `001100` | 뢰산소과 | `001100/judgment/original/261116_2353_judgment_Laude.json` | `001100/judgment/ko/261116_2353_judgment_Laude.json` | SHANA |
| 63 | `010101` | 수화기제 | `010101/judgment/original/261117_1208_judgment_Shana.json` | `010101/judgment/ko/261117_1208_judgment_Shana.json` | SHANA |
| 64 | `101010` | 화수미제 | `101010/judgment/original/261117_1234_judgment_Laude.json` | `101010/judgment/ko/261117_1234_judgment_Laude.json` | SHANA |
