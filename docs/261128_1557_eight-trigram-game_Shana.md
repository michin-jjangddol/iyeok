# Eight-Trigram Game

iYeok Idea Archive  
Status: board-game concept and handoff draft, not a finished ruleset  
Date: 2026-11-28 KST  
Ideas: JJDD · Writing and English translation: SHANA

## 01. Start with a Board We Can Play On

I want to begin with a 2D eight-trigram game, then discover its rules by playing. JJDD sets the direction; implementation details can be worked through with LAUDE and SHANA. We do not need to finish every possible game before making the first board.

Possible modes are playing alone, playing against the computer, and two people playing together—including a friendly, mutually agreed “who buys lunch?” game. These modes are goals, not existing features.

This document follows [Imagining an Eight-Trigram Game](261127_0744_eight-trigram-game-imagination_Shana.md), adding the floor-board ideas from our next conversation. The earlier draft stays intact. The current request is to upload this document only; game code comes later with JJDD and LAUDE.

## 02. Eight Faces, Laid Out in Rows

The board begins with the eight triangular faces of an unfolded octahedron. The initial image is three rows of eight-trigram boards. Three or four rows, their connections, and whether every row repeats all eight trigrams still need to be drawn and agreed upon. “Three rows, 24 spaces” was an assistant's interpretation, not a final decision by JJDD.

Each space should show its trigram lines, name and nature icon. A floor board is the starting point; folding and spatial views can be explored later. Not every arrangement of triangles is an octahedron net.

## 03. Two People Approach Each Other

Two players use rock–paper–scissors to choose their starting positions. The winner chooses Heaven or Earth on the bottom board; the other starts at the opposite one.

The players move toward each other, like meeting on a single narrow bridge. They can encounter each other across the three-row board. The exact continuous route and how it changes rows are still undecided.

Landing on the opponent's space captures that piece. The captured piece returns to its own starting space: Heaven for the player who started at Heaven, Earth for the one who started at Earth. Passing over a piece, portal captures and multiple effects need later decisions.

## 04. Three Coins Produce One Line

A throw of three coins produces one of four line types: young yang, young yin, old yang or old yin. It does not produce three lines or a whole trigram. The board space already has a trigram.

One provisional movement example from JJDD is:

| Coin result | Candidate action |
|---|---|
| Young yang | Forward one space |
| Young yin | Forward two spaces |
| Old yang | Forward three spaces |
| Old yin | Backward move? Distance undecided |

The player may look at the board and choose whether yang or yin represents the one-space move. How the other actions change with that choice, how long a rule lasts, and whether both players use it need to be agreed upon before the next throw. The table is an experiment, not a locked ruleset.

Three-coin outcomes are not equally likely: with independent fair coins in the usual method, young yang and young yin each occur with probability 3/8, and old yang and old yin each with 1/8. Existing iYeok interpretation options may change the mapping, so actual game behavior must state the selected rule.

## 05. Walking, Jumping and Slipping Back

Movement can bring us face to face. It can also make my own piece jump ahead or slide back. A plan to catch someone may fail because of my throw; a jump may unexpectedly place me beside the opponent.

An eight-sided die is another possible input. We might use its upward face to choose a trigram or an action. The assignment is not decided. Coins and a die can lead to different games on the same board; we do not have to combine both at once.

## 06. The Opposite-Trigram Doors

The four portal pairs are:

| Pair | Binary IDs | Nature |
|---|---|---|
| Gon ↔ Geon | `000 ↔ 111` | Earth ↔ Heaven |
| Gam ↔ Ri | `010 ↔ 101` | Water ↔ Fire |
| Son ↔ Jin | `110 ↔ 001` | Wind ↔ Thunder |
| Gan ↔ Tae | `100 ↔ 011` | Mountain ↔ Lake |

Enter one and emerge from its partner—“zing!” All three lines flip. The destination ID is the current ID XOR `111₂`.

When the portal activates, which repeated copy of a trigram it leads to, and whether it is optional are still open. Three changed lines and three ordinary board steps are different concepts. A portal must not trigger endlessly just because its exit is another portal.

## 07. The Flat Board and the Eight-Bead Map

The earlier idea remains: the main display is a 2D board, with a small globe-like eight-bead map at the upper right. Moving a piece on the board changes its position on the spatial view too, including the opponent's position.

If several rows repeat the same trigram, a trigram ID alone cannot identify the board space. The map also needs to distinguish the row or stage, and handle both pieces sharing the same trigram in different places. This is a design question, not an implemented solution.

## 08. Learning Through Play

Names, three-line symbols, natural images and opposite partners should become familiar through play. “That is Water; its opposite door is Fire.” Our existing eight icons and verified trigram data are materials we can reuse.

Sounds and short visual effects can support recognition without turning every space into a long explanation. Any new game effect is iYeok's creative rule, not a claim that this is how traditional trigrams must behave.

## 09. Common Rules and Changing Rules

Try one game, notice what is fun, then try another. Capture and return-to-start might become common rules. The input tool, one/two/three-space assignments, backward moves, portals and winning conditions might vary between games.

We should keep track of which rules a session uses and agree on changes before the next throw. We are inventing a game together, not trying to settle every branch in advance. A race, a ladder-style outcome game and a lunch game may ultimately need separate rulesets. Their fairness cannot be inferred just from using coins or dice.

## 10. Later: Fold It Up, Then Imagine Sixty-Four

One day the flat board might fold into a physical object. Paper nets can help test it; 3D-printed pieces and hinges could follow. A repeated multi-row board does not automatically fold into one octahedron.

Part two remains **Imagining a 64-Hexagram Game—coming soon, date unknown.** A 64-face object or a spatial board with 64 regions are possibilities, not settled geometry. We do not need to solve them before enjoying the first 2D trigram game.

## Handoff Notebook

**Recorded direction**

- Start with a playable 2D trigram board; develop rules through play.
- Aim for solo, computer-opponent and two-person modes.
- Two players choose opposite Heaven/Earth starts by rock–paper–scissors and approach each other.
- Landing on an opponent captures it and returns it to its own start.
- Keep names, line symbols and nature icons together.
- Retain opposite-pair portal and linked 2D/3D ideas for experimentation.

**To decide while sketching the first board**

- Three rows or four; exact triangle net, route and row transitions.
- First input: three coins or an eight-sided die.
- Rule-choice scope, backward distance, overshoot, turns and finish conditions.
- Portal activation, exit row, capture order and loop prevention.
- Solo goal, computer choices and two-player balance.
- PWA presentation, accessible controls, offline assets and later networking.

**Scope now:** this Markdown document only. No game implementation, home-menu changes or new PWA behavior. Further development is to be agreed with JJDD and LAUDE.

---
<br>
<br>

# 8괘 게임

아이역 생각창고  
상태: 말판 구상·개발 대화용 초안 — 규칙 확정 전  
작성일: 2026-11-28 한국시간  
구상: JJDD · 작성·영문화: SHANA

## 01. 일단 놀 수 있는 판부터

출발은 2D 팔괘 게임이다. 하나를 만들고 직접 놀면서 규칙을 정하고 싶다. JJDD는 방향을 잡고, 복잡한 구현은 로드·샤나와 풀어 간다. 가능한 게임을 전부 설계한 다음에 시작할 필요는 없다.

혼자서도 하고, 컴퓨터와도 하고, 둘이서 점심쏘기 한 판도 할 수 있으면 좋겠다. 이것은 만들고 싶은 모드이며 이미 구현된 기능은 아니다.

이 문서는 앞서 남긴 [8괘 게임 상상](261127_0744_eight-trigram-game-imagination_Shana.md)에 이어, 새로 이야기한 바닥판 놀이를 정리한 것이다. 이전 문서는 보존한다. 이번 요청은 문서 업로드까지이며, 본게임 개발은 이후 JJDD·로드와 함께 시작한다.

## 02. 여덟 면을 펼쳐 줄로 놓기

정팔면체의 삼각형 여덟 면을 펼친 팔괘판에서 시작한다. 처음 떠올린 모습은 팔괘판을 세 줄 깔아 놓는 것이다. 세 줄로 할지 네 줄로 할지, 줄끼리 어떻게 이어지는지, 매 줄에 팔괘가 모두 반복되는지는 그림으로 보며 정한다. ‘한 줄에 여덟 칸, 총 24칸’은 대화 중 샤나가 해석한 것이며 JJDD가 최종 확정한 배치는 아니다.

각 칸에는 괘상과 이름, 자연 아이콘이 함께 보인다. 우선 바닥판에서 놀고, 접거나 세워 보는 입체 표현은 다음으로 이어 갈 수 있다. 삼각형을 아무렇게나 이어 붙인다고 정팔면체로 접히는 것은 아니다.

## 03. 둘이 마주 보고 출발하기

두 사람이 가위바위보를 한다. 이긴 사람이 맨 아래 팔괘판에서 건·하늘 또는 곤·땅의 출발점을 고르고, 다른 사람은 반대편에서 시작한다.

외나무다리 양끝에서 마주 오듯 서로를 향해 움직인다. 세 줄의 판에서 만나기도 하고 엇갈리기도 한다. 실제로 한 길이 어떻게 이어지고 다음 줄로 넘어가는지는 아직 정하지 않았다.

상대가 있는 칸에 도착하면 상대 말을 잡는다. 잡힌 말은 자기 첫칸으로 돌아간다. 하늘에서 출발했다면 하늘로, 땅에서 출발했다면 땅으로 돌아간다. 지나쳐 갈 때도 잡는지, 문 이동으로 잡는지, 효과가 겹치면 어떤 순서로 처리하는지는 더 정해야 한다.

## 04. 동전 세 개로 한 효 뽑기

동전 세 개를 한꺼번에 던지면 소양·소음·노양·노음 중 한 효가 나온다. 동전 세 개가 세 효나 팔괘 하나가 되는 것은 아니다. 바닥 칸에는 이미 팔괘의 괘상이 있다.

JJDD가 이야기한 임시 이동 예시는 다음과 같다.

| 동전 결과 | 시험해 볼 행동 |
|---|---|
| 소양 | 앞으로 한 칸 |
| 소음 | 앞으로 두 칸 |
| 노양 | 앞으로 세 칸 |
| 노음 | 백도? 뒤로 갈 칸 수는 미정 |

던지는 사람이 판을 보고 양을 한 칸으로 할지, 음을 한 칸으로 할지 정하는 생각도 있다. 그 선택에 따라 다른 행동이 어떻게 바뀌는지, 정한 규칙을 언제까지 쓰는지, 상대도 같은 규칙을 쓰는지는 다음 던지기 전에 함께 정한다. 위 표는 확정 규칙이 아니라 가지고 놀 예시다.

동전 네 결과의 확률은 같지 않다. 독립적인 공정한 동전 세 개를 사용하는 일반적인 방식에서는 소양·소음이 각각 3/8, 노양·노음이 각각 1/8이다. 아이역의 기존 대응 설정을 적용한다면 실제 게임이 어떤 규칙을 쓰는지 명확히 표시해야 한다.

## 05. 걷다가 점프하고 미끄러지기

상대와 마주쳐 잡고 잡힐 수도 있지만, 내 결과 때문에 내가 점프하거나 뒤로 미끄러질 수도 있다. 잡으러 가다가 물러나고, 도망가려다 상대와 만날 수도 있다.

팔면체 주사위의 윗면을 보고 이동하는 방식도 후보다. 나온 팔괘로 움직일지, 면마다 행동을 정할지는 미정이다. 동전과 주사위는 같은 판에서 다른 놀이를 만들 수 있는 도구다. 처음부터 둘을 한꺼번에 넣을 필요는 없다.

## 06. 징—! 반대괘로 통하는 문

반대 짝은 네 쌍이다.

| 문으로 이어지는 짝 | 고유 번호 | 자연 이미지 |
|---|---|---|
| 곤 ↔ 건 | `000 ↔ 111` | 땅 ↔ 하늘 |
| 감 ↔ 리 | `010 ↔ 101` | 물 ↔ 불 |
| 손 ↔ 진 | `110 ↔ 001` | 바람 ↔ 우레 |
| 간 ↔ 태 | `100 ↔ 011` | 산 ↔ 못 |

한쪽으로 들어가면 ‘징—!’ 하고 반대편으로 나온다. 세 효가 모두 뒤집히는 이동이며, 계산으로는 현재 고유 번호에 `111₂`를 XOR한 값이다.

문이 언제 열리는지, 같은 괘가 여러 줄에 있다면 어느 줄로 나오는지, 통과를 선택할 수 있는지는 아직 열어 둔다. ‘세 효가 다름’과 ‘말판에서 세 칸 이동’은 별개다. 도착한 문 때문에 곧바로 되돌아가는 무한 왕복이 생기지 않도록 발동 조건도 정해야 한다.

## 07. 평면 말판과 여덟 구슬 지도

이전 구상처럼 큰 화면에는 평면판을 두고, 우측 상단에는 지구본 같은 작은 여덟 구슬 지도를 놓고 싶다. 내 위치와 상대 위치가 함께 보이고, 말판에서 움직이면 입체에서도 위치가 바뀐다.

여러 줄에 같은 팔괘가 반복된다면 팔괘 번호만으로는 지금 밟은 칸을 구별할 수 없다. 줄이나 진행 단계도 구분해야 하고, 서로 다른 칸에서 같은 괘를 밟은 두 사람을 어떻게 보여 줄지도 생각해야 한다. 아직 구현 방법을 확정한 것은 아니다.

## 08. 놀면서 익숙해지는 팔괘

칸을 보며 움직이고 문을 타는 동안 이름과 괘상, 자연 이미지와 반대 짝을 함께 익힌다. ‘저 물은 감이고, 반대 문은 리·불이구나’ 하고 알게 되는 것이다. 기존 팔괘 데이터와 여덟 아이콘을 재료로 쓸 수 있다.

짧은 소리와 움직임을 곁들이되, 매번 설명문을 읽어야 하는 놀이가 되지는 않았으면 한다. 새 효과는 아이역의 창작 게임 규칙으로 구분한다. 전통 팔괘의 성질이 반드시 그렇게 작동한다는 뜻은 아니다.

## 09. 공통규칙과 변규칙

게임 하나를 만들어 놀다가 다른 게임을 만들어 본다. 말잡기와 출발칸 복귀는 공통규칙이 될 수도 있다. 던질 도구, 한두세 칸의 배정, 백도와 문, 승패는 게임마다 바꾸어 볼 수도 있다.

지금 판이 어떤 규칙을 쓰는지 남기고, 바꿀 때는 다음 던지기 전에 합의한다. 모든 갈래를 미리 완성하려는 것이 아니라 함께 놀면서 놀이를 발명하는 것이다. 도착 놀이, 사다리식 결과 놀이, 점심쏘기는 결국 서로 다른 규칙이 필요할 수 있다. 동전이나 주사위를 쓴다는 이유만으로 전체 게임의 확률이 공평해지는 것도 아니다.

## 10. 나중에는 접어 보고, 예순네 괘로

바닥에서 놀던 판을 들어 접으면 입체 말판이 되는 상상도 해 본다. 종이 전개도로 시험하고, 나중에는 3D 프린터로 조각과 경첩을 만들 수도 있다. 여러 줄로 반복한 판 전체가 자동으로 정팔면체 하나로 접히는 것은 아니다.

2탄은 여전히 **64괘 게임 상상 — 커밍쑨, 일정 미정**이다. 64면인 입체나 64개 영역을 가진 공간 말판은 후보이지 확정된 구조가 아니다. 첫 2D 팔괘 놀이 전에 이 숙제를 모두 풀 필요는 없다.

## 개발 대화용 생각창고

**대화에서 잡힌 방향**

- 출발은 놀 수 있는 2D 팔괘판이며, 만들고 놀면서 규칙을 정한다.
- 혼자·컴퓨터와·둘이서 하는 모드를 생각한다.
- 두 사람은 가위바위보로 하늘·땅 출발점을 고르고 마주 달린다.
- 상대 칸에 도착하면 잡고, 잡힌 말은 자기 출발점으로 돌아간다.
- 이름·괘상·자연 아이콘을 함께 보여 준다.
- 반대괘 문과 2D·3D 위치 연결을 놀이 요소로 시험한다.

**첫 판을 그리면서 정할 것**

- 세 줄 또는 네 줄, 삼각형 배치와 길, 줄 사이 이동
- 첫 도구: 동전 세 개 또는 팔면체 주사위
- 규칙 선택의 적용 범위, 백도 거리, 끝칸 초과, 차례와 승리 조건
- 문 발동·출구 줄·말잡기 처리 순서·무한 왕복 방지
- 혼자 놀이 목표, 컴퓨터 선택, 둘이 하는 판의 균형
- PWA 화면, 접근 가능한 조작, 오프라인 자료와 추후 온라인 연결

**이번 작업 범위:** 이 Markdown 문서만 저장·업로드한다. 게임 코드·홈 메뉴·새 PWA 동작은 만들지 않는다. 이후 JJDD·로드와 함께 본게임 개발을 진행한다.

---

이 문서는 JJDD의 구상과 대화를 바탕으로 SHANA(GPT)가 작성하고 영문화했습니다. 구체적인 규칙과 구현은 아직 확정되지 않았습니다.
