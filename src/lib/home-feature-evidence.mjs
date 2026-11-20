import { eligibleMentions, mentionCounts, validRank } from './report-ranking.mjs';

/** A small visual comparison, with separate answer and ranked-comparison denominators. */
export function homeFeatureEvidence({ mentions, responses, comparison }) {
  const counts = mentionCounts(eligibleMentions(mentions, responses));
  const ranked = comparison.filter(row => row.hasResponse && row.rankedBrands.some(b => validRank(b.rank) !== null));
  const firsts = new Map();
  for (const row of ranked) {
    const names = new Set(row.rankedBrands.filter(b => validRank(b.rank) === 1).map(b => b.name));
    for (const name of names) firsts.set(name, (firsts.get(name) ?? 0) + 1);
  }
  const firstLeader = [...firsts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
  const displayed = counts.slice(0, 2);
  if (firstLeader && !displayed.some(b => b.name === firstLeader)) {
    const leader = counts.find(b => b.name === firstLeader);
    if (leader) displayed.splice(1, 1, leader);
  }
  return { brands: displayed.map(b => ({ ...b, firstPlaces: ranked.length ? firsts.get(b.name) ?? 0 : null })), rankedComparisons: ranked.length };
}
