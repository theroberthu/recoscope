import type { OfficeChairsHistory } from '@/lib/office-chairs-history.mjs';
import { formatSnapshotDate } from '@/lib/discovery.mjs';

export function SnapshotComparison({ history }: { history: OfficeChairsHistory }) {
  const rows = [
    { label: 'Branch mentions', values: history.snapshots.map(s => `${s.branchMentions}/${s.usable}`) },
    { label: 'Branch comparative first places', values: history.snapshots.map(s => `${s.branchFirsts}/${s.comparativeAnswers}`) },
    { label: 'Steelcase comparative first places', values: history.snapshots.map(s => `${s.steelcaseFirsts}/${s.comparativeAnswers}`) },
  ];
  return (
    <section id="snapshot-comparison" className="report-card mt-6 scroll-mt-24" aria-labelledby="snapshot-comparison-heading">
      <p className="report-eyebrow">Two captured snapshots</p>
      <h2 id="snapshot-comparison-heading" className="mt-2 text-2xl font-semibold tracking-tight text-ink">Compare snapshots</h2>
      {history.repeatedSplit && <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink">Branch led mentions in both snapshots; Steelcase ranked first in every comparative answer.</p>}
      <table className="mt-6 w-full table-fixed border-collapse text-left text-sm sm:text-base">
        <caption className="sr-only">Office Chairs: mention frequency and comparative first places on October 21 and November 5, 2026</caption>
        <thead>
          <tr className="border-b border-[var(--line)]">
            <th scope="col" className="w-[44%] py-3 pr-3 font-medium text-[var(--secondary)]">Measure</th>
            {history.snapshots.map(s => <th key={s.period} scope="col" className="px-1 py-3 align-top font-medium sm:px-3">
              <a className="text-[var(--brand)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-current" href={`/tracker/office-chairs?period=${s.period}`}>
                <time dateTime={s.date}>{formatSnapshotDate(s.date)}</time>
                <span className="sr-only"> snapshot</span>
              </a>
            </th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => <tr key={row.label} className="border-b border-[var(--line)]">
            <th scope="row" className="py-4 pr-3 font-medium leading-relaxed text-ink">{row.label}</th>
            {row.values.map((value, i) => <td key={i} className="px-1 py-4 align-middle text-lg font-semibold tabular-nums text-[var(--brand)] sm:px-3 sm:text-xl">{value}</td>)}
          </tr>)}
        </tbody>
      </table>
      <p className="mt-4 text-sm leading-relaxed text-[var(--secondary)]">Mentions count each brand once per usable answer across all three prompt types. Comparative first places count only explicit #1 ranks in the four comparison answers. Unranked mentions are never assigned a first place.</p>
      <details className="mt-4 text-sm leading-relaxed text-[var(--secondary)]">
        <summary className="cursor-pointer font-medium text-[var(--brand)]">Collection differences and interpretation</summary>
        <p className="mt-3">On October 21, ChatGPT used Free Temporary Chat, with the separate Unpersonalized setting unverified. On November 5, Temporary Chat and Unpersonalized were both verified. Perplexity advanced-search availability and rank interpretation can also limit comparisons. These two captures do not establish a sustained trend or product quality. See each dated report for its collection notes.</p>
      </details>
    </section>
  );
}
