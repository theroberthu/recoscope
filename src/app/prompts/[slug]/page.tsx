import { socialImage } from "@/lib/social-image.mjs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getAllPublishedPrompts, getPromptDetail } from "@/lib/queries";
import { resolvePromptSlug, promptToTitle, promptToDescription, promptSearchSummary } from "@/lib/prompt-seo";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(d: string): string {
  const parts = d.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!parts) return d;
  return `${MONTHS[parseInt(parts[2], 10) - 1]} ${parseInt(parts[3], 10)}, ${parts[1]}`;
}

interface Props {
  params: Promise<{ slug: string }>;
}

async function findPromptBySlug(slug: string) {
  return resolvePromptSlug(slug, await getAllPublishedPrompts());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await findPromptBySlug(slug);
  if (!found) return { title: "Not Found" };
  const detail = await getPromptDetail(found.prompt_text, found.category_slug);
  if (!detail) return { title: "Not Found" };

  const summary = promptSearchSummary(found.canonicalSlug);
  const title = summary?.title ?? promptToTitle(found.prompt_text, detail.category_name);
  const description = summary?.description ?? promptToDescription(found.prompt_text, detail.category_name);

  return {
    title,
    description,
    alternates: { canonical: `/prompts/${found.canonicalSlug}` },
    openGraph: {
      images: [socialImage()],
      title: `${title} | RecoScope`,
      description,
      type: "article",
    },
  };
}

export default async function PromptDetailPage({ params }: Props) {
  const { slug } = await params;
  const found = await findPromptBySlug(slug);
  if (!found) notFound();
  // Permanent redirect keeps old indexed URLs attached to the right category.
  if (found.canonicalSlug !== slug) {
    permanentRedirect(`/prompts/${found.canonicalSlug}`);
  }

  const promptText = found.prompt_text;
  const detail = await getPromptDetail(promptText, found.category_slug);
  if (!detail) notFound();

  const summary = promptSearchSummary(found.canonicalSlug);
  const title = summary?.title ?? promptToTitle(promptText, detail.category_name);
  const description = summary?.description ?? promptToDescription(promptText, detail.category_name);
  const baseUrl = "https://www.getrecoscope.com";
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    mainEntityOfPage: `${baseUrl}/prompts/${found.canonicalSlug}`,
    author: { "@type": "Person", name: "Robert Hu" },
    publisher: { "@type": "Organization", name: "RecoScope", url: baseUrl },
  };

  return (
    <div className="bg-dot-grid min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema).replace(/</g, "\\u003c") }}
      />

      <article className={`mx-auto max-w-3xl px-6 pb-20 ${summary ? "pt-10 sm:pt-16" : "pt-20"}`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-white/25">
          <Link href="/prompts" className="transition-colors hover:text-white/50">Prompts</Link>
          <span>/</span>
          <Link href={`/tracker/${detail.category_slug}`} className="transition-colors hover:text-white/50">{detail.category_name}</Link>
        </div>

        {/* H1 */}
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>

        {summary ? (
          <section className="mt-6 border-t border-white/20 pt-5" aria-labelledby="prompt-summary">
            <p className="text-sm text-white/50">
              <time dateTime={summary.snapshotDate}>{fmtDate(summary.snapshotDate)}</time> snapshot · 4 usable answers
            </p>
            <h2 id="prompt-summary" className="mt-2 text-xl font-semibold tracking-tight text-white">
              {summary.result}
            </h2>
            <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-white/70">
              {summary.intro}
            </p>
            <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-white/55">
              {summary.limitation}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <a href="#recorded-answers" className="font-semibold text-cyan underline underline-offset-4">See results by assistant</a>
              <Link href={`/tracker/${detail.category_slug}`} className="text-cyan underline underline-offset-4">{summary.latestLabel}</Link>
            </div>
          </section>
        ) : (
          <>
            <p className="mt-4 text-[15px] leading-relaxed text-white/60">{description}</p>
            <p className="mt-4 text-[14px] text-white/30">
              {detail.usable_answers} usable answers from {detail.snapshots.length} benchmark run{detail.snapshots.length !== 1 ? "s" : ""}
              {` · ${fmtDate(detail.snapshots[detail.snapshots.length - 1].run_date)} – ${fmtDate(detail.snapshots[0].run_date)}`}
            </p>
          </>
        )}

        {/* H2: exact prompt */}
        <div data-nosnippet="" className="mt-10 rounded-xl border border-white/10 bg-surface p-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
            The exact question we asked AI models
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-white/60">
            &ldquo;{detail.prompt_text}&rdquo;
          </p>
        </div>

        <section className="mt-10 rounded-xl border border-cyan/20 bg-cyan/5 p-5">
          <h2 className="text-lg font-semibold text-white">Mentions and rank measure different things</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/60">
            A mention counts a brand once per usable answer. Recorded ranks belong to individual answers;
            an unranked mention is never treated as first place. These captured answers do not establish product quality.
          </p>
        </section>

        <section className="mt-10" aria-labelledby="brand-visibility">
          <h2 id="brand-visibility" className="text-xl font-semibold text-white">Brand visibility for this question</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/50">
            Only {detail.category_name} answers to this exact question are included. Sorted by mention frequency,
            with ties kept equal. Top-three and first-place counts use recorded ranks, not mention order.
            Unavailable and excluded answers do not contribute. {detail.captured_answers - detail.usable_answers} of {detail.captured_answers} captured answers were unavailable or excluded.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-surface">
            <table className="w-full text-[13px]">
              <caption className="sr-only">Brand mentions and recorded ranks across {detail.usable_answers} usable answers</caption>
              <thead><tr className="border-b border-white/5">
                <Th>Brand</Th><Th>Answers mentioning</Th><Th>Recorded top-three</Th><Th>Recorded first-place</Th>
              </tr></thead>
              <tbody>{detail.brands.map(b => (
                <tr key={b.brand} className="border-b border-white/5 last:border-0">
                  <th scope="row" className="px-5 py-3 text-left font-medium text-white/70">{b.brand}</th>
                  <td className="px-5 py-3 font-mono tabular-nums text-white/60">{b.mentions}/{detail.usable_answers}</td>
                  <td className="px-5 py-3 font-mono tabular-nums text-white/60">{b.top3}</td>
                  <td className="px-5 py-3 font-mono tabular-nums text-white/60">{b.first_picks}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {!detail.brands.length && <p className="mt-4 text-white/60">No brand mentions recorded in usable answers.</p>}
        </section>

        <section className="mt-12" aria-labelledby="recorded-answers">
          <h2 id="recorded-answers" className={`text-xl font-semibold text-white ${summary ? "scroll-mt-24" : ""}`}>Recorded results by date and assistant</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/50">
            Each card shows one captured answer. Rank numbers are preserved, including ties and gaps.
            “Unranked” means no position was recorded. Dates are separate snapshots, not a combined ranking or evidence of a trend.
          </p>
          {detail.snapshots.map((snapshot, index) => (
            <details key={snapshot.id} open={index === 0} className="mt-5 rounded-xl border border-white/10 bg-surface p-5">
              <summary className="cursor-pointer font-semibold text-white/70">{fmtDate(snapshot.run_date)} · {snapshot.answers.filter(a => a.eligible).length} usable answers</summary>
              <Link href={`/tracker/${detail.category_slug}?period=${encodeURIComponent(snapshot.period_label)}#captured-answers`} className="mt-3 inline-block text-sm text-cyan underline underline-offset-4">View this dated benchmark and captured answers →</Link>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {snapshot.answers.map(answer => (
                  <div key={`${answer.agent_name}-${answer.prompt_number}`} className="min-w-0 rounded-lg border border-white/10 p-4">
                    <h3 className="font-semibold text-white/70">{answer.agent_name}</h3>
                    {answer.status && <p className="mt-2 text-sm text-white/50">{answer.status}</p>}
                    <ul className="mt-2 space-y-2">{answer.brands.map(b => (
                      <li key={b.brand} className="flex justify-between gap-3 text-[13px] text-white/60">
                        <span className="min-w-0 break-words">{b.brand}</span>
                        <span className="shrink-0 font-mono">{b.rank === null ? "Unranked" : `Rank ${b.rank}`}</span>
                      </li>
                    ))}</ul>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </section>

        {/* CTAs */}
        <div className="mt-16 space-y-4">
          <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-6 text-center">
            <p className="text-[15px] font-semibold text-white">
              See the full {detail.category_name} benchmark
            </p>
            <p className="mt-2 text-[13px] text-white/40">
              Explore the shopper context, dated snapshots and captured answers.
            </p>
            <Link
              href={`/tracker/${detail.category_slug}`}
              className="mt-4 inline-block rounded-full bg-cyan px-6 py-2.5 font-mono text-[12px] font-bold text-void transition-colors hover:bg-cyan/90"
            >
              View {detail.category_name} Tracker
            </Link>
          </div>

          <div className="rounded-xl border border-white/10 bg-surface p-6 text-center">
            <p className="text-[15px] font-semibold text-white">
              Want to see where your brand ranks?
            </p>
            <p className="mt-2 text-[13px] text-white/40">
              Free AI visibility audit. Delivered in 48 hours.
            </p>
            <Link
              href="/audit"
              className="mt-4 inline-block rounded-full border border-cyan/30 bg-cyan/10 px-6 py-2.5 font-mono text-[12px] font-bold text-cyan transition-all hover:bg-cyan/20"
            >
              Get Your Free Audit
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-white/25">
      {children}
    </th>
  );
}
