# Week 4 Assignment

## Overview
A friendly, patient American Mahjong (NMJL) teacher chatbot that walks
complete beginners through setup, mechanics, and strategy one topic at a
time. Implemented as a static HTML/CSS/JS page with a rule-based
(keyword-matching) chatbot — no external LLM or API calls, no API key
required. All answers come from a fixed knowledge base in the project.

`mahjong_teacher_system_prompt.md` is kept as the original persona/content
reference; [knowledge-base.js](knowledge-base.js) is the structured,
in-browser version of that same content actually used by the chatbot.

[mahjong_technical_reference.md](mahjong_technical_reference.md) is a later,
more detailed source (American Mahjong Guide / mahjongplaybook.com) treated
as ground truth for this project. Where it conflicted with the original
system prompt (dealing pattern, Charleston structure), `knowledge-base.js`
was corrected to match the technical reference; `mahjong_teacher_system_prompt.md`
itself was left as the historical original and was not rewritten.

## Setup
Static site, no build step or server-side code:
- [index.html](index.html) — chat UI markup
- [style.css](style.css) — styling
- [knowledge-base.js](knowledge-base.js) — topic sections + keywords + welcome/fallback text
- [script.js](script.js) — keyword-matching logic that picks the best-matching
  knowledge-base section for each user message

Open `index.html` directly in a browser, or serve the folder locally (e.g.
`python -m http.server`) and visit it. No API key or dependencies needed.

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
