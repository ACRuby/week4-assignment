// Rule-based matching only — no external API calls, no LLM. Answers come from knowledge-base.js.
//
// Matching is tokenized and stemmed rather than exact-substring, so users don't have to
// phrase things exactly like a keyword: plurals/verb endings are normalized ("jokers" ~
// "joker", "passing" ~ "pass"), word order doesn't matter, and partial overlap still scores
// something instead of nothing. A keyword phrase matched in the right order scores highest,
// the same words present in any order scores less, and partial word overlap scores least —
// so a precise question still beats a vague one, but a vague one still gets an answer.

const chatLog = document.getElementById("chat-log");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");

// Deliberately keeps interrogatives (who/what/when/where/why/how) as content words —
// they're often the only thing distinguishing similar questions ("who is East" vs
// "how is East decided"), so stripping them collapses too many entries onto one word.
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "do", "does", "did", "can", "could",
  "should", "would", "will", "shall", "i", "you", "he", "she", "it", "we", "they", "my",
  "your", "his", "her", "its", "our", "their", "this", "that", "these", "those",
  "whom", "of", "in", "on", "at", "to", "for",
  "with", "and", "or", "but", "not", "no", "yes", "if", "then", "than", "as", "be",
  "been", "being", "have", "has", "had", "just", "please", "me", "there", "here",
  "normally", "about", "up", "so", "such", "some", "any", "one"
]);

function addMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = "bubble " + sender;
  bubble.textContent = text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Very small suffix-stripping stemmer — just enough to fold common plural/verb endings
// together (jokers -> joker, passing -> pass, exposed -> expose) without a real NLP library.
function stem(word) {
  if (word.length > 5 && word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  // Strip a lone trailing "e" so silent-e verbs match their -ing form consistently
  // (announce/announcing both land on "announc"; expose/exposing both land on "expos").
  if (word.length > 4 && word.endsWith("e") && !word.endsWith("ee")) return word.slice(0, -1);
  return word;
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/mah[\s-]*jong+/g, "mahjong") // fold spelling variants: mah jongg, mah-jong, majhong...
    .replace(/[^a-z0-9\s]/g, " ");
}

function tokenize(text) {
  return normalize(text)
    .split(/\s+/)
    .filter(Boolean)
    .map(stem);
}

function contentWords(text) {
  return tokenize(text).filter((w) => !STOPWORDS.has(w));
}

// True if every word in `small` appears in `big`, in the same relative order
// (not necessarily adjacent) — i.e. small is a subsequence of big.
function isSubsequence(small, big) {
  let i = 0;
  for (const word of big) {
    if (i < small.length && word === small[i]) i++;
  }
  return i === small.length;
}

function findBestMatch(userText) {
  const queryWords = contentWords(userText);
  const queryWordSet = new Set(queryWords);

  let bestSection = null;
  let bestScore = 0;

  for (const section of KNOWLEDGE_BASE) {
    // Use the section's single best-matching keyword, not the sum across all of
    // them — otherwise an entry with many loosely related keywords could out-score
    // an entry with one precisely matching keyword just by having more of them.
    let score = 0;

    for (const keyword of section.keywords) {
      const kwWords = contentWords(keyword);
      if (kwWords.length === 0) continue;

      let kwScore;
      if (isSubsequence(kwWords, queryWords)) {
        kwScore = kwWords.length * 3; // right words, right order
      } else {
        const overlap = kwWords.filter((w) => queryWordSet.has(w)).length;
        if (kwWords.length > 1 && overlap === kwWords.length) {
          kwScore = kwWords.length * 2; // right words, any order
        } else {
          kwScore = overlap; // partial overlap — still counts for something
        }
      }
      if (kwScore > score) score = kwScore;
    }

    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  return bestScore > 0 ? bestSection : null;
}

const GREETINGS = new Set(["hi", "hello", "hey", "start", "help", "topics", "topic"]);

function handleUserMessage(rawText) {
  const text = rawText.trim();
  if (!text) return;

  addMessage(text, "user");

  const words = tokenize(text);
  if (words.length <= 3 && words.some((w) => GREETINGS.has(w))) {
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
