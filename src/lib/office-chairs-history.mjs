import { applyRecordedExclusions, buildPromptBreakdown, eligibleMentions, mentionCounts, responseCoverage } from './report-ranking.mjs';
import { isoDate } from './seo.mjs';

/** An editorial comparison of two verified captures, not an automatic trend. */
export function officeChairsHistory(slug, current, previous) {
  const matches = (snapshot, id, date, period) => snapshot &&
    Number(snapshot.run.id) === id && Number(snapshot.run.category_id) === 1 &&
    isoDate(snapshot.run.run_date)?.slice(0, 10) === date &&
    snapshot.run.period_label === period && snapshot.run.status === 'published' &&
    [true, 'true', 't'].includes(snapshot.run.is_public);
  if (slug !== 'office-chairs' ||
      !matches(current, 173, '2026-11-05', '2026-11-A') ||
      !matches(previous, 162, '2026-10-21', '2026-10-B')) return null;

  const snapshots = [previous, current].map(({ run, mentions, responses }) => {
    const usable = applyRecordedExclusions(responses, run.id);
    const counts = mentionCounts(eligibleMentions(mentions, usable));
    const comparison = buildPromptBreakdown([{ prompt_number: 3, prompt_text: '' }], mentions, usable)[0];
    const answers = comparison.agentBrands.filter(row => row.hasResponse);
    const firsts = brand => answers.filter(row => row.rankedBrands.some(b => b.name === brand && b.rank === 1)).length;
    return {
      date: isoDate(run.run_date).slice(0, 10),
      period: run.period_label,
      usable: responseCoverage(usable).eligible,
      branchMentions: counts.find(b => b.name === 'Branch')?.mentionCount ?? 0,
      comparativeAnswers: answers.length,
      branchFirsts: firsts('Branch'),
      steelcaseFirsts: firsts('Steelcase'),
      branchLeads: counts.length > 0 && counts.some(b => b.name === 'Branch' && b.mentionCount === counts[0].mentionCount),
    };
  });
  return {
    snapshots,
    repeatedSplit: snapshots.every(s => s.branchLeads && s.branchFirsts === 0 && s.comparativeAnswers > 0 && s.steelcaseFirsts === s.comparativeAnswers),
  };
}
