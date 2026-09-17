// All chatbot answers come only from this file — no external LLM or API calls.
// Content is based on mahjong_teacher_system_prompt.md, corrected/extended by
// mahjong_technical_reference.md (the project's ground-truth source — see CLAUDE.md).
// Each entry answers ONE specific question, not a whole topic, so replies stay
// targeted. Multi-word keywords score higher than single generic words (see
// script.js), so a specific phrase match should beat a topic's generic overview
// entry when both are present in the user's message.

const WELCOME_MESSAGE =
  "Hi! I'm your American Mahjong (NMJL) teacher. Ask me specific questions like " +
  "\"how many players do I need?\", \"what's the Courtesy pass?\", \"can jokers complete a " +
  "pair?\", or \"who pays when someone wins?\" Topics I know: equipment, table setup, " +
  "seating & East, dealing, the Charleston, turns & claiming, jokers, picking a hand, " +
  "the NMJL card, winning, and scoring. Type \"topics\" any time to see this list again.";

const FALLBACK_MESSAGE =
  "I don't have an answer for that in my notes yet — I only know what's in my " +
  "Mahjong knowledge base, not a general AI. Try asking a specific question about: " +
  "equipment, table setup, seating & East, dealing, the Charleston, turns & claiming, " +
  "jokers, picking a hand, the NMJL card, winning, or scoring. Type \"topics\" to see " +
  "the list again.";

const KNOWLEDGE_BASE = [
  // ---- Equipment ----
  {
    id: "eq-players",
    title: "How Many Players?",
    keywords: ["how many players", "players", "number of players"],
    content: "4 players for a standard game. 3-player variants exist but are less common."
  },
  {
    id: "eq-tileset",
    title: "What's in the Tile Set?",
    keywords: ["152", "tile set", "tiles in the set", "how many tiles", "tile inventory",
      "bamboo", "character", "crak", "dot", "suits", "equipment"],
    content: "152 tiles total: Bamboo, Character/crak, and Dot suits numbered 1-9 with 4 " +
      "copies each (36 tiles per suit, 108 total); Winds N/E/W/S with 4 copies each (16 " +
      "tiles); Dragons Red/Green/White with 4 copies each (12 tiles); and 8 Jokers."
  },
  {
    id: "eq-flowers",
    title: "Do American Sets Use Flower Tiles?",
    keywords: ["flower", "flowers", "160"],
    content: "No — flower tiles are optional and not needed for standard American Mahjong " +
      "play. Including them brings the set to 160 tiles instead of 152."
  },
  {
    id: "eq-racks",
    title: "What Are Racks For?",
    keywords: ["rack", "racks", "tray"],
    content: "Each of the 4 players uses a rack (a tray with a ledge) to stand their tiles " +
      "upright — hidden from opponents, but easy for you to see your own hand at a glance."
  },
  {
    id: "eq-dice",
    title: "What Dice Do I Need?",
    keywords: ["dice", "how many dice"],
    content: "2 dice. East rolls them to find the wall break point at the start of each hand."
  },
  {
    id: "eq-card",
    title: "Do I Need the NMJL Card?",
    keywords: ["need the card", "need a card", "nmjl card"],
    content: "Yes — the current year's NMJL card lists every valid winning hand. One per " +
      "player is ideal so everyone can reference it during play."
  },

  // ---- Table setup ----
  {
    id: "setup-wall-build",
    title: "Building the Walls",
    keywords: ["build the wall", "build a wall", "shuffle", "wall build", "how big is the wall",
      "19", "38 tiles", "table setup", "set up the table"],
    content: "Shuffle all 152 tiles face-down, then each of the 4 players builds their own " +
      "wall directly in front of them: 38 tiles per player, arranged 19 tiles long by 2 " +
      "tiles high."
  },
  {
    id: "setup-boneyard",
    title: "What's the Boneyard?",
    keywords: ["boneyard", "bone yard", "hollow square"],
    content: "The four players' walls pushed together form a hollow square in the center of " +
      "the table — that shared square is the \"boneyard.\" Tiles are drawn from it as the " +
      "game goes on, and if it's exhausted with no winner, the game ends in a draw (a " +
      "\"wall game\")."
  },

  // ---- East / seating ----
  {
    id: "east-how-decided",
    title: "How Is East Decided?",
    keywords: ["who is east", "how is east decided", "determine east", "start as east", "east"],
    content: "Common methods: rolling dice (highest roll becomes East), or drawing tiles " +
      "until someone draws an East wind tile. Groups vary on this, so just agree on one " +
      "method before starting."
  },
  {
    id: "east-seat-layout",
    title: "How Are Seats Arranged?",
    keywords: ["seat", "seating", "seats are labeled", "south west north", "seat layout"],
    content: "Seats are labeled East, South, West, North, going counter-clockwise around the " +
      "table starting from East."
  },
  {
    id: "east-rotation",
    title: "Does East Rotate Each Hand?",
    keywords: ["rotate", "rotation", "east stay", "east again", "next east"],
    content: "Typically yes — after each hand, East passes to the next player " +
      "counter-clockwise (East's right), regardless of who won. That's the common " +
      "convention, but some groups let a winning East stay East for another hand, so it's " +
      "worth agreeing on at your table."
  },

  // ---- Dealing ----
  {
    id: "deal-break-point",
    title: "Finding the Wall Break Point",
    keywords: ["break point", "breaking the wall", "roll the dice", "wall break"],
    content: "East rolls both dice, and the sum is counted as tiles in from the right end of " +
      "East's own wall (not a different player's wall) — that's the break point where " +
      "dealing starts."
  },
  {
    id: "deal-mechanics",
    title: "How Tiles Are Dealt",
    keywords: ["how are tiles dealt", "dealing mechanics", "12 tiles", "13 tiles", "14 tiles",
      "deal tiles", "dealing", "deal"],
    content: "Dealing goes counter-clockwise from the break point in rounds of 4 tiles per " +
      "player until everyone has 12. Each player then takes 1 more to reach 13, and East " +
      "takes one additional tile on top of that to start with 14, since East discards first."
  },
  {
    id: "deal-direction",
    title: "Which Direction Does Play Go?",
    keywords: ["which direction", "counter-clockwise", "play direction", "turn passes"],
    content: "Counter-clockwise — turn passes to the right. This is a mahjong-wide " +
      "convention, not specific to American rules."
  },

  // ---- Charleston ----
  {
    id: "charleston-first",
    title: "The First Charleston",
    keywords: ["first charleston", "charleston"],
    content: "Mandatory: pass 3 tiles to the right, then 3 across, then 3 to the left."
  },
  {
    id: "charleston-second",
    title: "The Second Charleston",
    keywords: ["second charleston"],
    content: "Also mandatory: repeat the identical sequence as the first Charleston — 3 " +
      "right, 3 across, 3 left. That's 6 mandatory 3-tile passes in total across both " +
      "Charlestons."
  },
  {
    id: "charleston-courtesy",
    title: "The Courtesy Pass",
    keywords: ["courtesy", "courtesy pass"],
    content: "Optional, after the two mandatory Charlestons: if everyone agrees, players " +
      "simultaneously pass 1-3 tiles directly across the table. It can be skipped, or done " +
      "with fewer tiles, if the group doesn't fully agree."
  },
  {
    id: "charleston-what-to-pass",
    title: "What to Pass in the Charleston",
    keywords: ["what to pass", "what should i pass"],
    content: "Pass tiles that don't support any hand pattern you're considering: isolated " +
      "singles, tiles in a suit you're not using, or tiles that don't extend a pair or " +
      "partial set you hold. Never pass Jokers, and be cautious passing dragons, winds, or " +
      "number tiles you might want if you're unsure which hand to commit to."
  },
  {
    id: "charleston-reading-passes",
    title: "Reading What's Passed to You",
    keywords: ["passed to me", "passed to you", "reading passes", "what others pass"],
    content: "Pay attention to what other players pass you — it tells you what they don't " +
      "need, which can hint at what hands they're building."
  },

  // ---- Turn structure & claiming ----
  {
    id: "turn-sequence",
    title: "What Happens on Your Turn",
    keywords: ["my turn", "what happens on a turn", "turn sequence", "draw and discard",
      "turn", "turns"],
    content: "Draw (or claim) a tile, optionally expose a meld, then discard one tile " +
      "face-up where everyone can see it before the next turn begins."
  },
  {
    id: "turn-order",
    title: "Turn Order",
    keywords: ["turn order"],
    content: "East → South → West → North → East... going counter-clockwise."
  },
  {
    id: "turn-claiming",
    title: "Claiming a Discard",
    keywords: ["claim", "claiming", "call a tile", "pung", "kong", "quint"],
    content: "Any player can claim a discarded tile — not just the player to their right — " +
      "by calling it (\"Call!\") to complete an exposed pung (3 of a kind), kong (4 of a " +
      "kind), or quint (5 of a kind, only possible using Jokers)."
  },
  {
    id: "turn-after-claim",
    title: "After Claiming a Discard",
    keywords: ["after claiming", "after i claim", "who discards next"],
    content: "The player who claimed the tile discards next, and play resumes " +
      "counter-clockwise from them."
  },
  {
    id: "turn-concealed-marker",
    title: "What Does \"C\" Mean on a Hand?",
    keywords: ["concealed only", "marked c", "what does c mean", "c mean"],
    content: "Hands marked \"C\" on the card must stay fully concealed — they can never be " +
      "completed using a claimed or exposed meld."
  },
  {
    id: "turn-what-to-discard",
    title: "What to Discard",
    keywords: ["what to discard", "what should i discard", "safe discard"],
    content: "Discard tiles that don't fit your chosen hand(s) first. If you're still " +
      "deciding between 2-3 candidate hands, discard whatever is useless to all of them. " +
      "Late in a hand, avoid discarding a tile you've seen an opponent collect via their " +
      "exposed melds, since it likely completes their hand."
  },

  // ---- Jokers ----
  {
    id: "joker-substitute",
    title: "What Can Jokers Substitute For?",
    keywords: ["what can jokers", "jokers substitute", "joker substitute", "joker", "jokers"],
    content: "Jokers can substitute for almost any tile inside a pung, kong, or quint — any " +
      "grouping of 3 or more of a kind."
  },
  {
    id: "joker-pair",
    title: "Can Jokers Complete a Pair?",
    keywords: ["complete a pair", "joker pair", "jokers in a pair", "eyes"],
    content: "No — a Joker can never complete a pair. The \"eyes\" (the pair) must always be " +
      "a natural, non-Joker tile."
  },
  {
    id: "joker-singles-pairs",
    title: "Jokers in Singles and Pairs Hands",
    keywords: ["singles and pairs"],
    content: "Jokers can't be used at all in \"Singles and Pairs\" hands on the card — not " +
      "even in melds."
  },
  {
    id: "joker-exchange",
    title: "Joker Exchange",
    keywords: ["joker exchange", "trade a joker", "swap a joker", "exchange a joker"],
    content: "If an opponent has an exposed meld containing a Joker, and you hold the " +
      "natural tile that Joker represents, you can trade your natural tile for their Joker " +
      "on your own turn. You take the Joker into your hand; their exposed meld stays the " +
      "same size, just with your tile in place of the Joker."
  },

  // ---- Picking a hand ----
  {
    id: "pick-how-to-start",
    title: "Starting to Pick a Hand",
    keywords: ["how do i pick", "picking a hand", "choosing a hand", "start picking"],
    content: "After the Charleston, look at your 13 (or 14, for East) tiles: which suits do " +
      "you have the most of, do you already have any pairs or three-of-a-kinds, and how " +
      "many Jokers do you hold? More Jokers means you can realistically attempt harder, " +
      "more exposed hands."
  },
  {
    id: "pick-how-many-candidates",
    title: "How Many Candidate Hands to Consider",
    keywords: ["how many candidate", "how many hands should i", "narrow down"],
    content: "Narrow to 2-3 candidate hands early rather than committing to just one — " +
      "flexibility lets you adapt as more tiles are seen. Once one is clearly closest to " +
      "complete, narrow down to that single target hand."
  },
  {
    id: "pick-what-makes-good-choice",
    title: "What Makes a Good Hand Choice",
    keywords: ["good hand", "which hand to pick", "hand choice"],
    content: "Favor hands that appear in multiple variations on the card (more paths to " +
      "completion means more flexibility), and avoid committing early to hands that need 4 " +
      "copies of one rare tile. Also weigh point value and whether a concealed version is " +
      "realistically achievable, since concealed hands usually score more."
  },
  {
    id: "pick-conserve-jokers",
    title: "Should I Conserve My Jokers?",
    keywords: ["conserve", "save my jokers", "save jokers"],
    content: "Yes — conserve your Jokers for harder combinations rather than spending them " +
      "on easy, already-achievable sets."
  },

  // ---- The NMJL card ----
  {
    id: "card-how-often",
    title: "How Often Does the Card Change?",
    keywords: ["how often does the card", "changes every year", "april", "new card"],
    content: "The NMJL card is published annually — it changes every April 1st."
  },
  {
    id: "card-how-many-hands",
    title: "How Many Hands Are on the Card?",
    keywords: ["how many hands", "how many patterns"],
    content: "Roughly 40-50 valid hand patterns for the year."
  },
  {
    id: "card-sections",
    title: "What Sections Is the Card Grouped Into?",
    keywords: ["sections", "consecutive run", "like numbers", "369", "winds-dragons",
      "winds dragons"],
    content: "Hands are grouped into sections such as: current-year-number hands (this " +
      "year's digits), Consecutive Run, 369, Like Numbers, Quints, Singles and Pairs, and " +
      "Winds-Dragons."
  },
  {
    id: "card-hand-definition",
    title: "What Does a Hand Definition Specify?",
    keywords: ["hand definition", "what does each hand", "what does a hand specify"],
    content: "Each hand on the card specifies: the required suits, the exact tile pattern, " +
      "whether it's allowed to be exposed or must stay fully concealed (marked \"C\"), how " +
      "many Jokers (if any) may be substituted in, and its point value."
  },
  {
    id: "card-no-current-year",
    title: "Do You Know This Year's Actual Hands?",
    keywords: ["this year's hands", "current year hands", "actual hands", "specific hands"],
    content: "Not unless the current-year card is loaded into this knowledge base — I can " +
      "only teach the general structure of how the card is organized, not fabricate " +
      "specific patterns."
  },

  // ---- Winning ----
  {
    id: "win-how",
    title: "How Do I Win?",
    keywords: ["how do i win", "declare mahjong", "call mahjong", "winning", "win"],
    content: "Match your 14 tiles (your 13 plus the winning tile, drawn or claimed) exactly " +
      "against one hand definition on the card — correct pattern, suits, Joker count/" +
      "placement, and exposed-or-concealed status — then call \"Mahjong.\""
  },
  {
    id: "win-wall-game",
    title: "What If the Wall Runs Out?",
    keywords: ["wall runs out", "wall game", "no winner", "exhausted"],
    content: "It's a draw, called a \"wall game\" — no one scores. East usually stays East " +
      "again in that case, but confirm that's your table's practice rather than assuming " +
      "it's universal."
  },
  {
    id: "win-partial-credit",
    title: "Is There Partial Credit?",
    keywords: ["partial credit", "unfinished hand"],
    content: "No — hands have fixed point values, and an unfinished hand scores nothing."
  },

  // ---- Scoring ----
  {
    id: "score-tiers",
    title: "Point Value Tiers",
    keywords: ["point value", "point tiers", "how many points", "25 points", "how much is it worth",
      "scoring", "points"],
    content: "Roughly tiered by difficulty: 25 pts for the simplest hands, 30 for moderate " +
      "difficulty, 35-40 for complex hands, 50 for difficult (often concealed-only) hands, " +
      "and 75+ for rare, highly specific patterns."
  },
  {
    id: "score-who-pays",
    title: "Who Pays When Someone Wins?",
    keywords: ["who pays", "pays the winner", "shared pot", "payment"],
    content: "The winner collects their hand's point value from each of the other three " +
      "players individually — it's not a shared pot — so the total points changing hands " +
      "is the hand's value x3."
  },

  // ---- Variations ----
  {
    id: "var-table-variance",
    title: "What Varies by Table?",
    keywords: ["vary", "variation", "house rules", "depends on the table"],
    content: "A few things genuinely differ by set instructions and by table: whether a " +
      "winning East stays East for the next hand, and some Courtesy pass details (how many " +
      "tiles, whether it happens at all). Don't treat either as universal — confirm with " +
      "your table."
  }
];
