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

// Ordinary English words that happen to appear in only one or two of this KB's keyword
// lists — which makes the rarity weighting below treat them as strong signals, when
// really they're just common words ("need", "game", "play") that show up in unrelated
// sentences all the time. They can still help complete a FULL keyword match, but alone
// they can't carry a match the way a genuinely domain-specific word like "pung" can.
const GENERIC_WORDS = new Set([
  "need", "game", "name", "play", "thing", "way", "help", "fun", "today", "walk",
  "dinner", "spell", "doing", "yourself", "myself", "like"
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
    .replace(/'/g, "") // "don't" -> "dont", "year's" -> "years" — never split into a stray letter
    .replace(/[^a-z0-9\s]/g, " ");
}

function tokenize(text) {
  return normalize(text).split(/\s+/).filter(Boolean);
}

// Content words for matching: stopwords are dropped BEFORE stemming, not after — stemming a
// stopword can accidentally produce a different, non-stopword string ("this" -> "thi", "does"
// -> "doe"), which would otherwise leak through as a bogus content word and let two unrelated
// messages "match" on that fragment. The second filter is a safety net for the rare case where
// stemming a genuine content word happens to produce something that collides with a stopword.
function contentWords(text) {
  return tokenize(text)
    .filter((w) => !STOPWORDS.has(w))
    .map(stem)
    .filter((w) => !STOPWORDS.has(w));
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

// How many entries' keywords mention each word, computed once. A word that shows up in
// only one or two entries ("pung", "quint") is a strong, specific signal; a word that
// shows up in twenty ("what", "how", "card") is weak and generic. Weighting by this
// (an IDF-style score) means a single mention of "pung" can win a match on its own,
// while a single mention of "what" — shared by dozens of unrelated "what is X" keywords
// — can't accidentally win a match against a genuinely off-topic message.
const WORD_ENTRY_COUNT = (() => {
  const counts = new Map();
  for (const section of KNOWLEDGE_BASE) {
    const wordsInEntry = new Set();
    for (const keyword of section.keywords) {
      for (const w of contentWords(keyword)) wordsInEntry.add(w);
    }
    for (const w of wordsInEntry) counts.set(w, (counts.get(w) || 0) + 1);
  }
  return counts;
})();

function wordWeight(word) {
  return 1 / (WORD_ENTRY_COUNT.get(word) || 1);
}

// Minimum score to count as a real match rather than coincidence. Tuned so a single
// mention of a word unique to one entry (weight 1) clears it at the weakest (partial
// overlap, tier 1) matching tier, but a single mention of a word shared by ~4+ entries
// (weight ≤ 0.25) does not.
const MATCH_THRESHOLD = 0.3;

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

      const presentWords = kwWords.filter((w) => queryWordSet.has(w));
      if (presentWords.length === 0) continue;

      let tier;
      if (isSubsequence(kwWords, queryWords)) {
        tier = 8; // right words, right order
      } else if (presentWords.length === kwWords.length) {
        tier = 4; // right words, any order
      } else {
        tier = 1; // partial overlap
      }

      // At the weak partial-overlap tier, a generic word can't carry the match on its
      // own — only count it there once at least one non-generic word also overlapped.
      const weightWords =
        tier === 1 ? presentWords.filter((w) => !GENERIC_WORDS.has(w)) : presentWords;
      if (tier === 1 && weightWords.length === 0) continue;
      const weight = weightWords.reduce((sum, w) => sum + wordWeight(w), 0);

      const kwScore = weight * tier;
      if (kwScore > score) score = kwScore;
    }

    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  return bestScore > MATCH_THRESHOLD ? bestSection : null;
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
