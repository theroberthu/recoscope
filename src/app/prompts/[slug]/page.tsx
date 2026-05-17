import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPublishedPrompts, getPromptDetail } from "@/lib/queries";
import { promptToSlug, promptToTitle, promptToDescription } from "@/lib/prompt-seo";

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

async function findPromptBySlug(slug: string): Promise<string | null> {
  const all = await getAllPublishedPrompts();
  const match = all.find((p) => promptToSlug(p.prompt_text) === slug);
  return match?.prompt_text ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const promptText = await findPromptBySlug(slug);
  if (!promptText) return { title: "Not Found" };
  const detail = await getPromptDetail(promptText);
  if (!detail) return { title: "Not Found" };

  const title = promptToTitle(promptText, detail.category_name);
  const description = promptToDescription(promptText, detail.category_name, detail.brands.slice(0, 3).map((b) => b.brand));

  return {
    title,
    description,
    openGraph: {
      title: `${title} | RecoScope`,
      description,
      type: "article",
    },
  };
}

export default async function PromptDetailPage({ params }: Props) {
  const { slug } = await params;
  const promptText = await findPromptBySlug(slug);
  if (!promptText) notFound();

  const detail = await getPromptDetail(promptText);
  if (!detail) notFound();

  const title = promptToTitle(promptText, detail.category_name);
  const topBrands = detail.brands.slice(0, 3).map((b) => b.brand);
  const baseUrl = "https://www.getrecoscope.com";

  const qaSchema = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: promptText,
      text: promptText,
      answerCount: detail.agent_breakdown.length,
      acceptedAnswer: {
        "@type": "Answer",
        text: topBrands.length > 0
          ? `Based on benchmarking across ChatGPT, Claude, Gemini, and Perplexity, the top recommended ${detail.category_name.toLowerCase()} brands are ${topBrands.join(", ")}.`
          : `AI models provide varying recommendations for ${detail.category_name.toLowerCase()}.`,
        url: `${baseUrl}/prompts/${slug}`,
      },
    },
  };

  return (
    <div className="bg-dot-grid min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(qaSchema) }}
      />

      <article className="mx-auto max-w-3xl px-6 pb-20 pt-20">
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

        <p className="mt-4 text-[14px] text-white/30">
          Tracked across {detail.run_dates.length} benchmark run{detail.run_dates.length !== 1 ? "s" : ""}
          {detail.run_dates.length > 0 && ` from ${fmtDate(detail.run_dates[detail.run_dates.length - 1])} to ${fmtDate(detail.run_dates[0])}`}
        </p>

        {/* H2: exact prompt */}
        <div className="mt-10 rounded-xl border border-white/10 bg-surface p-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
            The exact question we asked AI models
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-white/60">
            &ldquo;{detail.prompt_text}&rdquo;
          </p>
        </div>

        {/* Brand recommendations table */}
        <div className="mt-12">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            Brand Recommendations
          </p>
          <p className="mt-2 text-[13px] text-white/25">
            Aggregated across ChatGPT, Claude, Gemini, and Perplexity over {detail.run_dates.length} benchmark run{detail.run_dates.length !== 1 ? "s" : ""}.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-surface">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/5">
                  <Th>#</Th>
                  <Th>Brand</Th>
                  <Th>Mentions</Th>
                  <Th>Top-3</Th>
                  <Th>First Picks</Th>
                </tr>
              </thead>
              <tbody>
                {detail.brands.slice(0, 20).map((b, i) => (
                  <tr key={b.brand} className={`border-b border-white/5 last:border-0 ${i < 3 ? "bg-cyan/[0.03]" : ""}`}>
                    <td className="px-5 py-3 font-mono text-white/30">{i + 1}</td>
                    <td className={`px-5 py-3 font-medium ${i < 3 ? "text-white/70" : "text-white/50"}`}>{b.brand}</td>
                    <td className="px-5 py-3 font-mono tabular-nums text-white/40">{b.mentions}</td>
                    <td className="px-5 py-3 font-mono tabular-nums text-white/40">{b.top3}</td>
                    <td className="px-5 py-3 font-mono tabular-nums text-white/40">{b.first_picks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model-by-model breakdown */}
        {detail.agent_breakdown.length > 0 && (
          <div className="mt-12">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              Model-by-Model Breakdown
            </p>
            <p className="mt-2 text-[13px] text-white/25">
              Top brands each AI model recommends for this prompt.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {detail.agent_breakdown.map((agent) => (
                <div key={agent.agent_name} className="rounded-xl border border-white/5 bg-surface p-5">
                  <p className="font-mono text-[12px] font-semibold text-white/60">{agent.agent_name}</p>
                  <ol className="mt-2 space-y-1">
                    {agent.brands.slice(0, 5).map((brand, j) => (
                      <li key={brand} className={`text-[13px] ${j === 0 ? "font-medium text-white/60" : "text-white/35"}`}>
                        <span className="mr-2 font-mono text-[11px] text-white/20">{j + 1}.</span>
                        {brand}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {detail.insight && (detail.insight.key_takeaway || detail.insight.top_brands_summary) && (
          <div className="mt-12">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              Key Insights
            </p>
            <div className="mt-4 space-y-4">
              {detail.insight.key_takeaway && (
                <div className="rounded-xl border border-white/10 bg-surface p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/25">Key Takeaway</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/50">{detail.insight.key_takeaway}</p>
                </div>
              )}
              {detail.insight.top_brands_summary && (
                <div className="rounded-xl border border-white/10 bg-surface p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/25">Top Brands Summary</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/50">{detail.insight.top_brands_summary}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-16 space-y-4">
          <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-6 text-center">
            <p className="text-[15px] font-semibold text-white">
              See the full {detail.category_name} benchmark
            </p>
            <p className="mt-2 text-[13px] text-white/40">
              Cross-model rankings, trend data, and competitive landscape.
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
