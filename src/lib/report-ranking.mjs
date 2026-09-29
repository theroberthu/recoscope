/** A missing or invalid rank must never become zero through Number(null). */
export function validRank(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const rank = Number(value);
  return Number.isInteger(rank) && rank > 0 ? rank : null;
}

/** @param {import('./types').AgentResponse[]} responses */
export function buildPromptBreakdown(prompts, mentions, responses) {
  return prompts.map((p) => {
    const cells = responses.filter((r) => Number(r.prompt_number) === Number(p.prompt_number));
    const promptMentions = mentions.filter((m) => Number(m.prompt_number) === Number(p.prompt_number));
    const agents = [...new Set([...cells.map((r) => r.agent_name), ...promptMentions.map((m) => m.agent_name)])].sort();
    return {
      promptNumber: p.prompt_number,
      promptText: p.prompt_text,
      agentBrands: agents.map((agent) => {
        const response = cells.find((r) => r.agent_name === agent);
        const unavailable = /^\s*\[UNAVAILABLE\b/i.test(response?.raw_response ?? '');
        const all = promptMentions.filter((m) => m.agent_name === agent);
        const ranked = new Map();
        if (!unavailable) for (const m of all) {
          const rank = validRank(m.mention_rank);
          if (rank === null) continue;
          const current = ranked.get(m.brand_name_normalized);
          if (current === undefined || rank < current) ranked.set(m.brand_name_normalized, rank);
        }
        return {
          agent,
          brands: [...ranked.entries()].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])).slice(0, 3).map(([brand]) => brand),
          status: unavailable ? 'Unavailable' : ranked.size ? null : all.length ? 'Unranked — brand mentions retained' : 'No ranked mentions',
        };
      }),
    };
  });
}

export function reviewStatus(reviewed) {
  return reviewed === true || reviewed === 't' || reviewed === 'true'
    ? 'Human review recorded'
    : 'No human review recorded';
}
