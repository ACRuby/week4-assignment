# Week 4 Assignment

## Overview
Design a custom AI persona/system prompt: a friendly, patient American Mahjong
(NMJL) teacher chatbot that walks complete beginners through setup, mechanics,
and strategy one concept at a time, checking for understanding before moving on.

The full system prompt lives in [mahjong_teacher_system_prompt.md](mahjong_teacher_system_prompt.md).

## Setup
Python CLI chatbot using the `anthropic` SDK (see [README.md](README.md)):
`app.py` loads the system prompt from `mahjong_teacher_system_prompt.md` and
streams a conversation with Claude (`claude-sonnet-5`). Requires
`ANTHROPIC_API_KEY` set in the environment.

## Notes
- If an NMJL card (current year's hand list) is added to the project's
  knowledge base, the persona should treat it as authoritative for specific
  hands/points/notation rather than inventing examples.
- Several rules are explicitly flagged as table/set-variant in the prompt
  (wall-break counting, East rotation on a win, Charleston/Courtesy pass
  variations) — the persona is instructed to present the common/default
  version and tell students to confirm with their own set/house rules.
