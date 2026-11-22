# 화면 글 '옵션'·'방식 설정' → '설정' (261123_0801 LAUDE)

JJDD 요청: 시초점의 '옵션'과 동전점의 '방식 설정'을 모두 '설정'으로 바꾼다.

## 바뀐 화면 글

- 시초점 메뉴: 버튼 [옵션] → [설정], 안내 "설정에서 나만의 방식을 정하고…", "설정에서 정한 방식…"
- 시초점 설정 화면: 제목 "시초점 설정", 작은 머리 "시초점 · 설정", 브라우저 탭 제목, 아래 안내문
- 시초점 배우기: "설정에서 바꾸기" 링크, 진행 중 안내 "설정에서 바꾼 방식은…", "배우기 중에 설정 화면으로 가면…", 하나 덜기 장면의 "[설정]에서 고를 수 있습니다", "시초점 설정에서 ‘빠르게 진행’…"
- 동전점: 버튼 [방식 설정] → [설정]. 열면 [설정 닫기](그대로)
  - 영어: "Method settings" → "Settings"

## 바꾸지 않은 것

- 주소 `yarrow/options/`, 파일 이름, 코드 주석
- 저장 키(`iyeok.yarrow.settings.v1`)와 저장값

## 파일

- 언어 사전 새 판(`설정` → `Settings` 한 줄 추가): `assets/i18n/261123_0801_{language.js,locales.json,ko.json,en.json}_Laude`
  - 언어 모듈 CSS는 1836 판 그대로다.
- 시초점 배우기 글: `yarrow/learn/261123_0801_{learn,scenes-ko}_Laude.js`
- 고정 파일은 백업한 뒤 제자리에서 고쳤다.
  - 고친 파일: `index.html`, `app/index.html`, `app/app.js`, `app/sw.js`(캐시 `iyeok-app-v74`), `yarrow/index.html`, `yarrow/options/index.html`, `yarrow/learn/index.html`
  - 백업 위치: `backups/site/261123_0801_index.html`, `backups/app/261123_0801_{index.html,app.js,sw.js}`, `backups/yarrow/261123_0801_{yarrow,options,learn}-index.html`
