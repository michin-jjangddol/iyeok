# app

iYeok coin divination preview (PWA). Open it at `https://iyeok.org/app/`.

## What it does

- Toss three coins six times to build one of the 64 hexagrams
- Show the primary hexagram, the changing lines, and the resulting hexagram
- Let each user choose their own way: coin, which face counts as yang,
  the order of filling lines (earth: bottom → top, heaven: top → bottom, human: choose each position),
  and the symbols for old yang and old yin
- Remember only these settings on the device; readings are not saved

The defaults are just a starting point, not the one correct way.

## Files

| File | Role |
|---|---|
| `index.html` | App screen |
| `app.css` | App styles on top of `assets/style.css` |
| `app.js` | Screen behavior |
| `iching.js` | Casting logic (no screen code) |
| `manifest.webmanifest` | Install information (name, icons, colors) |
| `sw.js` | Service worker for offline use |

## Next steps

- [ ] Judgment and line statements
- [ ] Saving personal records
- [ ] Yarrow-stalk method

---

This document was prepared with the assistance of Shana (GPT) and Laude (Claude).

---
<br>
<br>

# app

아이역 동전점 맛보기(PWA)입니다. `https://iyeok.org/app/`에서 열립니다.

## 하는 일

- 동전 3개를 여섯 번 던져 64괘 중 하나를 얻습니다
- 본괘, 변효, 지괘를 보여줍니다
- 사용자가 자기 방식대로 고를 수 있습니다: 동전, 양으로 삼을 면,
  효를 채우는 순서(땅괘: 아래 → 위, 하늘괘: 위 → 아래, 인간괘: 자리를 골라서),
  노양·노음 기호
- 이 설정만 기기에 기억하고, 점 결과는 저장하지 않습니다

기본값은 바로 시작하기 위한 출발점일 뿐, 하나뿐인 정답이 아닙니다.

## 파일

| 파일 | 역할 |
|---|---|
| `index.html` | 앱 화면 |
| `app.css` | `assets/style.css` 위에 얹는 앱 스타일 |
| `app.js` | 화면 동작 |
| `iching.js` | 괘 계산 (화면 코드 없음) |
| `manifest.webmanifest` | 설치 정보 (이름, 아이콘, 색) |
| `sw.js` | 오프라인 실행용 서비스 워커 |

## 다음 작업

- [ ] 괘사·효사
- [ ] 나의 기록 저장
- [ ] 시초 방식

---

이 문서는 샤나(GPT)와 로드(Claude)의 도움을 받아 작성되었습니다.
