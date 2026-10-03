import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: { absolute: "Robert Hu | AI Commerce Strategy & RecoScope" },
  description:
    "Robert Hu brings more than 20 years of commerce experience to AI product discovery. Explore RecoScope, his working benchmark, and connect about AI commerce, strategy, and partnerships roles.",
  openGraph: {
    title: "Robert Hu | AI Commerce Strategy & RecoScope",
    description:
      "Commerce experience applied to AI product discovery: the research, product decisions, and operating system behind RecoScope.",
    type: "profile",
  },
};

const CONTRIBUTIONS = [
  { title: "Define the commercial question", body: "I chose product recommendation as the focus, designed a repeatable prompt framework, and separated brand visibility from recommendation position. That makes the benchmark relevant to how commerce teams assess discovery." },
  { title: "Turn answers into usable evidence", body: "I shaped the data model and reporting experience: categories, dated runs, model responses, normalized brand mentions, and findings. Readers can move from a category comparison to the prompts behind it." },
  { title: "Operate and improve the workflow", body: "I run the recurring benchmark, investigate capture failures, check interpretations, and improve the public reports. AI-assisted tools support collection, development, and parsing; I own the scope, measurement rules, and publication decisions." },
];

const APPLICATIONS = [
  { title: "AI commerce", body: "Investigate which brands enter a shopper's consideration set across AI assistants, and how the answer changes with the shopper's needs." },
  { title: "Strategy", body: "Turn an emerging channel into a measurable question, test assumptions, and distinguish observed behavior from claims the evidence cannot support." },
  { title: "Partnerships", body: "Help brands, retailers, and technology teams discuss the same evidence, identify questions worth testing, and define what a useful pilot should measure." },
];

export default function AboutPage() {
  const baseUrl = "https://www.getrecoscope.com";
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Robert Hu",
    url: "https://theroberthu.com",
    description:
      "Builder and operator of RecoScope, an independent AI commerce benchmark. More than 20 years in ecommerce, with a focus on AI product discovery, strategy, and evaluation.",
    sameAs: ["https://theroberthu.com", "https://www.linkedin.com/in/theroberthu"],
  };

  return (
    <div className="bg-dot-grid min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <BreadcrumbSchema items={[{ name: "Home", url: baseUrl }, { name: "About Robert", url: `${baseUrl}/about` }]} />

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 sm:pt-28">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/70">
            Robert Hu · AI Commerce, Strategy &amp; Partnerships
          </p>
          <h1 className="mt-5 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-4xl font-bold leading-[1.15] tracking-tight text-transparent sm:text-5xl">
            Commerce experience, applied to AI product discovery.
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-white/65">
            I bring more than 20 years in ecommerce, merchandising, marketplaces, digital
            transformation, and technology selection. I built RecoScope to investigate a practical
            question: when a shopper asks AI what to buy, which brands make the answer?
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-white/55">
            I am exploring AI commerce, strategy, and partnerships roles. This project shows how
            I frame a commercial problem, build a way to test it, and turn the results into something people can use.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="https://www.linkedin.com/in/theroberthu" target="_blank" rel="noopener noreferrer" className="rounded-full bg-cyan px-7 py-3 text-center font-mono text-[13px] font-bold text-void transition-colors hover:bg-cyan/90">
              Connect on LinkedIn
            </a>
            <Link href="/platform" className="rounded-full border border-cyan/30 bg-cyan/10 px-7 py-3 text-center font-mono text-[13px] font-bold text-cyan transition-colors hover:bg-cyan/20">
              Read the project case study
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight text-white">Why I built RecoScope</h2>
          <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-[1.8] text-white/60">
            <p>
              A shopper's AI answer can name a brand, recommend it first, or mention it only as an
              alternative. Those are different signals. I wanted a way to examine them across
              ChatGPT, Claude, Gemini, and Perplexity, using the same shopper situations over time.
            </p>
            <p>
              RecoScope turns those responses into a working benchmark with dated reports,
              prompt-level comparisons, and explicit collection and review context. It is a public
              project that people can inspect, rather than a proposal for a future product.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[14px] font-medium text-cyan">
            <Link href="/tracker" className="underline underline-offset-4 hover:text-white">Explore the live benchmark &rarr;</Link>
            <a href="https://github.com/theroberthu/recoscope/tree/main" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">Inspect the source code &rarr;</a>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight text-white">My contribution</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {CONTRIBUTIONS.map((item) => (
              <div key={item.title} className="glow-card rounded-xl border border-white/10 bg-surface p-6">
                <h3 className="text-[16px] font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-[14px] leading-[1.8] text-white/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan/70">A decision you can inspect</p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">A mention is not a recommendation.</h2>
          <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-[1.8] text-white/60">
            <p>
              Counting every brand name as a ranked recommendation would make a clean-looking
              report with a misleading conclusion. RecoScope keeps mention frequency separate
              from explicit recommendation rank. Carousel order and unranked alternatives do not become invented ranks.
            </p>
            <p>
              For a commerce team, that distinction changes the question from “Are we mentioned?”
              to “Are we selected for this shopper's situation?” It creates a more useful starting
              point for research and partner discussions, without claiming that visibility caused a sale.
            </p>
          </div>
          <Link href="/methodology" className="mt-6 inline-block text-[14px] font-medium text-cyan underline underline-offset-4 hover:text-white">Read the measurement rules &rarr;</Link>
        </div>
      </section>

      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight text-white">How this work translates to a team</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {APPLICATIONS.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-surface p-6">
                <h3 className="text-[16px] font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-[14px] leading-[1.8] text-white/60">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-[14px] leading-[1.8] text-white/55">
            The benchmark measures observed answers, not sales lift or the hidden causes of a
            recommendation. Published reports carry their own quality and review status; publication
            does not imply that every run has received human review.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-4">
        <div className="rounded-2xl border border-cyan/20 bg-cyan/5 px-6 py-12 sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight text-white">Building an AI commerce team?</h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/60">
            I am interested in work connecting AI product discovery, commercial strategy, and
            partnerships. RecoScope is one example of how I approach that work.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="https://www.linkedin.com/in/theroberthu" target="_blank" rel="noopener noreferrer" className="rounded-full bg-cyan px-7 py-3 text-center font-mono text-[13px] font-bold text-void transition-colors hover:bg-cyan/90">Connect on LinkedIn</a>
            <a href="https://theroberthu.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-cyan/30 bg-cyan/10 px-7 py-3 text-center font-mono text-[13px] font-bold text-cyan transition-colors hover:bg-cyan/20">Read my commerce research</a>
          </div>
        </div>
      </section>
    </div>
  );
}
