const CATEGORY_LABELS: Record<string, string> = {
  "lawn-fertilizer": "Lawn Fertilizer",
  "office-chairs": "Office Chairs",
  "running-shoes": "Running Shoes",
  "protein-powder": "Protein Powder",
  "sunscreen": "Sunscreen",
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

export function promptToSlug(promptText: string): string {
  return promptText
    .toLowerCase()
    .replace(/i'm a \d+-year-old\s+/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function promptToTitle(promptText: string, categoryName: string): string {
  const lower = promptText.toLowerCase();

  if (lower.includes("compare") && lower.includes("rank")) {
    return `Best ${categoryName} Ranked by AI Models (2026)`;
  }
  if (lower.includes("under $")) {
    const priceMatch = promptText.match(/under \$(\d+)/i);
    const price = priceMatch ? priceMatch[1] : "50";
    return `Best ${categoryName} Under $${price} According to AI (2026)`;
  }
  if (lower.includes("alternative")) {
    const brandMatch = promptText.match(/alternatives? to (\w[\w\s]*?)(?:\s+for|\s*\.|\s*\?|$)/i);
    const brand = brandMatch ? brandMatch[1].trim() : null;
    if (brand) return `${brand} Alternatives: What AI Models Recommend Instead (2026)`;
    return `${categoryName} Alternatives Recommended by AI (2026)`;
  }
  if (lower.includes("what would you recommend") || lower.includes("best")) {
    return `What ${categoryName} Do AI Models Recommend in 2026?`;
  }

  return `AI Recommendations for ${categoryName} (2026)`;
}

export function promptToDescription(promptText: string, categoryName: string, topBrands: string[]): string {
  const brandStr = topBrands.slice(0, 3).join(", ");
  if (topBrands.length > 0) {
    return `We asked ChatGPT, Claude, Gemini, and Perplexity about ${categoryName.toLowerCase()}. ${brandStr} lead the recommendations. See the full breakdown.`;
  }
  return `See which ${categoryName.toLowerCase()} brands ChatGPT, Claude, Gemini, and Perplexity recommend most in 2026.`;
}

export { CATEGORY_LABELS };
