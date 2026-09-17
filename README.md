# Mahjong Teacher — Week 4 Assignment

A browser-based chatbot that teaches complete beginners how to play American
Mahjong (NMJL style). It's a static HTML/CSS/JS page with a rule-based
(keyword-matching) chatbot — no external LLM, no API key, no server required.

## Running it

Just open `index.html` in a browser, or serve the folder locally:

```bash
python -m http.server 8000
```

then visit `http://localhost:8000`.

## Files

- [index.html](index.html) — chat UI markup
- [style.css](style.css) — styling
- [knowledge-base.js](knowledge-base.js) — the chatbot's fixed knowledge:
  welcome/fallback text plus topic sections (equipment, table setup, seating,
  dealing, the Charleston, turn structure, jokers, picking a hand, the NMJL
  card's structure, scoring, winning, house rule variations), each with
  matching keywords
- [script.js](script.js) — chat UI logic; scores user input against each
  knowledge-base section's keywords and replies with the best match (or a
  fallback message if nothing matches)
- [mahjong_teacher_system_prompt.md](mahjong_teacher_system_prompt.md) — the
  original persona write-up that `knowledge-base.js` content is based on
- [mahjong_technical_reference.md](mahjong_technical_reference.md) — a more
  detailed rules source used as ground truth to correct/extend the knowledge
  base (dealing pattern, Charleston structure, jokers, scoring, card layout)
