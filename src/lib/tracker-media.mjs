import { isEligibleResponse } from "./report-ranking.mjs";

const base = "/tracker-media/protein-powder/";
const marks = {
  "Optimum Nutrition": "optimum-nutrition-logo.webp",
  "Transparent Labs": "transparent-labs-logo.png",
  Dymatize: "dymatize-logo.png",
  Momentous: "momentous-logo.png",
  Orgain: "orgain-logo.png",
  Ascent: "ascent-logo.png",
};

export function brandMark(category, brand) {
  if (category !== "protein-powder" || !marks[brand]) return null;
  return { src: base + marks[brand], dark: brand === "Ascent" };
}

// This editorial pilot is tied to one captured snapshot. Brand-level counts
// never become product counts; only exact names in usable P3 text get photos.
const comparisonAnswers = {
  chatgpt: 1704,
  claude: 1709,
  gemini: 1713,
  perplexity: 1711,
};
const products = [
  {
    id: "ascent-whey",
    brand: "Ascent",
    name: "100% Whey Protein Blend",
    image: "ascent-whey.png",
    alt: "Ascent whey protein, chocolate bag",
    source: "https://www.ascentprotein.com/collections/whey-protein-powder",
    pattern: /\bAscent (?:Native Fuel Whey|100% Whey Protein Blend)\b/i,
  },
  {
    id: "dymatize-iso100",
    brand: "Dymatize",
    name: "ISO100",
    image: "dymatize-iso100.jpg",
    alt: "Dymatize ISO100, Gourmet Chocolate tub",
    source: "https://dymatize.com/iso100",
    pattern: /\bDymatize ISO100\b/i,
  },
  {
    id: "momentous-whey",
    brand: "Momentous",
    name: "Whey Protein Isolate",
    image: "momentous-whey.png",
    alt: "Momentous whey protein isolate, chocolate tub",
    source: "https://www.livemomentous.com/products/essential-whey-protein",
    pattern:
      /\bMomentous (?:Essential )?(?:Grass-Fed )?Whey Protein Isolate\b/i,
  },
  {
    id: "optimum-whey",
    brand: "Optimum Nutrition",
    name: "Gold Standard 100% Whey",
    image: "optimum-whey.png",
    alt: "Optimum Nutrition Gold Standard 100% Whey, Extreme Milk Chocolate tub",
    source:
      "https://www.optimumnutrition.com/en-us/products/gold-standard-100-whey-protein-powder",
    pattern: /\bOptimum Nutrition (?:\(ON\) )?Gold Standard (?:100% )?Whey\b/i,
  },
  {
    id: "orgain-plant",
    brand: "Orgain",
    name: "Organic Plant-Based Protein Powder",
    image: "orgain-plant.png",
    alt: "Orgain Organic Plant-Based Protein Powder, chocolate tub",
    source:
      "https://orgain.com/products/organic-protein-plant-based-protein-powder",
    pattern: /\bOrgain Organic Plant-Based Protein Powder\b/i,
  },
  {
    id: "transparent-labs-whey",
    brand: "Transparent Labs",
    name: "Grass-Fed Whey Protein Isolate",
    image: "transparent-labs-whey.png",
    alt: "Transparent Labs Grass-Fed Whey Protein Isolate, chocolate tub",
    source: "https://www.transparentlabs.com/products/whey-protein-isolate",
    pattern:
      /\bTransparent Labs (?:100% )?(?:Grass-Fed )?Whey (?:Protein )?Isolate\b/i,
  },
];

export function snapshotProducts(category, runId, responses) {
  if (category !== "protein-powder" || runId !== 166) return [];
  return products.flatMap(({ pattern, ...product }) => {
    const evidence = responses
      .filter(
        (r) =>
          r.run_id === runId &&
          r.prompt_number === 3 &&
          r.id === comparisonAnswers[r.agent_name] &&
          isEligibleResponse(r) &&
          pattern.test(r.raw_response),
      )
      .map((r) => ({
        answerId: r.id,
        agent: r.agent_name,
        promptNumber: r.prompt_number,
      }));
    return evidence.length
      ? [{ ...product, image: base + product.image, evidence }]
      : [];
  });
}
