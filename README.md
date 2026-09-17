# Mahjong Teacher — Week 4 Assignment

A command-line chatbot that teaches complete beginners how to play American
Mahjong (NMJL style), powered by the Claude API and a custom system prompt.

## Setup

1. Create a virtual environment and install dependencies:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Set your Anthropic API key:

   ```bash
   set ANTHROPIC_API_KEY=your-key-here
   ```

3. Run the chatbot:

   ```bash
   python app.py
   ```

## Files

- [mahjong_teacher_system_prompt.md](mahjong_teacher_system_prompt.md) — the
  full persona/system prompt for the Mahjong teacher.
- [app.py](app.py) — CLI chat loop that streams responses from Claude using
  the system prompt above.
