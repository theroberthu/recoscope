/**
 * Clean AI-generated text for public display.
 * Strips filler words, hedging phrases, em dashes, and breaks long sentences.
 */

const FILLER_STARTS = /^(Notably|Interestingly|Importantly|Significantly|Essentially|Fundamentally|Functionally|Furthermore|Moreover|Additionally|Overall|Ultimately|Consequently),?\s*/i;

const HEDGE_PHRASES = /\b(suggesting that|which suggests that|it is worth noting that|it should be noted that|it is important to note that)\b/gi;

const WEAK_ADVERBS = /\b(notably|functionally|consistently|essentially|fundamentally|interestingly|significantly|ultimately|particularly)\b\s*/gi;

/** Replace em dashes with sentence breaks or commas */
function fixEmDashes(text: string): string {
  // " — " between clauses: split into two sentences if both sides are long
  return text.replace(/\s*[—–]\s*/g, (_, offset) => {
    const before = text.slice(0, offset);
    const after = text.slice(offset);
    // If the text before the dash ends mid-sentence and after starts lowercase,
    // use a comma. Otherwise use a period.
    const afterDash = after.replace(/^[\s—–]+/, "");
    if (afterDash[0] && afterDash[0] === afterDash[0].toLowerCase()) {
      return ", ";
    }
    return ". ";
  });
}

/** Break sentences longer than ~25 words at a natural point */
function breakLongSentences(text: string): string {
  const sentences = text.split(/(?<=\.)\s+/);
  const result: string[] = [];

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    if (words.length <= 25) {
      result.push(sentence);
      continue;
    }

    // Find a breakpoint near the middle at a conjunction or comma
    const mid = Math.floor(words.length / 2);
    let breakAt = -1;

    // Search outward from middle for a good split point
    for (let offset = 0; offset < mid; offset++) {
      for (const idx of [mid + offset, mid - offset]) {
        if (idx <= 2 || idx >= words.length - 2) continue;
        const word = words[idx].toLowerCase().replace(/,/, "");
        if (["and", "but", "while", "which", "where", "because", "since", "although"].includes(word)) {
          breakAt = idx;
          break;
        }
        // Also break at commas
        if (words[idx - 1]?.endsWith(",")) {
          breakAt = idx;
          break;
        }
      }
      if (breakAt !== -1) break;
    }

    if (breakAt !== -1) {
      const first = words.slice(0, breakAt).join(" ").replace(/,\s*$/, ".");
      const rest = words.slice(breakAt).join(" ");
      // Capitalize first letter of second sentence
      const capitalized = rest.charAt(0).toUpperCase() + rest.slice(1);
      result.push(first, capitalized);
    } else {
      result.push(sentence);
    }
  }

  return result.join(" ");
}

/** Main cleanup function */
export function cleanText(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  let cleaned = text.trim();
  if (!cleaned) return undefined;

  // Strip leading filler words per line
  cleaned = cleaned
    .split("\n")
    .map((line) => line.replace(FILLER_STARTS, ""))
    .join("\n");

  // Remove hedge phrases
  cleaned = cleaned.replace(HEDGE_PHRASES, "");

  // Remove weak adverbs
  cleaned = cleaned.replace(WEAK_ADVERBS, "");

  // Fix em dashes
  cleaned = fixEmDashes(cleaned);

  // Clean up double spaces and orphaned commas
  cleaned = cleaned.replace(/\s{2,}/g, " ");
  cleaned = cleaned.replace(/,\s*,/g, ",");
  cleaned = cleaned.replace(/\.\s*\./g, ".");
  cleaned = cleaned.replace(/,\s*\./g, ".");

  // Break long sentences
  cleaned = cleaned
    .split("\n")
    .map((line) => breakLongSentences(line))
    .join("\n");

  // Capitalize first letter of each line
  cleaned = cleaned
    .split("\n")
    .map((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return trimmedLine;
      return trimmedLine.charAt(0).toUpperCase() + trimmedLine.slice(1);
    })
    .join("\n");

  return cleaned;
}
