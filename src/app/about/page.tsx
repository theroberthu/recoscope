import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: { absolute: "About Robert Hu | Builder of RecoScope" },
  description:
    "Learn why Robert Hu built RecoScope and how the platform demonstrates AI product thinking, multi-model evaluation, data normalization, and AI commerce expertise.",
  openGraph: {
    title: "About Robert Hu | Builder of RecoScope",
    description:
      "Why Robert Hu built RecoScope and how the platform demonstrates AI product thinking, multi-model evaluation, data normalization, and AI commerce expertise.",
    type: "profile",
  },
};

const PRINCIPLES = [
  { title: "Measure before advising", body: "RecoScope started as a measurement system, not an opinion. The tracker exists so claims about AI recommendations can be checked against repeated, structured data." },
  { title: "Preserve raw evidence", body: "Every model response is stored in full, separate from the normalized data derived from it, so findings stay auditable and re-derivable." },
  { title: "Structure before scaling", body: "A normalized data model, from categories through runs, responses, mentions, and insights, came first, so new categories and models plug into a consistent shape." },
  { title: "Keep human judgment in the loop", body: "Runs move through a review and publication workflow. Nothing reaches a public surface until it has been through that gate." },
  { title: "Build reusable capability, not one-time output", body: "The same dataset produces public tracker reports, research findings, prompt-level pages, and private brand analyses. One system, many outputs." },
];

const CAPABILITIES = [
  { title: "AI product thinking", body: "Turned an emerging behavior, AI recommending products, into a defined product with a measurement model and public outputs." },
  { title: "Multi-model evaluation design", body: "Structured a repeatable comparison across ChatGPT, Claude, Gemini, and Perplexity, and classified each model by commercial interest." },
  { title: "Data normalization", body: "Designed a schema that separates raw brand strings from a normalized brand name, so counts are consistent across models and runs." },
  { title: "Longitudinal research", body: "Built a recurring benchmark cadence so the data shows how recommendations move over time, not just a single snapshot." },
  { title: "Operational workflows", body: "Implemented a draft, reviewed, published status lifecycle with published-only filtering on every public query." },
  { title: "Quality controls", body: "Separated public and private outputs, and gated publication, so private work never leaks and only reviewed data goes live." },
  { title: "Product discovery expertise", body: "Applied two decades of ecommerce and merchandising experience to a discovery channel that is moving from search and marketplaces toward AI answers." },
  { title: "Translating emerging technology into usable systems", body: "Converted an unstructured, anecdote-driven topic into structured evidence people can query, cite, and act on." },
];

export default function AboutPage() {
  const baseUrl = "https://www.getrecoscope.com";

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Robert Hu",
    url: "https://theroberthu.com",
    description:
      "Builder and operator of RecoScope, an independent AI commerce research platform. More than 20 years in ecommerce, with a current focus on AI commerce, product discovery, and evaluation systems.",
    sameAs: ["https://theroberthu.com"],
    worksFor: { "@type": "Organization", name: "RecoScope", url: baseUrl },
  };

  return (
    <div className="bg-dot-grid min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <BreadcrumbSchema items={[{ name: "Home", url: baseUrl }, { name: "About", url: `${baseUrl}/about` }]} />

      {/* 1. Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 sm:pt-28">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
          About the Builder
        </p>
        <h1 className="mt-5 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-4xl font-bold leading-[1.15] tracking-tight text-transparent sm:text-5xl">
          Why I Built RecoScope
        </h1>
        <p className="mt-6 text-[17px] leading-relaxed text-white/50">
          AI systems were becoming product discovery engines, but brands and operators had no reliable
          way to observe how those systems made recommendations. I built RecoScope to turn that
          emerging behavior into structured, longitudinal evidence.
        </p>
      </section>

      {/* 2. The problem I saw */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
          The problem I saw
        </p>
        <div className="mt-6 space-y-4 text-[15px] leading-[1.8] text-white/50">
          <p>
            Product discovery was moving beyond search and marketplaces. When someone asks an AI
            assistant what to buy, the answer shapes consideration before a shopper ever reaches a
            product page.
          </p>
          <p>
            Conventional rankings did not explain those answers. Marketplace best-seller position and
            AI recommendation visibility turned out to be different things, and often disagreed.
          </p>
          <p>
            Most of the industry conversation ran on screenshots and anecdotes. There was no
            repeatable way to measure what AI actually recommends, or how it changes. That gap is
            what RecoScope was built to close.
          </p>
        </div>
      </section>

      {/* 3. What I built */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            What I built
          </p>
          <div className="mt-6 space-y-4 text-[15px] leading-[1.8] text-white/50">
            <p>
              I designed the product concept and the evaluation methodology: a prompt framework of
              repeated, commercial-intent questions, run across ChatGPT, Claude, Gemini, and
              Perplexity, with each model classified by commercial interest.
            </p>
            <p>
              I structured the normalized data model, from categories through runs, agent responses,
              brand mentions, and run insights, so raw evidence is preserved separately from the
              structured data derived from it, and every finding is traceable back to a specific run.
            </p>
            <p>
              I built the publication workflow and the public experience: a draft, reviewed, published
              status lifecycle with published-only filtering, the category tracker, the research
              findings, prompt-level pages, and a private per-brand analysis output, all generated
              from one dataset. I operate the benchmark on a recurring cadence and interpret the
              results that get published.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How I think */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            How I think
          </p>
          <div className="mt-6 space-y-3">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-xl border border-white/10 bg-surface p-5">
                <p className="text-[14px] font-semibold text-white">{p.title}</p>
                <p className="mt-1.5 text-[13px] leading-[1.7] text-white/40">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Relevant background */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            Relevant background
          </p>
          <div className="mt-6 space-y-4 text-[15px] leading-[1.8] text-white/50">
            <p>
              More than 20 years in ecommerce, across brands, marketplaces, merchandising, digital
              transformation, and technology selection.
            </p>
            <p>
              My current focus is AI commerce: product discovery, evaluation systems, and how
              enterprises adopt AI in the path to purchase. RecoScope is where that focus is applied
              and made concrete.
            </p>
          </div>
        </div>
      </section>

      {/* 6. What this project demonstrates */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            What this project demonstrates
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="glow-card rounded-xl border border-white/10 bg-surface p-5">
                <p className="text-[14px] font-semibold text-white">{c.title}</p>
                <p className="mt-2 text-[13px] leading-[1.7] text-white/40">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Contact */}
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-10">
        <div className="rounded-2xl border border-cyan/20 bg-cyan/5 px-6 py-12 text-center sm:px-12">
          <p className="mx-auto max-w-xl text-[18px] font-semibold leading-[1.4] text-white/80">
            I am interested in roles where AI, commerce, product, data, and transformation intersect.
          </p>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40">
            The clearest picture of how I work is the platform itself. Explore it, then get in touch.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/platform" className="inline-block rounded-full bg-cyan px-8 py-3 text-center font-mono text-[13px] font-bold tracking-tight text-void transition-colors hover:bg-cyan/90">
              Explore the platform
            </Link>
            <a href="https://theroberthu.com" target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-cyan/30 bg-cyan/10 px-8 py-3 text-center font-mono text-[13px] font-bold tracking-tight text-cyan transition-all hover:bg-cyan/20">
              Get in touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
