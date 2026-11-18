import { applyRecordedExclusions, eligibleMentions, isEligibleResponse, validRank, displayAgent } from './report-ranking.mjs';

/** Keep each response's recorded positions; never renumber across dates or models. */
export function buildPromptReport(runs, responses, mentions) {
  const counts = new Map();
  let usable = 0;
  const snapshots = runs.map(run => {
    const cells = applyRecordedExclusions(responses.filter(r => Number(r.run_id) === Number(run.id)), run.id);
    const allowed = eligibleMentions(mentions.filter(m => Number(m.run_id) === Number(run.id)), cells)
      .filter(m => cells.some(r => r.agent_name.toLowerCase() === m.agent_name.toLowerCase() && Number(r.prompt_number) === Number(m.prompt_number) && isEligibleResponse(r)));
    const answers = cells.map(cell => {
      const eligible = isEligibleResponse(cell);
      if (eligible) usable++;
      const brands = allowed.filter(m => m.agent_name.toLowerCase() === cell.agent_name.toLowerCase() && Number(m.prompt_number) === Number(cell.prompt_number))
        .map(m => ({ brand: m.brand_name_normalized, rank: validRank(m.mention_rank) }))
        .sort((a,b) => (a.rank ?? Infinity) - (b.rank ?? Infinity) || a.brand.localeCompare(b.brand));
      for (const b of brands) {
        const item = counts.get(b.brand) ?? { brand: b.brand, mentions: 0, top3: 0, first_picks: 0 };
        item.mentions++;
        if (b.rank !== null && b.rank <= 3) item.top3++;
        if (b.rank === 1) item.first_picks++;
        counts.set(b.brand, item);
      }
      return { agent_name: displayAgent(cell.agent_name), prompt_number: cell.prompt_number, eligible, brands,
        status: eligible ? brands.length ? null : 'No brands recorded' : cell.analysis_exclusion_reason || /^\s*\[EXCLUDED/i.test(cell.raw_response ?? '') ? 'Excluded from analysis' : 'Unavailable' };
    }).sort((a,b) => a.agent_name.localeCompare(b.agent_name) || a.prompt_number - b.prompt_number);
    return { ...run, answers };
  });
  return { snapshots, usable_answers: usable, captured_answers: responses.length,
    brands: [...counts.values()].sort((a,b) => b.mentions - a.mentions || a.brand.localeCompare(b.brand)) };
}
