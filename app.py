"""CLI chatbot: American Mahjong (NMJL) teacher, powered by the Claude API."""

import os
import sys
from pathlib import Path

from anthropic import Anthropic

MODEL = "claude-sonnet-5"
SYSTEM_PROMPT_PATH = Path(__file__).parent / "mahjong_teacher_system_prompt.md"


def load_system_prompt() -> str:
    return SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")


def main() -> None:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: set the ANTHROPIC_API_KEY environment variable first.", file=sys.stderr)
        sys.exit(1)

    client = Anthropic(api_key=api_key)
    system_prompt = load_system_prompt()
    messages = []

    print("Mahjong Teacher — ask me anything about American Mahjong (NMJL).")
    print("Type 'quit' or 'exit' to leave.\n")

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue
        if user_input.lower() in {"quit", "exit"}:
            print("Goodbye!")
            break

        messages.append({"role": "user", "content": user_input})

        print("Teacher: ", end="", flush=True)
        reply_text = ""
        with client.messages.stream(
            model=MODEL,
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                print(text, end="", flush=True)
                reply_text += text
        print("\n")

        messages.append({"role": "assistant", "content": reply_text})


if __name__ == "__main__":
    main()
