# American Mahjong — Technical Reference for Implementation
(Source: American Mahjong Guide, mahjongplaybook.com — used as ground truth
for game-logic details; where it differs from general mahjong knowledge,
this project defers to this reference. See [CLAUDE.md](CLAUDE.md) for how
this reconciles with `mahjong_teacher_system_prompt.md` and
`knowledge-base.js`.)

## Tile inventory (data model)
Total set: 152 tiles (160 if flowers are included — flowers are optional
and not required for standard play).
- Bamboo: 1-9, x4 copies = 36 tiles
- Character (crak): 1-9, x4 copies = 36 tiles
- Dot: 1-9, x4 copies = 36 tiles
- Winds: N/E/W/S, x4 copies each = 16 tiles
- Dragons: Red/Green/White, x4 copies each = 12 tiles
- Jokers: 8 tiles
- (Optional) Flowers: 8 tiles — exclude from core rules engine unless
  explicitly supporting flower-tile variants
Base playable total without flowers: 152.

## Wall construction
- Shuffle all 152 tiles face-down.
- Each of the 4 players builds one wall: 38 tiles per player, arranged 19
  tiles long x 2 tiles high.
- The four walls push together into a hollow square.
- Implementation note: model each wall as an ordered array/stack of 38
  tiles (or 19 pairs) so "counting in from the right end" for the break
  point is a simple index operation.

## Dealer determination and wall break
- Dice (2 dice) determine East/dealer.
- East rolls both dice; the resulting sum is counted as tiles from the
  right end of East's own wall to locate the break point.
- Dealing begins at that break point.

## Initial deal
- Starting from the break point, tiles are dealt counter-clockwise in
  rounds of 4 tiles per player until each player holds 12 tiles.
- Each player then receives 1 additional tile, bringing everyone to 13.
- East receives one further tile (14 total for East), since East discards
  first.
- Implementation note: this differs from the "2 tiles at a time" dealing
  pattern often described for mahjong generally — for this project, use
  the 4-at-a-time-then-1 pattern above.

## Charleston (mandatory tile-passing phase)
Sequence, all before any draw/discard play begins:
1. First Charleston: pass 3 tiles right → pass 3 tiles across → pass 3
   tiles left. (3 mandatory passes)
2. Second Charleston: repeat the identical sequence — right, across, left.
   (3 more mandatory passes)
3. Optional "Courtesy" pass: players may simultaneously agree to pass 1-3
   tiles directly across the table (not mandatory; needs group consensus
   to occur, and can be skipped or partially executed).
Total: 6 mandatory 3-tile passes + 1 optional variable pass (1-3 tiles).
Model each pass as an atomic simultaneous exchange (all 4 players select
and reveal before tiles move) rather than sequential.

## Turn structure and play direction
- Turn order: East → South → West → North → East ... (counter-clockwise).
- Each turn: draw or claim a tile → optionally expose a meld → discard one
  tile → the discard is announced/visible to all players before the next
  turn begins.

## Claiming / melding discards
- Any player may claim a discarded tile (from any other player, not only
  the player to their right) to complete an exposed pung, kong, or quint,
  by calling it verbally ("Call!").
- Claiming a tile out of turn passes the next discard obligation to the
  claiming player, and turn order resumes counter-clockwise from them.
- Some hands on the NMJL card are marked "C" (concealed only) — these
  cannot be completed via any exposed/claimed meld; validate this
  constraint against the hand definition when checking for a win.

## Joker rules (validation logic)
- Jokers substitute for almost any tile within a pung, kong, or quint
  (3+, 4+, or 5-of-a-kind groupings).
- Jokers CANNOT be used to complete a pair (the "eyes"/pair-completing
  tile must be a natural tile).
- Jokers CANNOT be used in "Singles and Pairs" section hands at all.
- Joker exchange: if an opponent has an exposed meld containing a Joker,
  and the current player holds the natural tile that Joker represents,
  the current player may exchange their natural tile for that Joker on
  their own turn (swap into their own hand, opponent's exposed meld tile
  count/composition stays the same but the Joker moves to the claiming
  player).

## Hand definitions and validation (the NMJL card)
- The card is published annually (changes April 1st each year) and lists
  every valid winning hand for that year — roughly 40-50 hand patterns.
- Hands are grouped into sections such as: current-year-number hands
  (e.g., "2024"/"2026"), Consecutive Run, 369, Like Numbers, Quints,
  Singles and Pairs, Winds-Dragons.
- Each hand definition specifies: required suits, exact tile
  values/pattern, whether exposure is allowed or it must stay concealed,
  how many (if any) Jokers may be substituted, and its point value.
- Implementation note: model the card as structured data (one record per
  hand: pattern, allowed jokers, concealed-only flag, point value) rather
  than hardcoded logic, since the card changes yearly and users will want
  to load different years/cards.

## Winning condition
- A player wins by matching their 14 tiles (13 + the winning tile, drawn
  or claimed) exactly against one hand definition on the loaded card:
  correct tile pattern, correct suits, correct joker count/placement, and
  correct exposed/concealed status.
- If the wall is exhausted (all tiles drawn) with no player declaring a
  valid hand, the round ends with no winner ("wall game" / no score).

## Scoring
Fixed point values per hand, roughly tiered by difficulty:
- 25 pts — simplest hands
- 30 pts — moderate difficulty
- 35-40 pts — complex hands
- 50 pts — difficult, often concealed-only
- 75+ pts — rare, highly specific patterns
On a win, the winning player collects their hand's point value from each
of the other three players individually (not a shared pot) — so total
points transferred = hand value x 3.

## Beginner-facing strategy heuristics (useful for a hint system or bot advisor)
- During the Charleston, keep Jokers and any pairs; pass tiles that are
  clear mismatches for likely hand candidates.
- Favor hands that appear in multiple variations on the card (more paths
  to completion = more flexibility).
- Avoid committing early to hands requiring 4 copies of a rare/single tile.
- Track discards to assess which tiles are "safe" to release without
  feeding an opponent's visible exposed melds.
- Conserve Jokers for harder combinations rather than spending them on
  easy, achievable sets.

## Notes for this project
Treat this document as the authoritative rules source for any game logic,
validators, or simulators built in this codebase. If a requirement
conflicts with a different mahjong ruleset (Chinese Classical, Riichi,
etc.), confirm with the user which ruleset applies before implementing,
since tile counts, dealing patterns, and scoring differ significantly
between them.
