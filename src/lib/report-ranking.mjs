/** A missing or invalid rank must never become zero through Number(null). */
export function validRank(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const rank = Number(value);
  return Number.isInteger(rank) && rank > 0 ? rank : null;
}

const MODEL_NAMES = { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', perplexity: 'Perplexity', rufus: 'Rufus', sparky: 'Sparky' };
export function displayAgent(agent) { return MODEL_NAMES[agent.toLowerCase()] ?? agent; }
const cellKey = (row) => `${row.agent_name.toLowerCase()}:${Number(row.prompt_number)}`;
export function isEligibleResponse(response) {
  return Boolean(response?.raw_response?.trim()) && !/^\s*\[(?:UNAVAILABLE|EXCLUDED)\b/i.test(response.raw_response);
}

/** Count a brand once per usable response, including unranked/critical mentions. */
export function eligibleMentions(mentions, responses) {
  const cells = new Map(responses.map(r => [cellKey(r), r]));
  const seen = new Set();
  return mentions.filter(m => {
    if (!m.brand_name_normalized || m.mentioned === false || m.mentioned === 'f' || m.mentioned === 'false') return false;
    const response = cells.get(cellKey(m));
    if (response && !isEligibleResponse(response)) return false;
    const key = `${cellKey(m)}:${m.brand_name_normalized}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function responseCoverage(responses) {
  const cells = [...new Map(responses.map(r => [cellKey(r), r])).values()];
  const eligible = cells.filter(isEligibleResponse);
  return {
    captured: cells.length,
    eligible: eligible.length,
    models: [...new Set(eligible.map(r => displayAgent(r.agent_name)))].sort(),
    unavailableModels: [...new Set(cells.filter(r => !isEligibleResponse(r)).map(r => displayAgent(r.agent_name)))].sort(),
  };
}

export function mentionCounts(mentions) {
  const counts = new Map();
  for (const m of mentions) counts.set(m.brand_name_normalized, (counts.get(m.brand_name_normalized) ?? 0) + 1);
  return [...counts].map(([name, mentionCount]) => ({name, mentionCount}))
    .sort((a,b) => b.mentionCount - a.mentionCount || a.name.localeCompare(b.name));
}

export function buildPromptBreakdown(prompts, mentions, responses) {
  const usableMentions = eligibleMentions(mentions, responses);
  return prompts.map((p) => {
    const cells = responses.filter((r) => Number(r.prompt_number) === Number(p.prompt_number));
    const promptMentions = usableMentions.filter((m) => Number(m.prompt_number) === Number(p.prompt_number));
    const agents = [...new Set([...cells.map((r) => r.agent_name.toLowerCase()), ...promptMentions.map((m) => m.agent_name.toLowerCase())])].sort();
    return {
      promptNumber: Number(p.prompt_number),
      promptText: p.prompt_text,
      agentBrands: agents.map((agent) => {
        const response = cells.find((r) => r.agent_name.toLowerCase() === agent);
        const unavailable = Boolean(response && !isEligibleResponse(response));
        const all = promptMentions.filter((m) => m.agent_name.toLowerCase() === agent);
        const ranked = new Map();
        if (!unavailable) for (const m of all) {
          const rank = validRank(m.mention_rank);
          if (rank === null) continue;
          const current = ranked.get(m.brand_name_normalized);
          if (current === undefined || rank < current) ranked.set(m.brand_name_normalized, rank);
        }
        const rankedBrands = [...ranked].map(([name, rank]) => ({name, rank})).sort((a,b) => a.rank - b.rank || a.name.localeCompare(b.name));
        return {
          agent,
          brands: rankedBrands.filter(b => b.rank <= 3).map(b => b.name),
          rankedBrands,
          allBrands: [...new Set(all.map(m => m.brand_name_normalized))].sort(),
          hasResponse: Boolean(response && !unavailable),
          status: unavailable ? 'Unavailable' : ranked.size ? null : all.length ? 'Unranked — brand mentions retained' : 'No brands recorded',
        };
      }),
    };
  });
}

/** Preserve ties and empty rank positions rather than inventing a new order. */
export function rankSlots(rankedBrands) {
  return [1,2,3].map(rank => rankedBrands.filter(b => b.rank === rank).map(b => b.name).join(' / '));
}

/** Compare the same services with usable answers for all three prompt types. */
export function buildBudgetInsights(prompts) {
  const rows = [1,2,3].map(n => prompts.find(p => p.promptNumber === n)?.agentBrands ?? []);
  const common = rows[0].filter(r => r.hasResponse && rows.slice(1).every(group => group.some(other => other.agent === r.agent && other.hasResponse))).map(r => r.agent);
  if (!common.length) return null;
  const brands = rows.map(group => new Set(group.filter(r => common.includes(r.agent)).flatMap(r => r.allBrands)));
  const nonBudget = new Set([...brands[0], ...brands[2]]);
  const budgetOnly = [...brands[1]].filter(b => !nonBudget.has(b)).sort();
  const disappearUnderBudget = [...nonBudget].filter(b => !brands[1].has(b)).sort();
  return budgetOnly.length || disappearUnderBudget.length ? {budgetOnly, disappearUnderBudget, modelsCompared: common.length} : null;
}

export function snapshotFinding(brands, coverage) {
  if (!brands.length) return coverage.eligible ? 'No brand mentions were recorded in the usable answers.' : 'No usable answers were captured in this snapshot.';
  const leaders = brands.filter(b => b.mentionCount === brands[0].mentionCount);
  const names = leaders.slice(0,2).map(b => b.name).join(' and ');
  const rest = leaders.length > 2 ? ` and ${leaders.length - 2} other brands` : '';
  const denominator = coverage.eligible >= brands[0].mentionCount ? ` of ${coverage.eligible}` : '';
  return `${names}${rest} appeared in ${brands[0].mentionCount}${denominator} answers${leaders.length > 1 ? ' each' : ''}.`;
}

export function reviewStatus(reviewed) {
  return reviewed === true || reviewed === 't' || reviewed === 'true'
    ? 'Human review recorded'
    : 'No human review recorded';
}
