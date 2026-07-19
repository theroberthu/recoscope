import type { Metadata } from "next";
import { ScrollFade } from "@/components/home/ScrollFade";
import { FAQSchema } from "@/components/seo/JsonLd";

const FAQ_ITEMS = [
  {
    question: "Which AI models does RecoScope track?",
    answer: "RecoScope benchmarks four AI models: ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), and Perplexity. We classify them into three tiers based on commercial integration: independent AI, search-grounded AI, and commerce-influenced AI.",
  },
  {
    question: "How often is data updated?",
    answer: "Evergreen categories like office chairs and running shoes are benchmarked monthly. Seasonal categories like lawn fertilizer are benchmarked weekly during active periods. Reports are updated on a rolling basis.",
  },
  {
    question: "How are brand recommendations measured?",
    answer: "We run three standardized prompts per category across all four models. Every response is parsed for brand mentions, rank position, and frequency. Brands are scored by total mentions, first-mention rate, top-3 rate, and cross-model consensus.",
  },
  {
    question: "What is the three-tier model classification?",
    answer: "We classify AI models by commercial interest. Independent AI (Claude) has no advertising or shopping integrations. Search-grounded AI (Perplexity) retrieves from the live web. Commerce-influenced AI (ChatGPT, Gemini) has active or announced commercial integrations that may affect recommendations.",
  },
  {
    question: "Does RecoScope accept payment from brands to influence rankings?",
    answer: "No. RecoScope does not accept payment from brands to influence their ranking or visibility in reports. All benchmark data reflects organic AI model behavior at the time of testing.",
  },
];

export const metadata: Metadata = {
  title: "How RecoScope Tracks AI Recommendations",
  description:
    "Our methodology for benchmarking brand recommendations across ChatGPT, Claude, Gemini & Perplexity. Data collection, scoring & cadence.",
};

// ---------------------------------------------------------------------------
// Reusable pieces
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
      {children}
    </p>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 space-y-4 text-base leading-[1.8] text-[#c8ccd0]">
      {children}
    </div>
  );
}

const STEPS = [
  {
    num: "01",
    title: "Prompt Design",
    body: "Each category gets three standardized prompts: an open-ended recommendation question, a constrained question with a specific use case or budget, and a brand comparison and ranking question. Prompts are identical across all models to ensure comparable outputs.",
  },
  {
    num: "02",
    title: "Model Querying",
    body: "We run each prompt through ChatGPT, Claude, Gemini, and Perplexity during the same time window to minimize temporal variation. Evergreen categories are benchmarked monthly. Seasonal categories are benchmarked weekly during active periods.",
  },
  {
    num: "03",
    title: "Response Parsing",
    body: "Every response is parsed for brand mentions. Each mention is recorded with its rank position (order of appearance), the agent that produced it, and which prompt triggered it. Brand names are normalized to handle variations in capitalization and formatting.",
  },
  {
    num: "04",
    title: "Scoring and Aggregation",
    body: "Brands are scored by total mention frequency across all agents and prompts. We track first-mention rate (how often a brand appears first), top-3 rate (how often it appears in the top 3), and cross-model consensus (how many models independently recommend the same brand).",
  },
];

const METRICS = [
  { metric: "Total Mentions", desc: "How many times a brand appears across all agents and prompts" },
  { metric: "First Mention Rate", desc: "How often a brand is the first recommendation given" },
  { metric: "Top-3 Rate", desc: "How often a brand appears in the top 3 recommendations" },
  { metric: "Cross-Model Consensus", desc: "How many different AI models independently recommend the brand" },
  { metric: "Agent Classification Split", desc: "Whether independent and commerce-influenced models agree or diverge" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MethodologyPage() {
  return (
    <div className="bg-dot-grid min-h-screen">
      <FAQSchema items={FAQ_ITEMS} />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-24">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
          Methodology
        </p>
        <h1 className="mt-4 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-4xl font-bold sm:text-5xl leading-[1.1] tracking-tight text-transparent">
          The RecoScope Framework
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/40">
          How we collect, normalize, and score AI recommendation data across models and categories.
        </p>
      </section>

      {/* Three-Tier Classification */}
      <ScrollFade className="mx-auto max-w-3xl px-6 py-20">
        <SectionLabel>The Three-Tier Model Classification</SectionLabel>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Independent */}
          <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="10" cy="10" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-cyan/60">
              Independent AI
            </p>
            <p className="mt-1 text-[14px] font-semibold text-white">
              Claude <span className="font-normal text-white/30">(Anthropic)</span>
            </p>
            <p className="mt-3 text-[13px] leading-[1.7] text-[#c8ccd0]/70">
              As of April 2026, no advertising revenue from recommendations and no integrated
              shopping or checkout features. Recommendations based on training data and general
              knowledge. We revisit this classification as each company&rsquo;s commercial model
              evolves.
            </p>
          </div>

          {/* Search-Grounded */}
          <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-blue-400/60">
              Search-Grounded AI
            </p>
            <p className="mt-1 text-[14px] font-semibold text-white">
              Perplexity
            </p>
            <p className="mt-3 text-[13px] leading-[1.7] text-[#c8ccd0]/70">
              Retrieval-augmented model that searches the live web before answering.
              Recommendations reflect current web consensus rather than static training data.
              May surface brands with strong web presence that other models miss.
            </p>
          </div>

          {/* Commerce-Influenced */}
          <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="7" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 7V5.5A3 3 0 0 1 13 5.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400/60">
              Commerce-Influenced AI
            </p>
            <p className="mt-1 text-[14px] font-semibold text-white">
              ChatGPT <span className="font-normal text-white/30">(OpenAI)</span>,
              Gemini <span className="font-normal text-white/30">(Google)</span>
            </p>
            <p className="mt-3 text-[13px] leading-[1.7] text-[#c8ccd0]/70">
              Models with active or announced commercial integrations. OpenAI has publicly
              introduced advertising into ChatGPT. Gemini is integrated with Google Shopping
              and Shopify agentic commerce. Recommendations from these models may be influenced
              by commercial relationships.
            </p>
          </div>
        </div>

        <p className="mt-8 text-base leading-[1.8] text-[#c8ccd0]">
          This classification is not a judgment of quality. All four models produce useful
          recommendations. The classification helps readers interpret differences in their outputs.
          When a commerce-influenced model consistently recommends different brands than an
          independent model, that divergence is worth examining.
        </p>
      </ScrollFade>

      {/* Why This Matters */}
      <ScrollFade className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <SectionLabel>Why This Matters</SectionLabel>
          <Prose>
            <p>
              When consumers ask AI for product recommendations, they get answers shaped by each
              model&rsquo;s training data, retrieval methods, and commercial integrations. Different
              models recommend different brands for the same question.
            </p>
            <p>
              RecoScope exists to make those differences visible and measurable. We run standardized
              benchmarks across AI models so brands, agencies, and analysts can see exactly who AI
              recommends, where models agree, and where commercial influence may be shifting results.
            </p>
          </Prose>
        </div>
      </ScrollFade>

      {/* How We Collect Data */}
      <ScrollFade className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <SectionLabel>How We Collect Data</SectionLabel>

          <div className="mt-10 space-y-0">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex gap-6 pb-10">
                {/* Vertical line */}
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-px bg-white/10" />
                )}
                {/* Step number */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan/20 bg-surface font-mono text-[12px] font-bold text-cyan">
                  {step.num}
                </div>
                {/* Content */}
                <div className="pt-1.5">
                  <p className="text-[15px] font-semibold text-white">{step.title}</p>
                  <p className="mt-2 text-[14px] leading-[1.7] text-[#c8ccd0]/80">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollFade>

      {/* What We Track */}
      <ScrollFade className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <SectionLabel>What We Track</SectionLabel>

          <div className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-surface">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/25">
                    Metric
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/25">
                    What It Measures
                  </th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map((row, i) => (
                  <tr
                    key={row.metric}
                    className={i < METRICS.length - 1 ? "border-b border-white/5" : ""}
                  >
                    <td className="px-6 py-4 font-mono text-[13px] font-semibold text-cyan/70">
                      {row.metric}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#c8ccd0]/80">
                      {row.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollFade>

      {/* Limitations */}
      <ScrollFade className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <SectionLabel>Limitations and Transparency</SectionLabel>
          <Prose>
            <p>
              AI model outputs are non-deterministic. The same prompt can produce different results
              on different days. Our benchmarks capture a snapshot, not a guaranteed prediction.
            </p>
            <p>
              We do not have access to the internal ranking algorithms of any AI model. Our
              three-tier classification is based on publicly available information about each
              company&rsquo;s commercial integrations. We update classifications as new information
              becomes available.
            </p>
            <p>
              RecoScope does not accept payment from brands to influence their ranking or visibility
              in our reports.
            </p>
          </Prose>
        </div>
      </ScrollFade>

      {/* Report Cadence */}
      <ScrollFade className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <SectionLabel>Report Cadence</SectionLabel>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-surface p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-cyan/60">
                Evergreen Categories
              </p>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#c8ccd0]/80">
                Benchmarked monthly. Categories with year-round consumer demand like office chairs,
                running shoes, and wireless earbuds. Reports track long-term trends in AI
                recommendation patterns.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-surface p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-cyan/60">
                Seasonal Categories
              </p>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#c8ccd0]/80">
                Benchmarked weekly during active periods. Categories with time-sensitive demand like
                lawn fertilizer, sunscreen, and space heaters. Reports track how AI recommendations
                shift through a season.
              </p>
            </div>
          </div>
        </div>
      </ScrollFade>

      {/* Explore the data */}
      <ScrollFade className="mx-auto max-w-3xl px-6 pb-24 pt-4">
        <div className="rounded-2xl border border-white/10 bg-surface px-8 py-12 text-center">
          <p className="mx-auto max-w-lg text-[20px] font-semibold leading-[1.3] tracking-tight text-white/80">
            This methodology runs live across every category we track.
          </p>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40">
            See it running live across every category, or read how the full system is built and operated.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <a href="/tracker" className="inline-block rounded-full bg-cyan px-8 py-3 text-center font-mono text-[13px] font-bold tracking-tight text-void transition-colors hover:bg-cyan/90">
              Explore the Benchmark
            </a>
            <a href="/platform" className="inline-block rounded-full border border-cyan/30 bg-cyan/10 px-8 py-3 text-center font-mono text-[13px] font-bold tracking-tight text-cyan transition-all hover:bg-cyan/20">
              See the Platform
            </a>
          </div>
          <p className="mt-5 text-[12px]">
            <a href="/blog" className="text-cyan/60 transition-colors hover:text-cyan">
              Read the research &rarr;
            </a>
          </p>
        </div>
      </ScrollFade>
    </div>
  );
}
