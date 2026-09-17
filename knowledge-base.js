// All chatbot answers come only from this file — no external LLM or API calls.
// Content is based on mahjong_teacher_system_prompt.md, corrected and extended by
// mahjong_technical_reference.md (the project's ground-truth source — see CLAUDE.md).
// Keep all three in sync when one changes.

const WELCOME_MESSAGE =
  "Hi! I'm your American Mahjong (NMJL) teacher. Ask me things like " +
  "\"what do I need to play?\", \"how do I set up the table?\", \"what's the Charleston?\", " +
  "\"how does a turn work?\", \"how do jokers work?\", \"how do I pick a hand?\", " +
  "\"how is the card organized?\", \"how does scoring work?\", or \"how do I win?\" " +
  "Type \"topics\" any time to see this list again.";

const FALLBACK_MESSAGE =
  "I don't have an answer for that in my notes yet — I only know what's in my " +
  "Mahjong knowledge base, not a general AI. Try asking about: equipment, table setup, " +
  "seating and East, dealing, the Charleston, taking a turn, jokers, picking a hand, " +
  "the NMJL card's structure, scoring, or winning. Type \"topics\" to see the list again.";

const KNOWLEDGE_BASE = [
  {
    id: "equipment",
    title: "What's Needed to Play",
    keywords: ["need", "needed", "equipment", "tiles", "tile", "set", "rack", "racks",
      "dice", "players", "how many", "supplies", "152", "inventory"],
    content:
      "- 4 players (standard game; 3-player variants exist but are less common).\n" +
      "- A 152-tile set (160 if you include optional flower tiles, which aren't needed for " +
      "standard play): Bamboo 1-9, Character/crak 1-9, and Dot 1-9, 4 copies each (36 tiles " +
      "per suit, 108 total); Winds N/E/W/S, 4 copies each (16 tiles); Dragons Red/Green/White, " +
      "4 copies each (12 tiles); and 8 Jokers — 152 total.\n" +
      "- 4 racks (trays with a ledge) so each player can stand their tiles upright, hidden " +
      "from opponents, and see their own hand at a glance.\n" +
      "- The current year's NMJL card, one per player ideally.\n" +
      "- 2 dice, used by East to find the wall break point."
  },
  {
    id: "table-setup",
    title: "Setting Up the Table",
    keywords: ["table", "setup", "set up", "wall", "walls", "boneyard", "shuffle", "build",
      "stack", "square"],
    content:
      "1. All 152 tiles are shuffled face-down and mixed thoroughly.\n" +
      "2. Each of the 4 players builds their own wall directly in front of them: " +
      "152 tiles ÷ 4 players = 38 tiles per player, arranged 19 tiles long x 2 tiles high.\n" +
      "3. The four players' walls are pushed together into a hollow square in the center " +
      "of the table, with each player's wall forming one side.\n" +
      "4. This square of walls is the shared \"boneyard\" — tiles are drawn from it as the " +
      "game progresses, and the game ends in a draw (\"wall game\") if it's exhausted with " +
      "no winner."
  },
  {
    id: "east-seating",
    title: "Designating East and Initial Seating",
    keywords: ["east", "seat", "seating", "dealer", "wind", "south", "west", "north",
      "rotate", "rotation", "who goes first"],
    content:
      "East is the dealer position and goes first. Common methods to determine who starts " +
      "as East: rolling dice (highest roll), or drawing tiles until someone draws an East " +
      "wind tile — groups vary here, so just agree on one method before starting.\n\n" +
      "Seats are labeled East, South, West, North going counter-clockwise around the table " +
      "from East.\n\n" +
      "After the first hand, East's position typically passes to the next player " +
      "counter-clockwise (to East's right) for the next hand, regardless of who won. That's " +
      "the common convention, but some groups let a winning East stay East for another hand " +
      "— worth agreeing on up front."
  },
  {
    id: "dealing",
    title: "Breaking the Wall and Dealing",
    keywords: ["break", "breaking", "deal", "dealing", "roll", "13 tiles", "14 tiles",
      "draw tiles", "start hand", "break point"],
    content:
      "After walls are built, East rolls both dice. The sum is counted as tiles in from the " +
      "right end of East's own wall (not a different player's wall) — that's the break " +
      "point, and dealing starts there.\n\n" +
      "Dealing proceeds counter-clockwise from the break point in rounds of 4 tiles per " +
      "player until everyone holds 12 tiles. Each player then takes 1 more tile to reach 13, " +
      "and East takes one additional tile on top of that to start with 14 (since East goes " +
      "first and discards immediately after picking).\n\n" +
      "Direction of play for the rest of the hand is also counter-clockwise (turn passes to " +
      "the right) — a mahjong-wide convention, not specific to American rules."
  },
  {
    id: "charleston",
    title: "The Charleston",
    keywords: ["charleston", "pass", "passing", "courtesy"],
    content:
      "The Charleston happens before any drawing/discarding, in this order:\n" +
      "1. First Charleston (mandatory): pass 3 tiles right, then 3 across, then 3 left.\n" +
      "2. Second Charleston (mandatory): repeat the identical sequence — 3 right, 3 across, " +
      "3 left. That's 6 mandatory 3-tile passes total.\n" +
      "3. Optional Courtesy pass: if everyone agrees, players simultaneously pass 1-3 tiles " +
      "directly across the table. It can be skipped or done with fewer tiles if the group " +
      "doesn't fully agree.\n" +
      "Each pass happens simultaneously — everyone selects and reveals their tiles before " +
      "any tiles actually move.\n\n" +
      "What to pass: tiles that don't support any hand pattern you're considering — isolated " +
      "singles, tiles in a suit you're not using, tiles that don't extend a pair or partial " +
      "set you hold. Never pass Jokers. Be cautious passing dragons, winds, or number tiles " +
      "you might want if you're unsure which hand to commit to.\n\n" +
      "Also pay attention to what's passed TO you — it tells you what other players don't " +
      "need, which can hint at what hands they're building."
  },
  {
    id: "turn-structure",
    title: "Turn Structure During Play",
    keywords: ["turn", "play", "discard", "pung", "kong", "quint", "call"],
    content:
      "Turn order runs East → South → West → North → East... (counter-clockwise).\n\n" +
      "Each turn: draw (or claim) a tile, optionally expose a meld, then discard one tile " +
      "face-up where everyone can see it before the next turn begins.\n\n" +
      "Any player may claim a discarded tile — not only the player to their right — by " +
      "calling it (\"Call!\") to complete an exposed pung (3 of a kind), kong (4 of a kind), " +
      "or quint (5 of a kind, only possible with Jokers filling in). The caller then " +
      "discards next, and play resumes counter-clockwise from them. Some hands on the NMJL " +
      "card are marked \"C\" for concealed-only and can never be completed with a claimed/" +
      "exposed meld.\n\n" +
      "What to discard: tiles that don't fit your chosen hand(s) first; if you're still " +
      "deciding between 2-3 candidate hands, discard what's useless to all of them; late in " +
      "a hand, avoid discarding a tile you've seen an opponent collect via exposed melds, " +
      "since it likely completes their hand."
  },
  {
    id: "joker-rules",
    title: "How Jokers Work",
    keywords: ["joker", "jokers", "substitute", "exchange", "swap"],
    content:
      "Jokers can substitute for almost any tile inside a pung, kong, or quint (any " +
      "3-or-more-of-a-kind grouping).\n\n" +
      "Two hard limits: a Joker can never complete a pair (the \"eyes\" must be a natural, " +
      "non-Joker tile), and Jokers can't be used at all in \"Singles and Pairs\" hands on the " +
      "card.\n\n" +
      "Joker exchange: if an opponent has an exposed meld that includes a Joker, and you're " +
      "holding the natural tile that Joker is standing in for, you can trade your natural " +
      "tile for their Joker on your own turn — you take the Joker into your hand, and the " +
      "opponent's exposed meld keeps the same size/composition, just with your tile in place " +
      "of the Joker."
  },
  {
    id: "picking-hand",
    title: "How to Pick a Hand From the Card",
    keywords: ["pick", "choose", "which hand", "strategy"],
    content:
      "After the Charleston, look at your 13 (or 14, for East) tiles: which suits do you " +
      "have the most of, do you already have any pairs or three-of-a-kinds, and how many " +
      "Jokers do you hold (more Jokers means you can realistically attempt harder, more " +
      "exposed hands).\n\n" +
      "Narrow to 2-3 candidate hands early rather than committing to just one — flexibility " +
      "lets you adapt as more tiles are seen. Favor hands that appear in multiple variations " +
      "on the card, since more paths to completion means more flexibility, and avoid " +
      "committing early to hands that need 4 copies of one rare tile. Prioritize hands " +
      "you're already close to, and factor in point value and whether a concealed " +
      "(self-drawn only, no calls) version is realistically achievable, since concealed " +
      "hands usually score more.\n\n" +
      "Conserve your Jokers for harder combinations rather than spending them on easy, " +
      "already-achievable sets. As the hand progresses, narrow down to a single target hand " +
      "once it's clear which one is closest to complete."
  },
  {
    id: "hand-card-structure",
    title: "How the NMJL Card Is Organized",
    keywords: ["card", "cards", "sections", "consecutive run", "singles and pairs",
      "winds-dragons", "like numbers", "annual", "hand list", "concealed only"],
    content:
      "The NMJL card is published annually — it changes every April 1st — and lists every " +
      "valid winning hand for that year, roughly 40-50 patterns.\n\n" +
      "Hands are grouped into sections such as: current-year-number hands (e.g. this year's " +
      "digits), Consecutive Run, 369, Like Numbers, Quints, Singles and Pairs, and " +
      "Winds-Dragons.\n\n" +
      "Each individual hand definition on the card specifies: the required suits, the exact " +
      "tile pattern, whether it's allowed to be exposed or must stay fully concealed (marked " +
      "\"C\"), how many Jokers (if any) may be substituted in, and its point value.\n\n" +
      "Without the current-year card loaded into this knowledge base, I can't give you exact " +
      "hand patterns — only this general structure."
  },
  {
    id: "winning",
    title: "Winning",
    keywords: ["win", "winning", "mahjong", "wall game", "draw"],
    content:
      "A player wins by matching their 14 tiles (their 13 plus the winning tile, drawn or " +
      "claimed) exactly against one hand definition on the card — correct tile pattern, " +
      "correct suits, correct Joker count/placement, and correct exposed-or-concealed " +
      "status — then calling \"Mahjong.\"\n\n" +
      "Hands have fixed point values printed on the card; there's no partial credit for an " +
      "unfinished hand.\n\n" +
      "If the wall runs out with no winner, it's a draw (\"wall game\") and no one scores; " +
      "East usually stays East again in that case, but confirm this is common practice " +
      "rather than universal."
  },
  {
    id: "scoring",
    title: "Scoring",
    keywords: ["score", "scoring", "points", "pay", "payment", "how much is it worth"],
    content:
      "Point values are fixed per hand and roughly tiered by difficulty:\n" +
      "- 25 pts — simplest hands\n" +
      "- 30 pts — moderate difficulty\n" +
      "- 35-40 pts — complex hands\n" +
      "- 50 pts — difficult, often concealed-only\n" +
      "- 75+ pts — rare, highly specific patterns\n\n" +
      "When someone wins, they collect their hand's point value from each of the other " +
      "three players individually — it's not a shared pot — so the total points changing " +
      "hands is the hand's value x3."
  },
  {
    id: "variations",
    title: "Where Rules Vary by Table",
    keywords: ["vary", "variation", "different", "house rules", "depends", "honest"],
    content:
      "A few things genuinely differ by set instructions and by table, so don't treat any " +
      "single answer as universal:\n" +
      "- Whether a winning East stays East for the next hand\n" +
      "- Some Courtesy pass variations (exactly how many tiles, whether it happens at all)\n\n" +
      "Also: without the current-year NMJL card loaded into this knowledge base, I can't give " +
      "you exact hand patterns or point values — I can only teach the general structure of " +
      "how the card is organized."
  }
];
