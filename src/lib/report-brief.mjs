// Opening cards use the same eligible answers and explicit ranks as the report.
export function reportBriefEvidence(brands, coverage, prompts) {
  const topCount = brands[0]?.mentionCount ?? 0;
  const mentionLeaders = brands.filter(b => b.mentionCount === topCount).map(b => b.name);
  const comparisons = (prompts.find(p => p.promptNumber === 3)?.agentBrands ?? [])
    .filter(row => row.hasResponse);
  const ranked = comparisons.filter(row => row.rankedBrands.length > 0);
  const firsts = new Map();
  for (const row of ranked) {
    for (const name of new Set(row.rankedBrands.filter(b => b.rank === 1).map(b => b.name))) {
      firsts.set(name, (firsts.get(name) ?? 0) + 1);
    }
  }
  const firstCount = Math.max(0, ...firsts.values());
  return {
    mentions: { names: mentionLeaders, count: topCount, total: coverage.eligible },
    firstPlaces: {
      names: [...firsts].filter(([, count]) => count === firstCount).map(([name]) => name).sort(),
      count: firstCount,
      total: ranked.length,
    },
    unranked: comparisons.length - ranked.length,
  };
}
