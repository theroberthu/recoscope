import type { Metadata } from "next";
import Link from "next/link";
import { getAllPublishedPrompts } from "@/lib/queries";
import { promptToSlug, promptToTitle } from "@/lib/prompt-seo";

export const metadata: Metadata = {
  title: "AI Product Recommendation Prompts",
  description: "See exactly what we asked ChatGPT, Claude, Gemini, and Perplexity across 15 product categories. Every prompt, every brand recommendation, tracked over time.",
};

export const dynamic = "force-dynamic";

export default async function PromptsIndexPage() {
  let prompts: Awaited<ReturnType<typeof getAllPublishedPrompts>> = [];
  try {
    prompts = await getAllPublishedPrompts();
  } catch (e) {
    console.error("[prompts] failed to load:", e);
  }

  const byCategory = new Map<string, typeof prompts>();
  for (const p of prompts) {
    const list = byCategory.get(p.category_slug) ?? [];
    list.push(p);
    byCategory.set(p.category_slug, list);
  }

  return (
    <div className="bg-dot-grid min-h-screen">
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-20">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
          AI Recommendation Data
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
          Every prompt we test, every brand AI recommends
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/40">
          We run buyer-style prompts through ChatGPT, Claude, Gemini, and Perplexity across {byCategory.size} product categories. These are the questions and the answers.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        {Array.from(byCategory.entries()).map(([catSlug, catPrompts]) => (
          <div key={catSlug} className="mt-12">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white">{catPrompts[0].category_name}</h2>
              <Link
                href={`/tracker/${catSlug}`}
                className="font-mono text-[11px] text-cyan/50 transition-colors hover:text-cyan"
              >
                View tracker &rarr;
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {catPrompts.map((p) => {
                const slug = promptToSlug(p.prompt_text);
                const title = promptToTitle(p.prompt_text, p.category_name);
                return (
                  <Link
                    key={slug}
                    href={`/prompts/${slug}`}
                    className="glow-card block rounded-xl border border-white/10 bg-surface px-6 py-5"
                  >
                    <p className="text-[15px] font-medium text-white">{title}</p>
                    <p className="mt-2 font-mono text-[12px] leading-relaxed text-white/25">
                      &ldquo;{p.prompt_text}&rdquo;
                    </p>
                    <p className="mt-2 text-[11px] text-white/20">
                      {p.response_count} responses across {p.run_count} run{p.run_count !== 1 ? "s" : ""}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
