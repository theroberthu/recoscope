const CATEGORY_LABELS: Record<string, string> = {
  "lawn-fertilizer": "Lawn Fertilizer",
  "office-chairs": "Office Chairs",
  "running-shoes": "Running Shoes",
  "protein-powder": "Protein Powder",
  "sunscreen": "Sunscreen",
  "humidifiers": "Humidifiers",
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
    return `Compare AI rankings for ${category}. See how brands appear across assistants, with the exact shopper question behind the results.`;
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

export { CATEGORY_LABELS };
