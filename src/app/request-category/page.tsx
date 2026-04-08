import type { Metadata } from "next";
import { CategoryRequestForm } from "@/components/audit/CategoryRequestForm";

export const metadata: Metadata = {
  title: "Request a Category",
  description: "Tell us what category you want benchmarked. New categories added monthly based on demand.",
};

export default function RequestCategoryPage() {
  return (
    <div className="bg-dot-grid">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-10">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
          Tracker
        </p>
        <h1 className="mt-4 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-5xl font-bold leading-[1.1] tracking-tight text-transparent">
          Don&rsquo;t See Your Category?
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/40">
          Tell us what you sell and we&rsquo;ll prioritize it for our next benchmark.
          New categories are added monthly based on demand.
        </p>
      </section>

      {/* Form + Context */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Form */}
            <div>
              <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
                Request a Category
              </p>
              <CategoryRequestForm />
            </div>

            {/* Right panel */}
            <div>
              <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                What Happens Next
              </p>
              <ul className="space-y-4">
                {[
                  "We review category requests every week",
                  "Categories with the most demand get prioritized",
                  "You\u2019ll be notified by email when your category launches",
                  "All subscribers get early access to new category reports",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/10">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[14px] leading-relaxed text-[#c8ccd0]">{item}</span>
                  </li>
                ))}
              </ul>

              {/* TODO: update with real roadmap */}
              <div className="mt-8 rounded-xl border border-white/10 bg-surface p-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">
                  Coming Soon
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/30">
                  Skincare &middot; Supplements &middot; Pet Food &middot; Coffee &middot; Wireless Earbuds
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
