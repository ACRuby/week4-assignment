# Mahjong Teacher — Week 4 Assignment

A friendly chatbot that teaches complete beginners how to play American
Mahjong (NMJL style) — setup, the Charleston, turns, jokers, winning, and
more. Built as a static HTML/CSS/JS page with a **rule-based
(keyword-matching) chatbot**: no external LLM, no API key, no server, no
network calls at all. Every answer comes from a fixed knowledge base
written into this repo.

## Try it (30 seconds)

**Live demo: https://acruby.github.io/week4-assignment/**

Prefer to run it locally? Download or clone the repo and open `index.html`
directly in a browser (double-click the file, or drag it into a browser
tab). No install, no build step, no server required. (Note: clicking
`index.html` inside GitHub only shows the source code, not the running app.)

Or serve it locally:

```bash
python -m http.server 8000
```

then visit `http://localhost:8000`.

### Example questions to try

- "How many players do I need?"
- "What's the Courtesy pass?"
- "Can jokers complete a pair?"
- "What is a quint?"
- "Is the second Charleston required?"
- "Who pays when someone wins?"
- "What is a dead hand?"
- "What does C mean on the NMJL card?"
- Something off-topic, like "what's the weather today?" — to see the
  fallback message (it should admit it doesn't know, not make something up)

Type `topics` any time to see the full list of subjects the bot covers.

## How it works

There's no AI model behind this — it's intentionally a closed, rule-based
system:

1. [knowledge-base.js](knowledge-base.js) holds ~90 entries. Each answers
   **one specific question** (not a whole topic dump), with a title,
   a short answer, and a list of keyword phrases that should trigger it.
2. [script.js](script.js) takes whatever the user types, strips
   punctuation, and scores it against every entry's keywords. Multi-word
   phrases score higher than single generic words, so a specific question
   ("can jokers complete a pair?") beats a broad one ("jokers") when both
   are present. The highest-scoring entry's answer is shown; if nothing
   scores above zero, the bot says so honestly instead of guessing.
3. [index.html](index.html) / [style.css](style.css) are just the chat UI
   shell around that logic.

This design means the bot can never hallucinate a Mah Jongg rule it wasn't
explicitly given — every sentence it can say is traceable to a specific
line in `knowledge-base.js`.

## Project structure

| File | Purpose |
|---|---|
| [index.html](index.html) | Chat UI markup |
| [style.css](style.css) | Styling |
| [knowledge-base.js](knowledge-base.js) | The chatbot's entire knowledge: ~90 single-question Q&A entries + keywords, grouped by topic (basics, tiles, table setup, seating & East, dealing, the Charleston, turns & claiming, exposures, jokers, dead hands, picking a hand, the NMJL card's structure, winning, scoring, strategy, etiquette, house-rule variations) |
| [script.js](script.js) | Keyword-matching logic described above |
| [mahjong_teacher_system_prompt.md](mahjong_teacher_system_prompt.md) | Original persona write-up the project started from |
| [mahjong_technical_reference.md](mahjong_technical_reference.md) | A more detailed rules source used to correct/extend the original content |
| [CLAUDE.md](CLAUDE.md) | Dev-facing notes: source precedence between the reference docs, and a log of factual corrections made along the way |

## Scope & limitations

- **No current-year hand list.** The NMJL card changes every year and its
  specific hand patterns are copyrighted by the National Mah Jongg League,
  so this bot deliberately does not invent them — it teaches the *general
  structure* of how the card is organized (sections, "X"/"C" markers,
  point values) rather than specific patterns.
- **Answers are NMJL-standard by default.** If you mention a house rule,
  the bot is built to treat it as a table-specific variation, not present
  it as the official rule.
- **It only knows what's written into `knowledge-base.js`.** It's not a
  general chatbot — ask it something outside Mahjong and it will say so
  rather than answer from general knowledge.
- A couple of rules genuinely vary by table/set (e.g. whether a winning
  East stays East, some Courtesy-pass details) — the bot flags these as
  variable rather than stating one version as universal.

## Sources

Content was built up in three passes, each correcting/extending the last
(see `CLAUDE.md` for the detailed changelog of corrections):
1. An original hand-written persona/system-prompt draft.
2. A more detailed rules reference (American Mahjong Guide /
   mahjongplaybook.com).
3. A 500-question NMJL Q&A dataset with citations to official NMJL links
   (nationalmahjonggleague.org), used as the final authority where it
   conflicted with the earlier two sources.
