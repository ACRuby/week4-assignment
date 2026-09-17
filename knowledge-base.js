// All chatbot answers come only from this file — no external LLM or API calls.
// Content is drawn directly from mahjong_teacher_system_prompt.md; keep them in sync.

const WELCOME_MESSAGE =
  "Hi! I'm your American Mahjong (NMJL) teacher. Ask me things like " +
  "\"what do I need to play?\", \"how do I set up the table?\", \"what's the Charleston?\", " +
  "\"how does a turn work?\", \"how do I pick a hand?\", or \"how do I win?\" " +
  "Type \"topics\" any time to see this list again.";

const FALLBACK_MESSAGE =
  "I don't have an answer for that in my notes yet — I only know what's in my " +
  "Mahjong knowledge base, not a general AI. Try asking about: equipment, table setup, " +
  "seating and East, dealing, the Charleston, taking a turn, picking a hand, or winning. " +
  "Type \"topics\" to see the list again.";

const KNOWLEDGE_BASE = [
  {
    id: "equipment",
    title: "What's Needed to Play",
    keywords: ["need", "needed", "equipment", "tiles", "tile", "set", "rack", "racks",
      "dice", "card", "players", "how many", "supplies", "152"],
    content:
      "- 4 players (standard game; 3-player variants exist but are less common).\n" +
      "- A 152-tile set: 3 suits (bams/dots/craks) numbered 1-9, 4 copies each (108 tiles), " +
      "4 winds x4 copies (16), 3 dragons x4 copies (12), and 8 Jokers — 152 total. " +
      "Standard American sets do not use flower tiles.\n" +
      "- 4 racks (trays with a ledge) so each player can stand their tiles upright, hidden " +
      "from opponents, and see their own hand at a glance.\n" +
      "- The current year's NMJL card, one per player ideally.\n" +
      "- Dice (2 or 3, house-dependent) for determining seating/wall break."
  },
  {
    id: "table-setup",
    title: "Setting Up the Table",
    keywords: ["table", "setup", "set up", "wall", "walls", "boneyard", "shuffle", "build",
      "stack", "square"],
    content:
      "1. All 152 tiles are shuffled face-down and mixed thoroughly.\n" +
      "2. Each of the 4 players builds their own wall directly in front of them: " +
      "152 tiles ÷ 4 players = 38 tiles per player, stacked two tiles high, so each wall " +
      "is 19 stacks of 2 tiles wide.\n" +
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
      "draw tiles", "start hand"],
    content:
      "After walls are built, East rolls the dice. The total determines which wall to break " +
      "and how many stacks in from the right edge the break point is (the exact counting " +
      "convention varies by set/house rules — follow your physical set's instructions).\n\n" +
      "Dealing proceeds counter-clockwise starting from the break point: each player takes " +
      "2 tiles at a time from the wall until each player has 13 tiles, then East takes one " +
      "additional tile to start with 14 (since East goes first and discards immediately " +
      "after picking).\n\n" +
      "Direction of play for the rest of the hand is also counter-clockwise (turn passes to " +
      "the right) — a mahjong-wide convention, not specific to American rules."
  },
  {
    id: "charleston",
    title: "The Charleston",
    keywords: ["charleston", "pass", "passing", "courtesy"],
    content:
      "Before regular play starts, players pass tiles in a fixed sequence to trade away " +
      "tiles they don't need: first pass 3 tiles to the right, then 3 across, then 3 to the " +
      "left (this first full Charleston is mandatory). A second, optional Charleston of " +
      "smaller passes (the \"Courtesy\" pass, usually up to 3 tiles by mutual agreement) may " +
      "follow if everyone agrees to continue.\n\n" +
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
    keywords: ["turn", "play", "discard", "pung", "kong", "joker", "jokers", "call"],
    content:
      "Each turn: draw one tile from the wall, then discard one tile face-up where everyone " +
      "can see it.\n\n" +
      "Any player may call \"Pung\" or \"Kong\" on a discarded tile out of turn (not only from " +
      "the player to their right) to complete an exposed three- or four-of-a-kind; the " +
      "caller then discards next, and play resumes to that caller's right.\n\n" +
      "Jokers substitute for almost any tile in an exposed set or run, but generally cannot " +
      "be used in single/lone positions or in a pair (per current card rules) — this trips " +
      "up a lot of beginners, so keep it in mind.\n\n" +
      "What to discard: tiles that don't fit your chosen hand(s) first; if you're still " +
      "deciding between 2-3 candidate hands, discard what's useless to all of them; late in " +
      "a hand, avoid discarding a tile you've seen an opponent collect via exposed " +
      "pungs/kongs, since it likely completes their hand."
  },
  {
    id: "picking-hand",
    title: "How to Pick a Hand From the Card",
    keywords: ["pick", "choose", "hand", "hands", "strategy", "which hand", "card"],
    content:
      "After the Charleston, look at your 13 (or 14, for East) tiles: which suits do you " +
      "have the most of, do you already have any pairs or three-of-a-kinds, and how many " +
      "Jokers do you hold (more Jokers means you can realistically attempt harder, more " +
      "exposed hands).\n\n" +
      "Narrow to 2-3 candidate hands early rather than committing to just one — flexibility " +
      "lets you adapt as more tiles are seen. Prioritize hands you're already close to, and " +
      "factor in point value and whether a concealed (self-drawn only, no calls) version is " +
      "realistically achievable, since concealed hands usually score more.\n\n" +
      "As the hand progresses, narrow down to a single target hand once it's clear which one " +
      "is closest to complete."
  },
  {
    id: "winning",
    title: "Winning",
    keywords: ["win", "winning", "mahjong", "score", "points", "wall game", "draw"],
    content:
      "A player wins by completing an exact hand from the card and calling \"Mahjong,\" " +
      "either by drawing the final tile themselves or by calling it from another player's " +
      "discard.\n\n" +
      "Hands have fixed point values printed on the card; there's no partial credit for an " +
      "unfinished hand.\n\n" +
      "If the wall runs out with no winner, it's a draw (\"wall game\") and no one scores; " +
      "East usually stays East again in that case, but confirm this is common practice " +
      "rather than universal."
  },
  {
    id: "variations",
    title: "Where Rules Vary by Table",
    keywords: ["vary", "variation", "different", "house rules", "depends", "honest"],
    content:
      "A few things genuinely differ by set instructions and by table, so don't treat any " +
      "single answer as universal:\n" +
      "- Exact dice-roll wall-break counting conventions\n" +
      "- Whether a winning East stays East for the next hand\n" +
      "- Some Charleston/Courtesy pass variations\n\n" +
      "Also: without the current-year NMJL card loaded into this knowledge base, I can't give " +
      "you exact hand patterns or point values — I can only teach the general structure of " +
      "how the card is organized."
  }
];
