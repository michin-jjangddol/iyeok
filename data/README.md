# data

This folder holds app data such as the classical I Ching text and hexagram information.

## Files to add

- `hexagrams.json` — the 64 hexagrams (number, name, Chinese characters, yin/yang of the six lines, upper and lower trigrams)
- The judgment (卦辭) and line statements (爻辭) with commentary
- Basic information on the eight trigrams (☰☱☲☳☴☵☶☷)

## Principles

- Accuracy of the classical text and hexagram structure comes first.
- Record the source of every classical text.
- `hexagrams.json` follows the King Wen sequence of the received Zhouyi text. All 64 entries (number, name, lower and upper trigram) were checked against
  [Wikipedia, List of hexagrams of the I Ching](https://en.wikipedia.org/wiki/List_of_hexagrams_of_the_I_Ching) (revision 1344901076, 2026-03-23),
  against their full titles (upper nature + lower nature + name), and against hexagram names in J's own divination notes.
  Re-run the external check with `python tests/check_hexagrams_wikipedia.py`.
- Hexagram shapes on screen are drawn from this data, so the drawing always matches the data.

## Naming

- Lowercase English with hyphens: `hexagrams.json`, `trigrams.json`

## Next steps

- [x] Write and verify the 64-hexagram data (`hexagrams.json`: number, names, upper/lower trigrams, six lines)
- [ ] Add the judgment and line statements with their sources

---

This document was prepared with the assistance of Shana (GPT) and Laude (Claude).

---
<br>
<br>

# data

주역 원문과 괘 정보 같은 앱 데이터를 두는 폴더입니다.

## 넣을 파일

- `hexagrams.json` — 64괘 정보 (번호, 이름, 한자, 여섯 효의 음양, 상괘·하괘)
- 괘사·효사 원문과 해설
- 팔괘(☰☱☲☳☴☵☶☷) 기본 정보

## 원칙

- 주역 원문과 괘 구성의 정확성을 최우선으로 확인합니다.
- 원문 출처를 함께 기록합니다.
- `hexagrams.json`은 주역 경문의 문왕 괘서를 따릅니다. 64개 모두(번호, 괘명, 하괘·상괘)를
  [위키백과 List of hexagrams of the I Ching](https://en.wikipedia.org/wiki/List_of_hexagrams_of_the_I_Ching)(2026-03-23 판, revision 1344901076),
  전체 괘명(상괘 자연 + 하괘 자연 + 괘명), J의 점 기록에 적힌 괘 이름과 대조해 확인했습니다.
  외부 대조는 `python tests/check_hexagrams_wikipedia.py`로 다시 실행할 수 있습니다.
- 화면의 괘 모양은 이 데이터로 그려서, 그림과 데이터가 항상 일치하게 합니다.

## 이름 규칙

- 영문 소문자와 하이픈: `hexagrams.json`, `trigrams.json`

## 다음 작업

- [x] 64괘 데이터 작성 및 검증 (`hexagrams.json`: 번호, 이름, 상괘·하괘, 여섯 효)
- [ ] 괘사·효사 원문과 출처 추가

---

이 문서는 샤나(GPT)와 로드(Claude)의 도움을 받아 작성되었습니다.
