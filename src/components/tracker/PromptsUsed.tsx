"use client";

import { useState } from "react";
import Link from "next/link";
import { promptToSlug } from "@/lib/prompt-seo";

const PROMPT_LABELS: Record<number, string> = {
  1: "Broad Discovery",
  2: "Budget Constrained",
  3: "Comparative Ranking",
};

interface PromptsUsedProps {
  prompts: { prompt_number: number; prompt_text: string }[];
}

export function PromptsUsed({ prompts }: PromptsUsedProps) {
  const [open, setOpen] = useState(false);

  if (prompts.length === 0) return null;

  return (
    <div className="mt-6 rounded-lg border border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-left font-mono text-[12px] font-medium text-white/30 transition-colors hover:text-white/50"
      >
        <span>See the prompts we used</span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          &#9662;
        </span>
      </button>

      {open && (
        <div className="border-t border-white/5 px-5 pb-5 pt-4">
          <p className="mb-4 text-[12px] text-white/20">
            All prompts use a consistent buyer persona for this category.
          </p>
          <div className="space-y-4">
            {prompts.map((p) => (
              <div key={p.prompt_number}>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-white/25">
                  Prompt {p.prompt_number} &mdash; {PROMPT_LABELS[p.prompt_number] ?? `Prompt ${p.prompt_number}`}
                </p>
                <Link
                  href={`/prompts/${promptToSlug(p.prompt_text)}`}
                  className="mt-1.5 block font-mono text-[13px] leading-relaxed text-white/40 transition-colors hover:text-cyan/60"
                >
                  {p.prompt_text}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
