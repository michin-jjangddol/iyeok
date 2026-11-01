# iYeok — Vision & Roadmap

First written: 2026-11-01 (the day iYeok first went online)

This is a living document. It records where iYeok wants to go, not a fixed specification or release schedule.
It will be updated as we use the app and learn from it.

## 1. Where iYeok begins

> My I Ching, our stories.
>
> The hexagram shows the way; the choice belongs to the person.

iYeok treats the I Ching (周易) not as a tool for predicting the future,
but as a personal guide for reflection and choice.
A person asks a question, receives a hexagram, reads it as a reference, makes their own choice,
and later looks back on that choice.

iYeok started as a small app for one person (J) and is being built by J together with two AI assistants,
Shana and Laude.

## 2. What exists today

As of 2026-11-01:

- An introduction homepage at https://iyeok.org
- A coin divination preview at https://iyeok.org/app/ (installable PWA, works offline)
  - Three coins tossed six times
  - Primary hexagram, changing lines, and resulting hexagram
  - Each user chooses their own way: coin, which face counts as yang,
    the order of filling lines (earth: bottom → top, heaven: top → bottom, human: choose each position),
    and the symbols for old yang and old yin
- Data for the 64 hexagrams, checked against an external source
- Readings are not saved yet

Everything below this section is a plan, not a finished feature.

## 3. A personal I Ching guide

The first goal is an app that one person enjoys using every day.

- **Ways to cast**: digital coins, entering the result of real coins, the traditional yarrow-stalk method,
  and coin designs from different countries (as simple icons)
- **Reading a hexagram**: the original classical text, translations, and modern commentary,
  always clearly marked as separate layers
- **Personal records**: the question, the situation, the choice made, and a reflection written later
- **Personal statistics**: how many times each hexagram has appeared, by day, month, year, and lifetime,
  together with the total number of casts

Every cast is kept as an original record. Statistics are always calculated from those records,
so they can be checked again years later.
The casting method is recorded too, because coins and yarrow stalks have different probabilities.

## 4. A world hexagram observatory

Over time, a person's records can be placed beside those of others.

- Only users who explicitly agree contribute, and only anonymously
- Questions, worries, choices, and reflections are never part of the statistics
- Compare the distribution of the 64 hexagrams: me, my country, and the world
- Each person decides which of their own numbers to make public
- Compare observed distributions with theoretical probabilities over time

Hexagrams drawn by the app's random number generator should be evenly distributed by design.
The more interesting question is what happens with real coins and yarrow stalks cast by people.
These two kinds of data will be kept apart.
An uneven distribution would be something to observe and examine,
not proof that the mind or fate decides the hexagram.

## 5. An SNS connected by hexagrams

Most social networks connect people through friends, follows, or interests.
iYeok imagines people meeting through a hexagram they actually received.

- **64 hexagrams as gateways**: a person who has received a hexagram can enter its space.
  Paying money or casting many times is not meant to be a shortcut.
- **From comments to rooms**: conversations begin as comments under a hexagram.
  When two or more people agree, they can open a room and choose its first host.
- **Many rooms, made by users**: each hexagram can hold many independent rooms.
- **Three kinds of rooms**: anonymous only, accounts only, or mixed.
  Each person chooses which room to enter and how to appear.
- **A community that keeps changing**: people come and go, hosts change,
  and the record of the room continues.
- **Across languages**: everyone writes in their own language and reads in theirs,
  with automatic translation and the original always available.
- **Personal profile numbers**: for example, total casts, casts this year and this month,
  and hexagrams experienced. Each person chooses what to show.

Some ideas are still open and will be decided only through real use, for example:
how long a right to enter lasts and how it is renewed, a limit such as five rooms at a time,
leaving a room automatically after a period, how hosts are succeeded, and how records are deleted.
None of these are settled rules.

Before any public community opens, privacy, consent, reporting and blocking, protection of minors,
data deletion rights, and running costs must be worked out.

## 6. How iYeok grows

iYeok will not build everything at once.

1. **Personal use**: J uses it daily and improves it
2. **Sharing with friends**: a few people use it and give feedback
3. **Anonymous statistics**: records from consenting users are combined
4. **A global space**: comments, rooms, and translation open step by step

Each stage should be useful on its own, even if the next stage never comes.
Rules for the community will grow out of experience rather than being fixed in advance.

## 7. Closing

iYeok begins as one person's small I Ching guide.
As time passes, personal records accumulate, those records connect to the statistics of the world,
and people who received the same hexagram meet and create new stories.

The hexagram shows the way; the choice belongs to the person.

---

This document was prepared with the assistance of Shana (GPT) and Laude (Claude).

---
<br>
<br>

# 아이역 — 비전과 발전 계획

처음 작성: 2026-11-01 (아이역이 처음 온라인에 공개된 날)

이 문서는 계속 고쳐 나가는 문서입니다. 아이역이 가고 싶은 방향을 기록한 것이지, 확정된 개발 명세나 출시 일정이 아닙니다.
직접 사용하고 배우면서 업데이트합니다.

## 1. 아이역의 시작

> 나의 주역, 우리의 이야기.
>
> 괘는 길을 보여주고, 선택은 사람이 한다.

아이역은 주역(周易)을 미래를 예언하는 도구가 아니라,
성찰과 선택을 위한 개인 안내서로 대합니다.
사람이 스스로 묻고, 괘를 얻고, 그 해석을 참고해 자신의 선택을 하고,
시간이 흐른 뒤 그 선택을 돌아봅니다.

아이역은 한 사람(J)이 쓰려고 만든 작은 앱에서 시작했고,
J와 두 AI 조수 샤나(Shana), 로드(Laude)가 함께 만들고 있습니다.

## 2. 지금 있는 것

2026-11-01 기준:

- 소개 홈페이지: https://iyeok.org
- 동전점 맛보기: https://iyeok.org/app/ (설치 가능한 PWA, 오프라인 실행)
  - 동전 3개를 여섯 번 던지기
  - 본괘, 변효, 지괘 표시
  - 사용자가 자기 방식대로 선택: 동전, 양으로 삼을 면,
    효를 채우는 순서(땅괘: 아래 → 위, 하늘괘: 위 → 아래, 인간괘: 자리를 골라서),
    노양·노음 기호
- 외부 자료와 대조해 확인한 64괘 데이터
- 점 결과는 아직 저장되지 않음

이 아래 내용은 모두 계획이며, 완성된 기능이 아닙니다.

## 3. 개인용 주역 안내서

첫 목표는 한 사람이 매일 즐겁게 쓰는 앱입니다.

- **괘를 얻는 방법**: 디지털 동전, 실제로 던진 동전 결과 입력, 전통 시초법,
  여러 나라의 동전 모양(단순한 아이콘)
- **괘 읽기**: 주역 원문, 번역, 현대적 해설을 서로 분명히 구분해서 제공
- **나의 기록**: 질문, 당시 상황, 실제로 한 선택, 나중에 쓰는 회고
- **나의 통계**: 괘별 출현 횟수를 일·월·연·평생 단위로, 전체 시도 횟수와 함께

괘를 뽑은 기록은 모두 원본으로 보존하고, 통계는 언제나 그 기록에서 계산합니다.
그래야 몇 년 뒤에도 다시 검증할 수 있습니다.
동전과 시초는 확률이 다르므로, 어떤 방법으로 뽑았는지도 함께 기록합니다.

## 4. 세계 괘상 관측소

시간이 지나면 나의 기록을 다른 사람들의 기록 옆에 놓아 볼 수 있습니다.

- 분명히 동의한 사용자만, 익명으로 참여
- 질문, 고민, 선택, 회고는 통계에 절대 포함하지 않음
- 64괘 출현 분포를 나, 우리나라, 세계로 비교
- 내 숫자 중 무엇을 공개할지는 각자 결정
- 시간에 따른 실제 분포를 이론적 확률과 비교

앱의 난수로 뽑은 괘는 원리상 고르게 나와야 합니다.
더 흥미로운 질문은 사람이 직접 던진 실물 동전과 시초에서 어떤 분포가 나오는가입니다.
그래서 두 종류의 자료는 따로 다룹니다.
분포가 고르지 않게 나온다면 관찰하고 따져 볼 대상이지,
마음이나 운명이 괘를 정한다는 증거로 보지 않습니다.

## 5. 괘로 이어지는 SNS

대부분의 SNS는 친구, 팔로우, 관심사로 사람을 잇습니다.
아이역은 실제로 만난 괘를 계기로 사람들이 만나는 공간을 꿈꿉니다.

- **64괘는 관문**: 그 괘를 실제로 받은 사람이 그 괘의 공간에 들어갑니다.
  돈을 내거나 많이 던지는 것이 지름길이 되지 않도록 합니다.
- **댓글에서 대화방으로**: 대화는 괘 아래 댓글에서 시작합니다.
  두 사람 이상이 합의하면 방을 열고, 첫 방장을 함께 정합니다.
- **사용자들이 만드는 여러 방**: 한 괘 아래에 독립된 방이 여럿 생길 수 있습니다.
- **세 가지 방**: 익명 전용, 계정 전용, 혼합.
  어느 방에 어떤 모습으로 들어갈지는 각자 고릅니다.
- **계속 변하는 공동체**: 사람들이 오가고 방장이 바뀌어도 방의 기록은 이어집니다.
- **언어를 넘어서**: 각자 자기 언어로 쓰고 자기 언어로 읽습니다.
  자동 번역을 쓰되, 원문은 언제나 볼 수 있습니다.
- **나를 나타내는 숫자**: 예를 들어 누적 괘상 횟수, 올해·이번 달 횟수, 경험한 괘의 수.
  무엇을 보여 줄지는 각자 정합니다.

아직 정하지 않은 아이디어들은 실제로 운영하면서 정합니다. 예를 들면
입장 자격의 유효기간과 갱신 방식, 동시에 참여하는 방을 5개로 제한하는 것,
일정 기간 뒤 자동으로 방에서 나가는 것, 방장 승계 방식, 기록 삭제 방식 등입니다.
이것들은 모두 확정된 규칙이 아닙니다.

공개 소통공간을 열기 전에 반드시 정리해야 할 것들이 있습니다.
개인정보 보호, 동의 관리, 신고와 차단, 미성년자 보호, 기록 삭제 권리, 운영 비용입니다.

## 6. 아이역이 자라는 방식

아이역은 처음부터 모든 기능을 만들지 않습니다.

1. **개인 사용**: J가 매일 쓰면서 고친다
2. **지인과 함께**: 몇 사람이 써 보고 의견을 준다
3. **익명 통계**: 동의한 사용자들의 기록을 모은다
4. **세계의 소통공간**: 댓글, 대화방, 번역을 한 걸음씩 연다

다음 단계가 오지 않더라도 각 단계는 그 자체로 쓸모가 있어야 합니다.
공동체의 규칙은 미리 고정하지 않고, 경험 속에서 만들어 갑니다.

## 7. 맺음말

아이역은 한 사람의 작은 주역 안내서에서 시작한다.
시간이 흐르면서 개인의 기록이 쌓이고, 그 기록이 세계의 통계와 연결되며,
같은 괘를 경험한 사람들이 만나 새로운 이야기를 만들어 간다.

괘는 길을 보여주고, 선택은 사람이 한다.

---

이 문서는 샤나(GPT)와 로드(Claude)의 도움을 받아 작성되었습니다.
