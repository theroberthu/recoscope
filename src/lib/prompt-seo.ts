const CATEGORY_LABELS: Record<string, string> = {
  "lawn-fertilizer": "Lawn Fertilizer",
  "office-chairs": "Office Chairs",
  "running-shoes": "Running Shoes",
  "protein-powder": "Protein Powder",
  "sunscreen": "Sunscreen",
  "humidifiers": "Humidifiers",
  "space-heaters": "Space Heaters",
  "skincare": "Skincare",
  "mattress-toppers": "Mattress Toppers",
  "wireless-earbuds": "Wireless Earbuds",
  "electric-shavers": "Electric Shavers",
  "air-purifiers": "Air Purifiers",
  "robot-vacuums": "Robot Vacuums",
  "dog-food": "Dog Food",
  "standing-desks": "Standing Desks",
  "collagen-supplements": "Collagen Supplements",
  "foam-rollers": "Foam Rollers",
};

// FNV-1a hash, 8-char hex output. Used to disambiguate slug collisions.
function fnv1aHash(s: string): string {
  let hash = 2166136261;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function baseSlug(promptText: string, maxLen: number): string {
  return promptText
    .toLowerCase()
    .replace(/i'?m a \d+-year-old\s+/g, "")
    .replace(/i'?m a\s+/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLen);
}

export function promptToSlug(promptText: string): string {
  const base = baseSlug(promptText, 60);
  const hash = fnv1aHash(promptText.trim().toLowerCase());
  return `${base}-${hash}`;
}

/** Category-qualified identity, also accepted as an alias for unique questions. */
export function categoryPromptSlug(promptText: string, categorySlug: string): string {
  return `${categorySlug}-${promptToSlug(promptText)}`;
}

type PromptIdentity = { prompt_text: string; category_slug: string };
export function promptPageSlug(prompt: PromptIdentity, all: PromptIdentity[]): string {
  const slug = promptToSlug(prompt.prompt_text);
  const categories = new Set(all.filter(p => promptToSlug(p.prompt_text) === slug).map(p => p.category_slug));
  // Keep the indexed Electric Shavers URL; split the other two historical
  // categories without changing the established search result's address.
  const legacyOwner = slug === 'compare-top-brands-and-rank-them-6537e966' && prompt.category_slug === 'electric-shavers';
  return categories.size > 1 && !legacyOwner ? categoryPromptSlug(prompt.prompt_text, prompt.category_slug) : slug;
}

export function resolvePromptSlug(slug: string, all: PromptIdentity[]) {
  const qualified = all.find(p => categoryPromptSlug(p.prompt_text, p.category_slug) === slug);
  if (qualified) return { ...qualified, canonicalSlug: promptPageSlug(qualified, all) };
  const matches = all.filter(p => promptToSlug(p.prompt_text) === slug || promptToOldSlug(p.prompt_text) === slug);
  // Preserve the established Electric Shavers search result's intent. Other
  // ambiguous legacy aliases must never pick an arbitrary category from SQL order.
  const owner = matches.length === 1 ? matches[0] :
    matches.find(p => promptToSlug(p.prompt_text) === 'compare-top-brands-and-rank-them-6537e966' && p.category_slug === 'electric-shavers');
  return owner ? { ...owner, canonicalSlug: promptPageSlug(owner, all) } : null;
}

// Old slug format (no hash, 80-char truncation). Used only for 301 redirects
// from the previous URL scheme.
export function promptToOldSlug(promptText: string): string {
  return baseSlug(promptText, 80);
}

function extractPersona(promptText: string): string | null {
  const patterns = [
    /i'?m a \d+-year-old\s+(.+?)(?:,\s*looking|,\s*who(?:'s|s)?|,\s*building|,\s*setting|,\s*maintaining|,\s*dealing|,\s*growing|,\s*noticing|\.|$)/i,
    /i'?m a\s+(.+?)(?:,\s*looking|,\s*who(?:'s|s)?|,\s*building|,\s*setting|,\s*maintaining|,\s*dealing|,\s*growing|,\s*noticing|\.|$)/i,
  ];
  for (const pat of patterns) {
    const match = promptText.match(pat);
    if (match && match[1]) {
      let persona = match[1].trim();
      persona = persona.replace(/\s+(?:in|from) the (?:usa|us|united states)$/i, "");
      persona = persona.replace(/\s+$/, "");
      if (persona.length < 3) continue;
      return persona.charAt(0).toUpperCase() + persona.slice(1);
    }
  }
  return null;
}

export function promptToTitle(promptText: string, categoryName: string): string {
  const lower = promptText.toLowerCase();
  const persona = extractPersona(promptText);
  const suffix = persona ? ` for ${persona}` : "";

  if (lower.includes("compare") && lower.includes("rank")) {
    return `Best ${categoryName} Ranked by AI Models${suffix} (2026)`;
  }
  if (lower.includes("under $")) {
    const priceMatch = promptText.match(/under \$(\d+)/i);
    const price = priceMatch ? priceMatch[1] : "50";
    return `Best ${categoryName} Under $${price} According to AI${suffix} (2026)`;
  }
  if (lower.includes("alternative")) {
    const brandMatch = promptText.match(/alternatives? to ([\w&'-]+(?:\s+[\w&'-]+){0,2})/i);
    const brand = brandMatch ? brandMatch[1].trim() : null;
    if (brand) return `${brand} Alternatives: What AI Recommends Instead${suffix} (2026)`;
    return `${categoryName} Alternatives Recommended by AI${suffix} (2026)`;
  }
  if (lower.includes("what would you recommend") || lower.includes("best")) {
    return `What ${categoryName} Do AI Models Recommend${suffix} (2026)?`;
  }

  return `AI Recommendations for ${categoryName}${suffix} (2026)`;
}

export function promptToDescription(promptText: string, categoryName: string): string {
  const category = categoryName.trim().toLowerCase();
  const prompt = promptText.toLowerCase();
  // Describe the question being measured, without turning mention counts into
  // endorsements or implying that a budget mention verifies the product price.
  if (prompt.includes("compare") && prompt.includes("rank")) {
    return `Which ${category} did AI rank first? Compare captured picks from ChatGPT, Claude, Gemini and Perplexity, with dates and the exact question.`;
  }
  const budget = promptText.match(/\bunder\s+\$\s*(\d[\d,]*(?:\.\d{1,2})?)/i);
  if (budget) {
    return `Which ${category} appear in AI answers to an under-$${budget[1]} question? Compare brand mentions across assistants and explore the exact shopper prompt.`;
  }
  if (prompt.includes("alternative")) {
    return `Explore ${category} alternatives mentioned by AI assistants. Compare brand mentions and recorded ranks, with the exact question behind the results.`;
  }
  return `Which ${category} do AI assistants mention? Compare brand visibility and recorded ranks across models, with the exact shopper question behind the results.`;
}

const promptSearchSummaries = {
  "electric-shaver-under-150-for-sensitive-skin-daily-use-7b25b63c": {
    title: "Electric Shavers Under $150 for Sensitive Skin: AI Picks",
    description: "Braun ranked first in all four AI answers about shavers under $150 for sensitive skin. Philips Norelco appeared in all four. Prices weren’t verified.",
    result: "Braun ranked first in all four answers.",
    intro: "We asked four AI assistants which electric shaver they would recommend for daily use on sensitive skin with a budget under $150. Braun and Philips Norelco each appeared in all four answers. Panasonic appeared in three.",
    limitation: "The $150 limit was part of the question. The benchmark did not verify prices or test performance on sensitive skin.",
    snapshotDate: "2026-05-30",
    latestLabel: "See the latest electric shaver benchmark",
  },
  "compare-top-wireless-earbud-brands-and-rank-them-same-profil-a7dbfe14": {
    title: "Wireless Earbuds Ranked by AI: Sony, Apple, Beats and Bose",
    description: "Sony took first in two of four AI earbud rankings. Apple and Beats each took one. Bose appeared in all four answers. See the picks by assistant.",
    result: "Sony led the rankings. Bose appeared most often.",
    intro: "Sony ranked first in two of four AI answers. Apple and Beats each ranked first once. Bose appeared in all four answers and received no first-place ranks.",
    limitation: "The comparison records how assistants ranked brands for one shopper profile. It does not test sound quality, fit or earbud features.",
    snapshotDate: "2026-05-25",
    latestLabel: "See the latest wireless earbud benchmark",
  },
} as const;

export function promptSearchSummary(canonicalSlug: string) {
  if (Object.hasOwn(promptSearchSummaries, canonicalSlug)) {
    return promptSearchSummaries[canonicalSlug as keyof typeof promptSearchSummaries];
  }
  return undefined;
}

export { CATEGORY_LABELS };
