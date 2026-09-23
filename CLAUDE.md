# Week 4 Assignment

## Overview
A friendly, patient American Mahjong (NMJL) teacher chatbot that walks
complete beginners through setup, mechanics, and strategy one topic at a
time.

**This branch (`claude-llm-chat`)** calls the real Claude API instead of the
rule-based matcher used on `main`/`flexible-matching` — see "LLM design"
below. `main` and `flexible-matching` are a static HTML/CSS/JS page with a
rule-based (keyword-matching) chatbot: no external LLM or API calls, no API
key required, all answers from a fixed knowledge base in the project. The
rest of this Overview describes that shared content/history; it still
applies here since this branch's system prompt is built from the same
`knowledge-base.js`.

`mahjong_teacher_system_prompt.md` is kept as the original persona/content
reference; [knowledge-base.js](knowledge-base.js) is the structured,
in-browser version of that same content actually used by the chatbot.

[mahjong_technical_reference.md](mahjong_technical_reference.md) is a later,
more detailed source (American Mahjong Guide / mahjongplaybook.com) treated
as ground truth for this project. Where it conflicted with the original
system prompt (dealing pattern, Charleston structure), `knowledge-base.js`
was corrected to match the technical reference; `mahjong_teacher_system_prompt.md`
itself was left as the historical original and was not rewritten.

A 500-question NMJL Q&A dataset (source file: `NMJL_Mah_Jongg_Chatbot_500_QA.xlsx`,
supplied by the user, not checked into this repo) was used to both add ~50 new
specific Q&A entries and correct existing ones, since it cites official NMJL
links (nationalmahjonggleague.org) and is internally consistent where the
technical reference was not. It takes precedence over both earlier sources on
conflict. Corrections made:
- **Tile count**: the 152-tile set includes 8 Flower tiles as part of the
  152 (not an optional extra bringing the total to 160, as previously stated
  — that older figure didn't actually add up).
- **Second Charleston**: optional (requires all 4 players' agreement), and
  reverses direction from the first (left, across, right) — previously
  stated as mandatory and identical in direction to the first, which was
  wrong.
- Joker exchange and the "C" (concealed) marker were reworded with more
  precise timing/detail from the new source.

Per the dataset's own guidance sheet, the bot's default behavior is: answer
with the standard NMJL rule, and if a user describes a house rule, label it
as a table-specific variation rather than presenting it as the NMJL default
(see `var-house-rules-default` and `var-table-variance` in knowledge-base.js).

## Setup (this branch)
Static site, no build step or server-side code, but a real API call:
- [index.html](index.html) — chat UI markup + API key input bar
- [style.css](style.css) — styling
- [knowledge-base.js](knowledge-base.js) — ~90 single-question Q&A entries;
  on this branch these are read once at load to build the Claude system
  prompt (see "LLM design"), not matched against directly
- [claude-chat.js](claude-chat.js) — builds the system prompt from
  `KNOWLEDGE_BASE`, then calls the Claude API directly from the browser

Open `index.html` directly in a browser, or serve the folder locally (e.g.
`python -m http.server`). Requires the user to supply their own Anthropic
API key in the browser (see "LLM design" — there's no backend to hold one
server-side). `main`/`flexible-matching` need neither a key nor network
access; [script.js](script.js) from those branches is not used here but is
left in the repo for reference/comparison.

## LLM design
This branch swaps the rule-based matcher for a real call to Claude
(`claude-sonnet-5`) via `POST https://api.anthropic.com/v1/messages`,
made directly from the browser with `fetch`.

- **Grounding.** `claude-chat.js` builds the system prompt at load time by
  concatenating every `KNOWLEDGE_BASE` entry's title + content from
  `knowledge-base.js` (~16.5k chars, 93 entries) under a short instruction
  to answer only from that material, say so plainly when something (like
  the current year's specific hand list) isn't covered, and label
  user-described house rules as variations rather than the NMJL default.
  This keeps a single source of truth between the rule-based and LLM
  branches and preserves the "don't invent hand patterns" behavior that
  was a deliberate design goal from the start of this project.
- **API key.** There's no backend, so a key can't be hidden — the user
  pastes their own Anthropic key into a password-style field; it's kept
  only in that browser's `localStorage` (key: `mahjong-teacher-anthropic-key`)
  and sent only to `api.anthropic.com`. It is never written to any file in
  this repo. Calling the API from a browser at all requires opting in via
  the `anthropic-dangerous-direct-browser-access: true` header — without it
  the Anthropic API blocks the request with a CORS error, since a
  browser-visible key is normally considered unsafe. That's an acceptable
  trade-off here only because it's the user's own key, entered by them, for
  their own use — this pattern should not be used for anything serving
  other people's traffic (their key would be visible to every visitor via
  browser devtools).
- **Conversation state.** A simple in-memory array of `{role, content}`
  turns, sent in full on every request (no server session, no persistence
  across a page reload).
- **Verified without a real key:** syntax, the generated system prompt's
  shape/length, the empty-key guard message, the localStorage save/reload
  round-trip, and that a bad key produces a real 401 from the API (proving
  the browser-access header correctly avoids a CORS block) with a friendly
  error message rather than a raw stack trace. Actually exercising a real
  conversation needs the user's own key — Claude does not enter API keys
  into fields, even test ones, per its own operating rules.

## Matching design (main / flexible-matching branches — not used here)
Originally `script.js` matched user input against keywords by exact
substring, which required near-exact phrasing. It now tokenizes and stems
both the input and each keyword (plurals/verb endings fold together:
"jokers" ~ "joker", "announcing" ~ "announce"), and scores order-independent
word overlap, not just exact substrings — so paraphrased, reordered, or
partially-worded questions still match. Per entry, the *best single keyword*
is used (not the sum across keywords), which prevents an entry with many
loosely related keywords from out-scoring a precisely matching one.

Interrogatives (who/what/when/where/why/how) are deliberately NOT stopwords
— they're often the only thing distinguishing similar questions ("who is
East" vs "how is East decided"), so stripping them collapsed too many
entries onto the same single leftover word.

**Rarity weighting.** Each word is weighted by how many entries' keyword
lists it appears in (an IDF-style score): a word unique to one entry
("pung", "quint") carries a lot of signal on its own, while a word shared
by dozens of "what is X" keywords ("what", "card") barely counts. This is
what lets a lone mention of "pung" match `exposure-pung`, while a genuinely
off-topic message that happens to share only a common word with some
keyword does not clear the match threshold. `GENERIC_WORDS` is a small
curated exception list (need, game, name, play, like, ...) for ordinary
English words that happen to be rare *within this KB* purely by accident of
phrasing — without it, e.g. "do you like pizza" would falsely match
`card-like-numbers` (the only keyword containing "like"). These words can
still complete a full keyword match, just not carry a weak partial one
alone. Extend this list if a new false positive of the same shape turns up.

Verified with three test sweeps (run from a throwaway `_test_kb.js`, not
checked in): ~50 hand-picked paraphrased/reordered/off-topic queries, an
extended batch of tricky off-topic phrasings, and a self-consistency check
that every keyword of every entry (93 entries, 267 keywords) correctly
retrieves its own entry.

## Notes
- If an NMJL card (current year's hand list) is ever added, it should be
  turned into additional knowledge-base.js sections rather than fabricated —
  hand lists/point values are copyrighted by the NMJL and change annually.
- Several rules are explicitly flagged as table/set-variant in the content
  (East rotation on a win, Courtesy pass specifics) — presented as the
  common/default version with a note to confirm against house rules.
- If a future requirement conflicts with a different mahjong ruleset
  (Chinese Classical, Riichi, etc.), confirm with the user which ruleset
  applies before implementing — tile counts, dealing, and scoring differ
  significantly between them.
- Earlier iterations of this project used a Python CLI calling the Anthropic
  API, then a browser app calling an external LLM API — both were replaced
  with this fully client-side, knowledge-base-only version per requirements.
