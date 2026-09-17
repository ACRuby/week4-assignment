// Rule-based matching only — no external API calls, no LLM. Answers come from knowledge-base.js.

const chatLog = document.getElementById("chat-log");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");

function addMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = "bubble " + sender;
  bubble.textContent = text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function findBestMatch(userText) {
  const normalized = normalize(userText);

  let bestSection = null;
  let bestScore = 0;

  for (const section of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of section.keywords) {
      const normalizedKeyword = normalize(keyword).trim();
      if (normalizedKeyword && normalized.includes(normalizedKeyword)) {
        score += normalizedKeyword.split(/\s+/).length; // multi-word keyword matches count more
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  return bestScore > 0 ? bestSection : null;
}

function handleUserMessage(rawText) {
  const text = rawText.trim();
  if (!text) return;

  addMessage(text, "user");

  const normalized = normalize(text);

  if (["hi", "hello", "hey", "start", "help", "topics"].some((g) => normalized === g || normalized.includes(g))) {
    addMessage(WELCOME_MESSAGE, "bot");
    return;
  }

  const match = findBestMatch(text);
  if (match) {
    addMessage(match.title + "\n\n" + match.content, "bot");
  } else {
    addMessage(FALLBACK_MESSAGE, "bot");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value;
  input.value = "";
  handleUserMessage(text);
});

addMessage(WELCOME_MESSAGE, "bot");
