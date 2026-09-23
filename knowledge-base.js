// All chatbot answers come only from this file — no external LLM or API calls.
// Content is based on mahjong_teacher_system_prompt.md, corrected/extended by
// mahjong_technical_reference.md, and further corrected/extended by a 500-Q&A
// NMJL reference dataset (see CLAUDE.md for how these three sources reconcile
// when they disagree — the 500-Q&A dataset is treated as the newest and most
// authoritative source since it cites official NMJL links and is internally
// consistent).
// Each entry answers ONE specific question, not a whole topic, so replies stay
// targeted. Multi-word keywords score higher than single generic words (see
// script.js), so a specific phrase match should beat a topic's generic overview
// entry when both are present in the user's message.

const WELCOME_MESSAGE =
  "Hi! I'm your American Mahjong (NMJL) teacher. Ask me specific questions like " +
  "\"how many players do I need?\", \"what's the Courtesy pass?\", \"can jokers complete a " +
  "pair?\", or \"who pays when someone wins?\" Topics I know: basics, tiles, table setup, " +
  "seating & East, dealing, the Charleston, turns & claiming, exposures, jokers, dead " +
  "hands, picking a hand, the NMJL card, winning, scoring, strategy, and etiquette. " +
  "Type \"topics\" any time to see this list again.";

const FALLBACK_MESSAGE =
  "I don't have an answer for that in my notes yet — I only know what's in my " +
  "Mahjong knowledge base, not a general AI. Try asking a specific question about: " +
  "basics, tiles, table setup, seating & East, dealing, the Charleston, turns & " +
  "claiming, exposures, jokers, dead hands, picking a hand, the NMJL card, winning, " +
  "scoring, strategy, or etiquette. Type \"topics\" to see the list again.";

const KNOWLEDGE_BASE = [
  // ---- Basics ----
  {
    id: "basics-definition",
    title: "What Is NMJL American Mah Jongg?",
    keywords: ["what is nmjl", "american mah jongg", "nmjl american"],
    content: "It's the standardized American form of Mah Jongg associated with the National " +
      "Mah Jongg League. Players build one of the hands shown on the current annual NMJL " +
      "card, using features such as Jokers and the Charleston."
  },
  {
    id: "basics-goal",
    title: "What's the Goal of the Game?",
    keywords: ["goal of the game", "goal is to", "point of the game"],
    content: "To make one complete 14-tile hand that exactly matches a hand on the current " +
      "NMJL card, and declare \"Mah Jongg.\""
  },
  {
    id: "eq-players",
    title: "How Many Players?",
    keywords: ["how many players", "players", "number of players", "people normally play",
      "people play"],
    content: "4 players for a standard game. 3-player variants exist but are less common."
  },
  {
    id: "eq-card",
    title: "Do I Need the NMJL Card?",
    keywords: ["need the card", "need a card", "nmjl card"],
    content: "Yes — the current year's NMJL card lists every valid winning hand. One per " +
      "player is ideal so everyone can reference it during play."
  },
  {
    id: "meta-rules-authority",
    title: "Who Settles a Rules Dispute?",
    keywords: ["rules dispute", "settle a dispute", "unusual rules"],
    content: "For anything unusual or not clearly covered here, defer to the National Mah " +
      "Jongg League, which answers rules questions and arbitrates disputed games."
  },

  // ---- Tiles / equipment ----
  {
    id: "eq-tileset",
    title: "What's in the Tile Set?",
    keywords: ["152", "tile set", "tiles in the set", "how many tiles", "tile inventory",
      "equipment"],
    content: "152 tiles total: Craks/Characters, Bams/Bamboos, and Dots/Circles numbered 1-9 " +
      "with 4 copies each (108 tiles); Winds N/E/W/S and Dragons Red/Green/White with 4 " +
      "copies each (28 tiles); 8 Jokers; and 8 Flower tiles — all part of the standard 152, " +
      "not an optional extra."
  },
  {
    id: "tiles-three-suits",
    title: "What Are the Three Numbered Suits?",
    keywords: ["three numbered suits", "numbered suits", "bamboo", "character", "crak", "dot"],
    content: "Craks (Characters), Bams (Bamboos), and Dots (Circles). Each suit has tiles " +
      "numbered 1 through 9."
  },
  {
    id: "tiles-honors",
    title: "What Are Honor Tiles?",
    keywords: ["honor tiles", "honors"],
    content: "The four Winds — East, South, West, North — and the three Dragons — Red, " +
      "Green, White."
  },
  {
    id: "tiles-white-dragon",
    title: "What Does the White Dragon Look Like?",
    keywords: ["white dragon"],
    content: "Often a blank tile, or one marked with a frame or letter. In NMJL notation " +
      "it's commonly represented by a zero-like symbol."
  },
  {
    id: "eq-flowers",
    title: "How Many Flowers Are There?",
    keywords: ["flower"],
    content: "8 Flower tiles, included in the standard 152-tile set (not an optional extra). " +
      "For play, the Flowers are interchangeable with one another."
  },
  {
    id: "tiles-jokers-count",
    title: "How Many Jokers Are There?",
    keywords: ["how many jokers are there", "jokers count"],
    content: "8 Jokers in a standard NMJL-style American Mah Jongg set."
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

  // ---- Table setup ----
  {
    id: "setup-wall-build",
    title: "Building the Walls",
    keywords: ["build the wall", "build a wall", "shuffle", "wall build", "how big is the wall",
      "38 tiles", "table setup", "set up the table"],
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
    id: "setup-who-is-east",
    title: "Who Is East?",
    keywords: ["who is east"],
    content: "East is the dealer for the hand. Positions are determined before play, and " +
      "East begins with 14 tiles while South, West, and North each begin with 13."
  },
  {
    id: "east-how-decided",
    title: "How Is East Decided?",
    keywords: ["how is east decided", "determine east", "start as east", "east"],
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
    keywords: ["how are tiles dealt", "dealing mechanics", "12 tiles", "deal tiles",
      "dealing", "deal"],
    content: "Dealing goes counter-clockwise from the break point in rounds of 4 tiles per " +
      "player until everyone has 12. Each player then takes 1 more to reach 13, and East " +
      "takes one additional tile on top of that to start with 14, since East discards first."
  },
  {
    id: "setup-starting-tiles",
    title: "How Many Tiles Does Each Player Start With?",
    keywords: ["each player start with", "starting tiles", "13 tiles", "14 tiles"],
    content: "East starts with 14 tiles. South, West, and North each start with 13 tiles."
  },
  {
    id: "setup-first-discard",
    title: "Who Discards First?",
    keywords: ["discards first", "who discards first"],
    content: "East discards first, because East begins with the extra, 14th tile."
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
    id: "charleston-definition",
    title: "What Is the Charleston?",
    keywords: ["what is the charleston", "charleston"],
    content: "The opening tile-passing sequence used in American Mah Jongg. Players pass " +
      "groups of three unwanted tiles in prescribed directions before normal play begins."
  },
  {
    id: "charleston-tile-count",
    title: "How Many Tiles Are Passed at a Time?",
    keywords: ["how many tiles passed"],
    content: "Three tiles are passed at a time."
  },
  {
    id: "charleston-first",
    title: "The First Charleston",
    keywords: ["first charleston"],
    content: "Mandatory once it begins: three passes — right, then across, then left."
  },
  {
    id: "charleston-cant-stop-first",
    title: "Can I Stop the First Charleston?",
    keywords: ["stop the first charleston", "stop first charleston"],
    content: "No — the first Charleston is required once it begins. The optional stopping " +
      "point is before the second Charleston."
  },
  {
    id: "charleston-second",
    title: "The Second Charleston",
    keywords: ["second charleston"],
    content: "Optional — only happens if all four players agree to continue. When it does, " +
      "it reverses direction from the first: left, then across, then right."
  },
  {
    id: "charleston-blind-pass",
    title: "What's a Blind Pass?",
    keywords: ["blind pass"],
    content: "On the last pass of a Charleston, a player may use one, two, or three incoming " +
      "tiles as part of the three tiles they pass, without looking at those incoming tiles " +
      "first, following the standard blind-pass procedure."
  },
  {
    id: "charleston-courtesy",
    title: "The Courtesy Pass",
    keywords: ["courtesy", "courtesy pass"],
    content: "An optional pass some tables use after the Charlestons: if everyone agrees, " +
      "players simultaneously pass 1-3 tiles directly across the table. Treat this as a " +
      "table-specific variation rather than a universal NMJL step."
  },
  {
    id: "charleston-pass-flowers",
    title: "Can I Pass Flowers in the Charleston?",
    keywords: ["pass flowers"],
    content: "Yes — Flowers may be passed during the Charleston."
  },
  {
    id: "charleston-pass-honors",
    title: "Can I Pass Winds or Dragons in the Charleston?",
    keywords: ["pass winds", "pass dragons"],
    content: "Yes — Winds and Dragons may be passed during the Charleston."
  },
  {
    id: "charleston-no-jokers",
    title: "Can I Pass a Joker in the Charleston?",
    keywords: ["pass a joker", "pass jokers in the charleston"],
    content: "No — Jokers may not be passed during the Charleston."
  },
  {
    id: "charleston-what-to-pass",
    title: "What to Pass in the Charleston",
    keywords: ["what to pass", "what should i pass"],
    content: "Pass tiles that don't support any hand pattern you're considering: isolated " +
      "singles, tiles in a suit you're not using, or tiles that don't extend a pair or " +
      "partial set you hold. Be cautious passing dragons, winds, or number tiles you might " +
      "want if you're unsure which hand to commit to."
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
    keywords: ["my turn", "what happens on a turn", "normal turn", "turn sequence",
      "turn", "turns"],
    content: "If no discard is called: pick one tile from the wall, evaluate your hand, then " +
      "discard one tile so your rack returns to 13 tiles."
  },
  {
    id: "gameplay-discard-after-pick",
    title: "Do I Have to Discard After I Pick?",
    keywords: ["discard after i pick", "have to discard"],
    content: "Usually yes — unless the tile you picked completes Mah Jongg, you discard one " +
      "tile after picking."
  },
  {
    id: "turn-order",
    title: "Turn Order",
    keywords: ["turn order"],
    content: "East → South → West → North → East... going counter-clockwise."
  },
  {
    id: "gameplay-calling-discard-rule",
    title: "Can I Take Another Player's Discard?",
    keywords: ["take another player's discard", "take another players discard"],
    content: "Only when it completes an allowable exposure for the hand you're playing, or " +
      "when it completes your Mah Jongg. You can't simply take a discard because you want it."
  },
  {
    id: "turn-claiming",
    title: "Claiming a Discard",
    keywords: ["claim", "claiming", "call a tile"],
    content: "Any player can claim a discarded tile — not just the player to their right — " +
      "by calling it (\"Call\" or \"Take,\" or naming the tile) to complete an exposed pung " +
      "(3 of a kind), kong (4 of a kind), quint (5 of a kind), or sextet (6 of a kind, both " +
      "only possible using Jokers). Claim clearly before play moves on."
  },
  {
    id: "gameplay-call-for-pair",
    title: "Can I Call a Discard for a Pair?",
    keywords: ["call a discard for a pair", "call for a pair"],
    content: "Not merely to make a pair during ordinary play — a discard can be called for a " +
      "pair only when that tile completes your Mah Jongg."
  },
  {
    id: "gameplay-call-for-single",
    title: "Can I Call a Discard for a Single Tile?",
    keywords: ["call a discard for a single", "call for a single"],
    content: "Not merely to fill a single-tile position — a discard can be called for a " +
      "single only when it completes your Mah Jongg."
  },
  {
    id: "turn-after-claim",
    title: "After Claiming a Discard",
    keywords: ["after claiming", "after i claim", "who discards next", "after i call a discard",
      "after you call a discard"],
    content: "Take the called tile, place the completed grouping face-up on top of your rack " +
      "as an exposure, then discard a tile — play continues from you, counter-clockwise."
  },
  {
    id: "turn-concealed-marker",
    title: "What Does \"C\" Mean on a Hand?",
    keywords: ["concealed only", "marked c", "what does c mean", "c mean"],
    content: "Concealed. Except for calling the final tile to complete Mah Jongg, you may " +
      "not call discards to expose groupings in a hand marked \"C.\""
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

  // ---- Exposures ----
  {
    id: "exposure-definition",
    title: "What Is an Exposure?",
    keywords: ["what is an exposure"],
    content: "A grouping placed face-up on top of the rack after calling a discard — it " +
      "shows the tiles used for that part of the hand."
  },
  {
    id: "exposure-pung",
    title: "What Is a Pung?",
    keywords: ["what is a pung"],
    content: "A group of three identical tiles."
  },
  {
    id: "exposure-kong",
    title: "What Is a Kong?",
    keywords: ["what is a kong"],
    content: "A group of four identical tiles."
  },
  {
    id: "exposure-quint",
    title: "What Is a Quint?",
    keywords: ["what is a quint"],
    content: "A group of five identical tiles. Since only four natural copies of a tile " +
      "exist, a quint always requires at least one Joker."
  },
  {
    id: "exposure-sextet",
    title: "What Is a Sextet?",
    keywords: ["what is a sextet", "sextet"],
    content: "A group of six identical tiles — since only four natural copies exist, a " +
      "sextet always requires Jokers."
  },

  // ---- Jokers ----
  {
    id: "joker-substitute",
    title: "What Can Jokers Substitute For?",
    keywords: ["what can jokers", "jokers substitute", "joker substitute", "joker", "jokers"],
    content: "Jokers may be used in groups of three or more identical tiles — pungs, kongs, " +
      "quints, and sextets — whenever the hand you're playing permits that grouping."
  },
  {
    id: "joker-pair",
    title: "Can Jokers Complete a Pair?",
    keywords: ["complete a pair", "joker pair", "jokers in a pair", "used in a pair", "eyes"],
    content: "No — a Joker can never complete a pair. The \"eyes\" (the pair) must always be " +
      "a natural, non-Joker tile."
  },
  {
    id: "joker-single-tile",
    title: "Can a Joker Be Used as a Single Tile?",
    keywords: ["used as a single", "joker single tile"],
    content: "No — a Joker cannot represent a single tile on its own."
  },
  {
    id: "joker-singles-pairs",
    title: "Jokers in Singles and Pairs Hands",
    keywords: ["singles and pairs"],
    content: "Jokers can't be used at all in \"Singles and Pairs\" hands on the card — not " +
      "even in melds."
  },
  {
    id: "joker-discard",
    title: "Can I Discard or Call a Discarded Joker?",
    keywords: ["discard a joker", "discarded joker", "call a discarded joker"],
    content: "You can discard a Joker, but once discarded it's dead — it can't be called or " +
      "retrieved by anyone."
  },
  {
    id: "joker-exchange",
    title: "Joker Exchange",
    keywords: ["joker exchange", "trade a joker", "swap a joker", "exchange a joker",
      "exchange for a joker"],
    content: "On your turn, after you've picked a tile, you may exchange the matching " +
      "natural tile for an exposed Joker in another active player's exposure — you take the " +
      "Joker into your hand, and their exposed meld stays the same size, just with your " +
      "tile in place of the Joker."
  },
  {
    id: "joker-exchange-own",
    title: "Can I Exchange for My Own Exposed Joker?",
    keywords: ["exchange for my own", "own exposed joker"],
    content: "Yes — on your turn, you may exchange a matching natural tile for a Joker " +
      "sitting in your own exposure."
  },
  {
    id: "joker-dead-hand-exchange",
    title: "Can I Take a Joker From a Dead Player's Rack?",
    keywords: ["dead player's rack", "joker from a dead player"],
    content: "No — once a player's hand is declared dead, Jokers in that player's exposures " +
      "are no longer available for exchange."
  },

  // ---- Dead hands ----
  {
    id: "dead-hand-definition",
    title: "What Is a Dead Hand?",
    keywords: ["what is a dead hand", "dead hand", "hand dies", "hand died"],
    content: "A hand is dead when a rules error or an impossible exposure means the player " +
      "can no longer legally complete a hand. A dead player stops picking and discarding " +
      "but keeps their tiles in place."
  },
  {
    id: "dead-hand-impossible-exposure",
    title: "What If I Expose Tiles That Can't Fit Any Hand?",
    keywords: ["cannot fit any hand", "can't fit any hand", "impossible exposure"],
    content: "If the exposure makes it impossible for your hand to match any legal hand on " +
      "the current card, your hand can be declared dead."
  },
  {
    id: "dead-hand-concealed-exposure",
    title: "What If I Expose Part of a Concealed Hand?",
    keywords: ["expose part of a concealed hand", "concealed hand"],
    content: "Your hand becomes dead, unless the only tile you called was the final tile " +
      "used to declare Mah Jongg."
  },
  {
    id: "dead-hand-player-play",
    title: "Can a Dead Player Keep Playing?",
    keywords: ["dead player keep playing", "can a dead player"],
    content: "No — a player with a dead hand no longer picks or discards. The other active " +
      "players continue."
  },

  // ---- Picking a hand & strategy ----
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
    id: "strategy-flexibility-charleston",
    title: "Should I Decide on One Hand Before the Charleston?",
    keywords: ["decide on one hand", "before the charleston"],
    content: "Usually not — early on it's often better to identify several compatible " +
      "possibilities and let your tiles and the Charleston narrow the choices."
  },
  {
    id: "pick-how-many-candidates",
    title: "How Many Candidate Hands to Consider",
    keywords: ["how many candidate", "how many hands should i consider", "narrow down"],
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
    id: "strategy-when-to-expose",
    title: "Should I Expose as Soon as I Can?",
    keywords: ["expose as soon as i can", "should i expose right away"],
    content: "Not always — exposing can advance your hand, but it also reveals information " +
      "and may lock you into fewer options. Make sure the exposure fits a viable hand first."
  },
  {
    id: "strategy-jokers-value",
    title: "Are Jokers Always Good to Keep?",
    keywords: ["always good to keep", "jokers always good", "keep jokers"],
    content: "Generally valuable, since they can substitute in groups of three or more, but " +
      "their usefulness depends on the hand you're building."
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
    keywords: ["how often does the card", "changes every year", "hands every year",
      "april", "new card"],
    content: "The NMJL card is published annually — it changes every April 1st, so the " +
      "playable hands differ from year to year."
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
    keywords: ["sections", "winds-dragons", "winds dragons"],
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
    id: "card-x-meaning",
    title: "What Does \"X\" Mean on the Card?",
    keywords: ["x mean on the", "what does x mean"],
    content: "X means the hand may be exposed. It does not mean every grouping must be " +
      "exposed."
  },
  {
    id: "card-colors-meaning",
    title: "What Do the Colors on the Card Mean?",
    keywords: ["colors on the", "colors mean"],
    content: "Colors show suit relationships within that specific hand — they don't " +
      "permanently correspond to Craks, Bams, or Dots. You choose whichever suits satisfy " +
      "the pattern."
  },
  {
    id: "card-colors-not-fixed",
    title: "Does a Red Number Always Mean Craks?",
    keywords: ["red number always mean", "red number mean craks"],
    content: "No — card colors indicate different suits or suit relationships for that " +
      "particular hand, not fixed tile suits."
  },
  {
    id: "card-like-numbers",
    title: "What Does \"Any Like Numbers\" Mean?",
    keywords: ["any like numbers", "like numbers mean"],
    content: "It means the specified groups all use the same number, while still following " +
      "the suit and grouping requirements shown on that hand."
  },
  {
    id: "card-consecutive-run",
    title: "What Does \"Consecutive Run\" Mean?",
    keywords: ["consecutive run", "consecutive numbers"],
    content: "Numbers that follow one another in sequence, such as 3-4-5, arranged exactly " +
      "as the hand on the card requires."
  },
  {
    id: "card-no-current-year",
    title: "Do You Know This Year's Actual Hands?",
    keywords: ["this year's hands", "current year hands", "actual hands", "specific hands",
      "specific hand"],
    content: "Not unless the current-year card is loaded into this knowledge base — I can " +
      "only teach the general structure of how the card is organized, not invent specific " +
      "hand patterns. For a hand-specific question, use your own current NMJL card or the " +
      "official one from the League."
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
    id: "win-tile-count",
    title: "How Many Tiles Are in a Completed Hand?",
    keywords: ["in a completed", "completed nmjl hand", "tiles in a completed hand"],
    content: "14 tiles total, counting every tile in your exposures plus what's on your rack."
  },
  {
    id: "win-when-declare",
    title: "When Do I Say \"Mah Jongg\"?",
    keywords: ["when do i say", "say mah jongg"],
    content: "As soon as you have a legal 14-tile hand that exactly matches a hand on the " +
      "current card."
  },
  {
    id: "win-call-for-mahjongg",
    title: "Can I Call a Discard to Complete Mah Jongg?",
    keywords: ["call a discard to complete", "discard to complete mah jongg"],
    content: "Yes — a discard may be called when it's the tile that completes a legal Mah " +
      "Jongg, including when it fills a single or pair position."
  },
  {
    id: "win-self-pick",
    title: "Can I Win by Picking My Own Tile?",
    keywords: ["win by picking my own", "picking my own tile"],
    content: "Yes — if the tile you pick from the wall completes a legal hand, you may " +
      "declare Mah Jongg."
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

  // ---- Etiquette ----
  {
    id: "etiquette-announce-discard",
    title: "Should I Name the Tile When I Discard?",
    keywords: ["name the tile when i discard", "announce my discard"],
    content: "Yes — clearly announcing each discard helps all players know what tile is " +
      "available to call."
  },
  {
    id: "etiquette-takeback-discard",
    title: "Can I Change My Mind After Discarding?",
    keywords: ["change my mind after discarding", "take back a discard"],
    content: "Once a discard has been fully released and announced, treat it as discarded — " +
      "avoid taking it back. Exact timing disputes should follow your table's agreed rules."
  },

  // ---- Variations ----
  {
    id: "var-table-variance",
    title: "What Varies by Table?",
    keywords: ["vary", "variation", "depends on the table"],
    content: "A few things genuinely differ by set instructions and by table: whether a " +
      "winning East stays East for the next hand, and whether/how a Courtesy pass happens " +
      "after the Charlestons. If a player describes a house rule, treat it as a table-" +
      "specific variation rather than the NMJL default — don't present it as universal."
  },
  {
    id: "var-house-rules-default",
    title: "Do House Rules Override NMJL Rules Here?",
    keywords: ["house rules override", "house rule variation"],
    content: "No — this teacher answers with the standard NMJL rule by default. If you " +
      "mention a house rule your table uses, I'll note it as a variation rather than treat " +
      "it as the NMJL standard."
  }
];
