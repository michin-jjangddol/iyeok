# tests

Checks that can be run again whenever the code or data changes.

| File | What it checks | How to run |
|---|---|---|
| `iching.test.mjs` | Line types, chosen yang face, fill orders, all 64 hexagrams, 4,096 line-type combinations for primary and changed hexagrams, changing-line reversal, line names, probabilities, offline file list | `node tests/iching.test.mjs` |
| `check_hexagrams_wikipedia.py` | All 64 hexagrams (number, name, lower and upper trigram) against Wikipedia. Needs internet. | `python tests/check_hexagrams_wikipedia.py` |
| `cancel-check.browser.js` | No automatic jump to the result after six lines ("View hexagram" button instead); "Start over" during a toss or after six lines leaves no leftover work in a new reading | Open `http://localhost:8080/app/`, paste the file into the browser console |

The local server for the browser check:

```
python -m http.server 8080
```

---

This document was prepared with the assistance of Shana (GPT) and Laude (Claude).

---
<br>
<br>

# tests

코드나 데이터를 고칠 때마다 다시 돌려 볼 수 있는 검증 모음입니다.

| 파일 | 확인하는 것 | 실행 방법 |
|---|---|---|
| `iching.test.mjs` | 효 종류, 양으로 삼은 면, 채우는 순서, 64괘 전체, 본괘·지괘 4,096개 조합, 변효 반전, 효 이름, 확률, 오프라인 파일 목록 | `node tests/iching.test.mjs` |
| `check_hexagrams_wikipedia.py` | 64괘 전체(번호, 괘명, 하괘·상괘)를 위키백과와 대조. 인터넷 필요 | `python tests/check_hexagrams_wikipedia.py` |
| `cancel-check.browser.js` | 여섯 효가 차도 결과로 저절로 넘어가지 않고 "괘상 보기" 버튼으로 넘어가는지, 던지는 중이나 완성 후 "처음으로"를 눌러도 이전 작업이 새 점에 끼어들지 않는지 | `http://localhost:8080/app/`을 열고 이 파일 내용을 브라우저 콘솔에 붙여 넣기 |

브라우저 검증용 로컬 서버:

```
python -m http.server 8080
```

---

이 문서는 샤나(GPT)와 로드(Claude)의 도움을 받아 작성되었습니다.
