# Mahjong Teacher — Week 4 Assignment

A friendly chatbot that teaches complete beginners how to play American
Mahjong (NMJL style) — setup, the Charleston, turns, jokers, winning, and
more.

**This branch (`claude-llm-chat`) calls the real Claude API**, grounded in
this project's own knowledge base as its system prompt. The `main` and
`flexible-matching` branches instead use a fully client-side, rule-based
(keyword-matching) chatbot with no external LLM at all — see their READMEs
for that version. Both read from the same [knowledge-base.js](knowledge-base.js).

## Try it

This branch isn't deployed to GitHub Pages (that serves `main`). To test it:

**https://raw.githack.com/ACRuby/week4-assignment/claude-llm-chat/index.html**
(first visit shows a one-time "external content" notice from the proxy —
click through it; this link always reflects the latest push to this branch)

Or download/clone the repo and open `index.html` directly in a browser, or
serve it locally:

```bash
python -m http.server 8000
```

then visit `http://localhost:8000`.

**You'll need your own Anthropic API key** (get one at
[console.anthropic.com](https://console.anthropic.com)) — paste it into the
field at the top of the page. It's stored only in your browser's local
storage, sent only to `api.anthropic.com`, and never touches this repo.
Using the Claude API costs money per request (pay-as-you-go, sometimes with
free starter credit) — this is separate from any claude.ai subscription.

### Example questions to try

- "How many players do I need?"
- "What's the Courtesy pass?"
- "Can jokers complete a pair?"
- Something phrased loosely, e.g. "tell me about pungs" — the model reads
  naturally, so this isn't testing exact-match logic the way it would on
  the rule-based branches
- Something outside the knowledge base, like "what are this year's actual
  hand patterns?" — it should say it doesn't have that (rather than invent
  one), since the current-year NMJL card isn't included
- Something totally off-topic, like "what's the weather today?" — it
  should decline rather than answer from its own general knowledge

## How it works

1. [knowledge-base.js](knowledge-base.js) holds ~90 single-question Q&A
   entries — the same file the rule-based branches use, but here it's read
   once at page load and turned into a big system-prompt string (title +
   answer for every entry) instead of being matched against.
2. [claude-chat.js](claude-chat.js) sends that system prompt plus the
   running conversation to `POST https://api.anthropic.com/v1/messages`
   (model `claude-sonnet-5`) directly from the browser via `fetch`, and
   shows Claude's reply.
3. [index.html](index.html) / [style.css](style.css) are the chat UI shell,
   plus a password-style field for the API key.

Because the system prompt explicitly says to answer only from the supplied
material and admit when something isn't covered, this should behave a lot
like the rule-based version in terms of scope — but it's Claude actually
reading and reasoning over the material, not a keyword matcher, so phrasing
can be much more natural and multi-turn follow-ups work properly.

## A note on the API key

This is a static site with no backend, so there's no way to keep an API key
private from the browser it's used in — the `anthropic-dangerous-direct-
browser-access` header is required to call the API from a page at all,
specifically because Anthropic considers a browser-exposed key unsafe by
default. That's an acceptable trade-off for a single person testing with
their own key in their own browser, but this pattern should never be used
for a page serving other people — anyone visiting could read the key out of
their browser's network tab. A real product would need a small backend to
hold the key and proxy requests.

## Project structure

| File | Purpose |
|---|---|
| [index.html](index.html) | Chat UI markup + API key input bar |
| [style.css](style.css) | Styling |
| [knowledge-base.js](knowledge-base.js) | ~90 single-question Q&A entries, read at load time to build the system prompt |
| [claude-chat.js](claude-chat.js) | Builds the system prompt and calls the Claude API |
| [script.js](script.js) | The rule-based matcher from `main`/`flexible-matching` — present for reference, not loaded by `index.html` on this branch |
| [mahjong_teacher_system_prompt.md](mahjong_teacher_system_prompt.md) | Original persona write-up the project started from |
| [mahjong_technical_reference.md](mahjong_technical_reference.md) | A more detailed rules source used to correct/extend the original content |
| [CLAUDE.md](CLAUDE.md) | Dev-facing notes: source precedence between the reference docs, the LLM design, and a log of corrections made along the way |

## Scope & limitations

- **No current-year hand list.** The NMJL card changes every year and its
  specific hand patterns are copyrighted by the National Mah Jongg League,
  so the system prompt tells Claude not to invent them — only to teach the
  *general structure* of how the card is organized.
- **Answers are NMJL-standard by default.** If you mention a house rule,
  Claude is instructed to treat it as a table-specific variation, not
  present it as the official rule.
- **Grounded, not unrestricted.** The system prompt asks Claude to answer
  only from the supplied material and stay on-topic — but unlike the
  rule-based branches, this can't be mechanically guaranteed the way a
  keyword lookup can. Claude could still occasionally answer from its own
  general knowledge despite the instruction.
- **Costs money and requires an API key**, unlike `main`/`flexible-matching`
  which need neither.

## Sources

Content was built up in three passes, each correcting/extending the last
(see `CLAUDE.md` for the detailed changelog of corrections):
1. An original hand-written persona/system-prompt draft.
2. A more detailed rules reference (American Mahjong Guide /
   mahjongplaybook.com).
3. A 500-question NMJL Q&A dataset with citations to official NMJL links
   (nationalmahjonggleague.org), used as the final authority where it
   conflicted with the earlier two sources.
