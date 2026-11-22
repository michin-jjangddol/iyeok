# 시초점 변효 기호 선택 (261123_0102 LAUDE)

JJDD 직접 요청(SHANA 요청문): 동전점처럼 시초점 옵션에도 '변효 기호'를 고를 수 있게 한다.

## 옵션

- **변효 기호**
  - 노양 × · 노음 ○ (기본값, 값 `iyeok`)
  - 노양 ○ · 노음 × (값 `classic`)
- 값 이름은 동전점과 같지만, 시초점 설정 키(`iyeok.yarrow.settings.v1`)의 `symbols`에 따로 저장한다. 동전점 설정(`iyeok.coin.settings.v1`)은 건드리지 않는다.
- 저장값이 없거나 잘못되면 기본값을 쓴다. [기본값으로 되돌리기]에도 이 항목이 포함된다.
- 배우기를 시작할 때 읽는 방식·음양 대응과 함께 고정된다. 진행 중에 바꾸면 "다음 배우기부터 적용" 안내가 나온다.

## 원칙

- 기호는 **표시만** 바꾼다. 효의 수, 음양, 노소, 변효 여부, 본괘, 지괘는 그대로다.
- 기호는 숫자가 아니라 **최종 판정된 효 종류**(노양·노음)에 붙는다. 예: 정효점 반전 대응에서 9는 노음이므로, '노양 ○ · 노음 ×'에서는 ×가 붙는다.
- 소양·소음에는 기호가 없다.
- 기호 문자열을 보고 판정을 거꾸로 추론하지 않는다(`movingMark(value, symbols)`는 적용 효 값에서 기호만 만든다).
- 기호 옆에 '노양(변하는 양)' 또는 '노음(변하는 음)' 글은 그대로 둔다.

## 적용 위치

한 효 장면(설명 문장 속 '변효(×)' 포함), '왜 이 효가 나왔나요?'의 그림·설명·다른 방식 비교, 효판, 본괘의 기호와 변효 안내, 결과 목록, 과정 돌아보기, 효 종류 안내표. 효판 기호는 `aria-hidden`이다. 효 이름이 글로 함께 읽히기 때문이다.

## 파일

- `yarrow/261123_0102_settings_Laude.js`: `SYMBOLS`, `SYMBOL_LABELS`, 기본값 `symbols: "iyeok"`
- `yarrow/options/261123_0102_options_Laude.js`, `yarrow/options/index.html`(백업 `backups/yarrow/261123_0102_options-index.html`)
- `yarrow/learn/261123_0102_{why-ko,scenes-ko,learn}_Laude.js`, `yarrow/learn/index.html`(백업 `backups/yarrow/261123_0102_learn-index.html`)
- 검사: `tests/261123_0102_yarrow-moving-symbols_Laude.mjs`
  - `tests/261122_2047_yarrow-yin-yang-mapping_Laude.mjs`의 "옛 저장값 호환" 기대값에는 이제 `symbols: "iyeok"`가 더해진다. 나머지 검사는 그대로 통과한다.
