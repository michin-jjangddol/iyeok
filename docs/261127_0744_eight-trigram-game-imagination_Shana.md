# Imagining an Eight-Trigram Game

iYeok Idea Archive  
Status: imagination / concept draft — not an implemented game  
Written: 2026-11-27 KST

## 01. From Folding a Line to Entering a World

We lined up the trigrams in iYeok binary order:

`000 Earth · 001 Thunder · 010 Water · 011 Lake | 100 Mountain · 101 Fire · 110 Wind · 111 Heaven`

Fold the line at the middle, and opposite partners meet. All three lines change between each pair. On the eight-bead cube, these partners already occupy opposite vertices through the center.

Then I imagined standing inside the beads myself. Heaven and Earth became places I could approach. What if entering Earth took me through a portal and out at Heaven?

“Zing—!” A passage into another world, like a moongate in Ultima. This is a rule for an imagined game world, not a claim about the physical universe or a traditional divination rule.

## 02. Four Pairs of Doors

| Door pair | Binary IDs | Nature |
|---|---|---|
| Gon ↔ Geon | `000 ↔ 111` | Earth ↔ Heaven |
| Gam ↔ Ri | `010 ↔ 101` | Water ↔ Fire |
| Son ↔ Jin | `110 ↔ 001` | Wind ↔ Thunder |
| Gan ↔ Tae | `100 ↔ 011` | Mountain ↔ Lake |

Every passage flips all three bits: `destination = current XOR 111₂`. Going through the same opposite-pair rule twice returns to the starting trigram. The binary values in each pair add to seven.

## 03. A Flat Board and a Little Globe

The main playing area is a flat eight-trigram board. A small globe-like eight-bead map sits at the upper right, showing my position and the other player's position at the same time.

When a piece moves on the flat board, its marker moves on the spatial map too. They show the same game state from two views. A portal could show a brief path through the center from one opposite bead to the other.

How the board is unfolded, how large the miniature map should be on a phone, and how pieces overlap remain open design questions.

## 04. Throwing a Die

Perhaps we throw an eight-sided die. Move one space forward, one back, two forward, two back—and perhaps a special result takes us through a portal.

The important distinction is between **board steps** and **changed lines**. Three steps along an arbitrary flat route do not necessarily reach the opposite trigram. If “three means zing” becomes a rule, it should be defined as an explicit portal action that flips three lines, not silently treated as three ordinary steps.

The number of die faces, their assignments, probabilities, forward direction and handling of the board's ends are not decided. Earlier examples of extra die faces were suggestions, not adopted rules.

## 05. Playing First, Learning Along the Way

Each space brings together its name, three-line symbol and nature icon. As we play, these become familiar together.

“Earth took me to Heaven.” “Water leads to Fire.” “Can I catch up through the Wind–Thunder door?”

Short movement, sound and visual cues could reinforce recognition: a ripple for Water, a flicker for Fire, a breeze for Wind. Such cues are iYeok's playful interpretations; they do not define every meaning of a trigram.

The hope is that people can begin without memorizing the trigrams, then recognize the names, symbols, nature images and opposite partners through repeated play.

## 06. One Board, Different Reasons to Play

Possible modes include a race to a destination, a ladder-style game that links starts to outcomes, or a lighthearted, mutually agreed “who buys lunch?” round.

These are possibilities, not finished rules. Winning conditions, fairness, game length and player count need to be tried on an actual board. A die-driven lunch selector should not be presented as an equal-chance draw unless its whole rule set has been checked.

## 07. A Small First Prototype

A useful first experiment would let two people take turns on one device. Keep one shared state for the flat board and eight-bead map, and test normal moves and opposite-pair portals.

Reuse the existing trigram IDs, symbols, registered icons and suitable parts of the bead display. A PWA can host this kind of game; offline availability still requires explicit asset and cache work. Remote multiplayer would require additional communication and state synchronization.

This is a proposed starting point, not authorization to implement it now. The next step is to agree on a playable movement rule and try whether it is fun.

## 08. The Meeting of 2D and 3D

I want the flat board and the spatial world to meet. A move made in two dimensions can become a journey seen in three dimensions.

The miniature globe should help me find my way, while the flat board makes taking a turn simple. Their connection is the central idea; extra effects can grow around it after the basic play works.

## 09. Part Two: Imagining a 64-Hexagram Game

**Coming soon—no date, and perhaps quite a while away.**

Once we have played with eight trigrams, I would like to imagine a game with sixty-four hexagrams. Two trigrams meet to make six lines; perhaps the game world can grow with them.

We have not decided its board, dimensional representation, moves or winning conditions. Sixty-four hexagrams do not mean simply adding more vertices to the same cube. For now, this is the title of a possible sequel, not a second implementation project.

## Production Notebook

- Core idea: connected 2D board and 3D eight-bead map.
- Shared markers: my piece and the other player's piece.
- Portal: enter a trigram and emerge at its three-line opposite.
- Learning: names, symbols, nature icons and opposite pairs become familiar through play.
- Open: die rules, route, endings, win conditions, display layout, sound, offline support and future networking.
- First scene to sketch: a piece enters Earth, “zing,” and appears at Heaven in both views.
- Part two: **Imagining a 64-Hexagram Game**, schedule undecided.

This document records J's ideas and conversations, written and translated by Shana (GPT). It does not authorize code changes or establish historical or physical claims.

---
<br>
<br>

# 8괘 게임 상상

아이역 생각창고  
상태: 상상·구상 초안 — 게임 구현 전  
작성일: 2026-11-27 한국시간

## 01. 반 접기에서 세상 안으로

아이역 이진 번호 순서로 팔괘를 놓아 보았다.

`곤 000 · 진 001 · 감 010 · 태 011 | 간 100 · 리 101 · 손 110 · 건 111`

가운데에서 반을 접으면 반대 짝이 만난다. 짝끼리는 세 효가 모두 반대다. 여덟 구슬을 놓은 정육면체에서도 이미 그 짝은 중심을 사이에 두고 마주 보는 꼭짓점에 있다.

그러다 그 구슬들 사이에 내가 들어서면 어떨까 생각했다. 하늘과 땅이 내가 다가갈 수 있는 장소가 된다. 땅으로 들어갔는데 문을 지나 하늘에서 나오면 어떨까?

“징—!” 울티마의 문게이트처럼 다른 세상으로 옮겨지는 것이다. 이것은 상상 속 게임 공간의 규칙이다. 실제 우주의 구조나 전통 점법을 설명하는 주장은 아니다.

## 02. 네 쌍의 문

| 문으로 이어지는 짝 | 이진 고유 번호 | 자연 이미지 |
|---|---|---|
| 곤 ↔ 건 | `000 ↔ 111` | 땅 ↔ 하늘 |
| 감 ↔ 리 | `010 ↔ 101` | 물 ↔ 불 |
| 손 ↔ 진 | `110 ↔ 001` | 바람 ↔ 우레 |
| 간 ↔ 태 | `100 ↔ 011` | 산 ↔ 못 |

문을 지나면 세 효가 모두 뒤집힌다. 계산으로는 `도착 괘 = 현재 괘 XOR 111₂`다. 같은 반대 짝 이동을 두 번 하면 출발한 괘로 돌아온다. 각 짝의 이진 값을 더하면 모두 7이다.

## 03. 평면 말판과 작은 지구본

큰 화면에는 평면 팔괘 말판을 둔다. 우측 상단에는 지구본처럼 둥글게 보이는 작은 여덟 구슬 지도를 둔다. 내 위치와 상대방 위치를 함께 표시한다.

평면에서 말이 움직이면 입체 지도에서도 그 사람의 위치가 움직인다. 서로 다른 두 게임이 아니라 같은 상태를 두 모습으로 보는 것이다. 반대괘 문을 통과할 때는 구의 중심을 가로지르는 경로가 잠깐 보이면 재미있겠다.

말판을 어떻게 펼칠지, 모바일에서 작은 지도를 얼마나 크게 둘지, 말이 겹칠 때 어떻게 보일지는 아직 정하지 않았다.

## 04. 주사위를 던져 볼까

팔면체 주사위를 던져 볼까? 한 칸 앞으로, 한 칸 뒤로, 두 칸 앞으로, 두 칸 뒤로. 그리고 어떤 결과에서는 문을 타고 순간이동하는 것이다.

여기서는 **말판의 칸 수**와 **달라진 효의 개수**를 구분해야 한다. 임의로 늘어놓은 길에서 세 칸 간다고 반대괘가 되는 것은 아니다. ‘3이면 징—!’을 규칙으로 삼는다면, 세 효를 뒤집는 문 이동이라고 명확히 정해야 한다.

주사위 면 수와 배정, 확률, 앞뒤 방향, 말판 끝 처리 방식은 아직 미정이다. 대화 중 나온 추가 주사위 면의 예시는 제안이며 채택한 규칙은 아니다.

## 05. 놀다가 알아지는 것들

말판의 한 칸에는 이름과 괘상, 자연 아이콘이 함께 보인다. 움직일 때마다 그것들이 같이 눈에 익는다.

“곤으로 들어갔더니 건에서 나왔네.”
“감으로 가면 리로 이어지는구나.”
“손진 문을 타면 상대를 따라잡겠는데?”

물에서는 작은 파문이 생기고, 불에서는 불길이 일렁이고, 바람에서는 부드러운 흐름이 보일 수도 있다. 이런 움직임과 소리는 아이역에서 만든 놀이 표현이다. 팔괘의 모든 뜻을 그 연출 하나로 정하지 않는다.

팔괘를 외운 뒤 시작하는 게임이 아니라, 몇 판 놀다 보니 이름과 괘상, 자연 이미지와 반대 짝이 익숙해지는 게임을 만들고 싶다.

## 06. 같은 판에서 다른 놀이

먼저 목적지에 도착하는 놀이도 가능하겠다. 사다리게임처럼 각자의 출발점이 어떤 결과로 이어지는지 볼 수도 있다. 서로 동의하고 가볍게 ‘오늘 점심은 누가 쏠까’를 정하는 놀이도 생각해 볼 수 있다.

아직은 가능성이다. 승패와 공정성, 한 판의 길이, 참여 인원은 실제 판을 가지고 놀며 정해야 한다. 주사위를 사용해도 전체 규칙을 확인하기 전에는 모두가 같은 확률로 뽑힌다고 말할 수 없다.

## 07. 처음에는 작은 판 하나

첫 실험은 한 기기에서 두 사람이 번갈아 해 보면 좋겠다. 평면 말판과 입체 지도가 하나의 위치 상태를 함께 읽게 하고, 일반 이동과 반대 짝 문을 시험한다.

기존 팔괘 고유 번호와 괘상, 등록된 자연 아이콘, 구슬 표현에서 재사용할 수 있는 부분을 활용한다. 이런 게임은 PWA에서도 가능하다. 오프라인 이용에는 별도로 자료와 캐시를 준비해야 한다. 온라인에서 떨어져 있는 상대와 하려면 통신과 상태 동기화도 필요하다.

이것은 시작 방법의 제안이며 지금 게임 구현을 승인한 문서는 아니다. 먼저 한 판 놀 수 있는 이동 규칙을 함께 정하고 재미를 확인하고 싶다.

## 08. 2D와 3D가 만나는 게임

나는 평면 말판과 입체 공간이 만나는 게임을 만들고 싶다. 평면에서 한 번 움직인 일이 입체에서는 하나의 여정으로 보이는 것이다.

작은 지구본은 내가 어디에 있는지 알려 주고, 평면 말판은 차례를 진행하기 쉽게 해 준다. 그 연결이 먼저다. 재미있는 연출은 기본 놀이가 돌아가는 것을 보면서 더해 가면 된다.

## 09. 2탄 — 64괘 게임 상상

**커밍쑨. 날짜는 미정. 언제가 될지는 모른다. ㅋㅋ**

팔괘로 놀아 본 다음에는 예순네 괘의 게임도 상상해 보고 싶다. 두 팔괘가 만나 여섯 효가 되듯이, 놀이의 세계도 넓어질 수 있지 않을까?

아직 말판도, 차원 표현도, 이동과 승패 규칙도 정하지 않았다. 예순네 괘라고 같은 정육면체에 꼭짓점만 더 붙이는 것은 아니다. 우선 다음 상상의 제목으로 남겨 둔다. 별도의 2탄 게임을 지금 만드는 것은 아니다.

## 제작 생각창고

- 중심 구상: 평면 말판과 입체 여덟 구슬 지도의 연결
- 위치 표시: 나와 상대방의 말
- 문 이동: 들어간 괘에서 세 효가 모두 반대인 짝으로 나오기
- 학습: 이름·괘상·자연 이미지·반대 짝을 놀면서 익히기
- 미정: 주사위 규칙, 길, 끝 처리, 승패, 화면 배치, 소리, 오프라인 지원, 향후 온라인 연결
- 먼저 그려 볼 장면: 곤으로 들어간 말이 ‘징—!’ 하고 건으로 나오며 두 화면이 같이 바뀐다.
- 2탄 예고: **64괘 게임 상상**, 일정 미정

이 문서는 J의 구상과 대화를 바탕으로 샤나(GPT)가 작성하고 영문화했습니다. 이 문서 자체가 코드 변경을 승인하거나 역사적·물리적 주장을 확정하는 것은 아닙니다.
