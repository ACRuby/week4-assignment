// Calls the Claude API directly from the browser. The API key is supplied by the user,
// kept only in this browser's localStorage, and sent only to api.anthropic.com — never
// committed to the repo, never sent anywhere else.
//
// The system prompt is built at runtime from knowledge-base.js (the same content the
// rule-based version on the flexible-matching/main branches answers from), so this stays
// a single source of truth and the model is grounded rather than answering from its own
// general knowledge of Mah Jongg.

const MODEL = "claude-sonnet-5";
const API_URL = "https://api.anthropic.com/v1/messages";
const STORAGE_KEY = "mahjong-teacher-anthropic-key";

const chatLog = document.getElementById("chat-log");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const apiKeyInput = document.getElementById("api-key-input");
const apiKeyStatus = document.getElementById("api-key-status");

let conversation = []; // { role: "user" | "assistant", content: string }[]

function buildSystemPrompt() {
  const sections = KNOWLEDGE_BASE.map((entry) => `### ${entry.title}\n${entry.content}`).join(
    "\n\n"
  );
  return (
    "You are a friendly, patient American Mahjong (NMJL) teacher chatbot for complete " +
    "beginners. Answer ONLY using the reference material below — it is everything you " +
    "know about the rules. If a question isn't covered by it (including anything about " +
    "the current year's specific NMJL hand list, which changes annually and isn't " +
    "included here), say so plainly and don't guess or invent an answer. If the user " +
    "describes a house rule, note it as a table-specific variation rather than presenting " +
    "it as the NMJL standard. Keep answers short and beginner-friendly, and stay on the " +
    "topic of American Mahjong — politely decline unrelated requests.\n\n" +
    "# Reference material\n\n" +
    sections
  );
}

const SYSTEM_PROMPT = buildSystemPrompt();

function addMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = "bubble " + sender;
  bubble.textContent = text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
  return bubble;
}

function loadApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function saveApiKey(key) {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private browsing, etc.) — key just won't persist across reloads.
  }
}

function setApiKeyStatus(text) {
  apiKeyStatus.textContent = text;
}

apiKeyInput.value = loadApiKey();
setApiKeyStatus(apiKeyInput.value ? "saved" : "");

apiKeyInput.addEventListener("input", () => {
  saveApiKey(apiKeyInput.value.trim());
  setApiKeyStatus(apiKeyInput.value.trim() ? "saved" : "");
});

async function callClaude(userText) {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    addMessage(
      "Enter your Anthropic API key above first — get one at console.anthropic.com.",
      "bot"
    );
    return;
  }

  conversation.push({ role: "user", content: userText });

  const thinkingBubble = addMessage("...", "bot");

  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        // Required to call the API directly from a browser page instead of a server.
        // This is what makes the user's own key visible in their own browser's network
        // tab — acceptable here since it's their key, entered by them, for their own use.
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: conversation,
      }),
    });
  } catch (err) {
    thinkingBubble.textContent =
      "Network error reaching the Claude API. Check your connection and try again.";
    conversation.pop();
    return;
  }

  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody?.error?.message || "";
    } catch {
      // ignore parse failure, fall back to status text below
    }
    if (response.status === 401) {
      thinkingBubble.textContent = "That API key was rejected. Double-check it and try again.";
    } else {
      thinkingBubble.textContent =
        "Claude API error (" + response.status + "). " + detail;
    }
    conversation.pop();
    return;
  }

  const data = await response.json();
  const reply = (data.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  thinkingBubble.textContent = reply || "(empty response)";
  conversation.push({ role: "assistant", content: reply });
}

function handleUserMessage(rawText) {
  const text = rawText.trim();
  if (!text) return;

  addMessage(text, "user");
  callClaude(text);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value;
  input.value = "";
  handleUserMessage(text);
});

addMessage(
  "Hi! I'm your American Mahjong (NMJL) teacher, powered by Claude. Enter your " +
    "Anthropic API key above, then ask me anything about setup, the Charleston, jokers, " +
    "winning, and more.",
  "bot"
);
