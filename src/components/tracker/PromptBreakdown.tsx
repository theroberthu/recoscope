"use client";

import { useState } from "react";
import { rankSlots, displayAgent } from "@/lib/report-ranking.mjs";
import type { PromptResult, BudgetInsights } from "@/lib/report-ranking.mjs";

interface PromptBreakdownProps {
  prompts: PromptResult[];
  budgetInsights: BudgetInsights | null;
}

const PROMPT_LABELS: Record<number, string> = {
  1: "Broad discovery",
  2: "Budget constrained",
  3: "Comparative ranking",
};

export function PromptBreakdown({
  prompts,
  budgetInsights,
}: PromptBreakdownProps) {
  const [open, setOpen] = useState(false);

  if (prompts.length === 0) return null;

  return (
    <div className="rounded-lg border border-white/5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="prompt-breakdown-content"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-left font-mono text-[12px] font-medium text-white/30 transition-colors hover:text-white/50"
      >
        <span>
          {open ? "Hide prompt-level breakdown" : "Show prompt-level breakdown"}
        </span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          &#9662;
        </span>
      </button>

      {open && (
        <div
          id="prompt-breakdown-content"
          className="border-t border-white/5 px-5 pb-6 pt-5 space-y-10"
        >
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              Results by prompt type
            </p>
            <p className="mt-1 text-[13px] text-white/25">
              Numbered slots show recorded response ranks. Ties share a slot;
              missing ranks stay empty. Unranked brands are listed separately.
              Historical parsing conventions may differ.
            </p>
          </div>

          {prompts.map((p) => (
            <div key={p.promptNumber}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan/50">
                Prompt {p.promptNumber} &mdash;{" "}
                {PROMPT_LABELS[p.promptNumber] ?? `Prompt ${p.promptNumber}`}
              </p>
              <p className="mt-2 font-mono text-[12px] leading-relaxed text-white/20">
                &ldquo;{p.promptText}&rdquo;
              </p>

              <div className="mt-4 overflow-x-auto rounded-lg border border-white/5 bg-white/[0.02]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">
                        Agent
                      </th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-cyan/30">
                        #1
                      </th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/15">
                        #2
                      </th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/15">
                        #3
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.agentBrands.map((row, i) => (
                      <tr
                        key={row.agent}
                        className={
                          i < p.agentBrands.length - 1
                            ? "border-b border-white/[0.03]"
                            : ""
                        }
                      >
                        <td className="px-4 py-2.5 font-mono text-[12px] font-semibold text-white/40">
                          {displayAgent(row.agent)}
                        </td>
                        {row.status ? (
                          <td
                            colSpan={3}
                            className="px-4 py-2.5 text-[12px] text-white/50"
                          >
                            {row.status}
                          </td>
                        ) : (
                          [0, 1, 2].map((idx) => (
                            <td
                              key={idx}
                              className={`px-4 py-2.5 text-[12px] ${idx === 0 ? "text-white/50" : "text-white/25"}`}
                            >
                              {rankSlots(row.rankedBrands)[idx] || "\u2014"}
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 space-y-2 text-[12px] leading-relaxed text-white/50">
                {p.agentBrands
                  .filter((row) => row.allBrands.length > 0)
                  .map((row) => (
                    <p key={row.agent}>
                      <span className="font-semibold text-white/60">
                        {displayAgent(row.agent)} mentions:
                      </span>{" "}
                      {row.allBrands.join(", ")}
                    </p>
                  ))}
                <p>
                  Mentions include alternatives and criticism; they do not
                  establish product suitability or budget compliance.
                </p>
              </div>

              {/* Budget insights — show below prompt 2 */}
              {p.promptNumber === 2 && budgetInsights && (
                <div className="mt-3 space-y-1.5 text-[12px]">
                  <p className="text-white/50">
                    Compared across {budgetInsights.modelsCompared} models with
                    usable answers to all three prompts.
                  </p>
                  {budgetInsights.budgetOnly.length > 0 && (
                    <p className="text-cyan/40">
                      Mentioned only in budget answers:{" "}
                      <span className="text-cyan/60">
                        {budgetInsights.budgetOnly.join(", ")}
                      </span>
                    </p>
                  )}
                  {budgetInsights.disappearUnderBudget.length > 0 && (
                    <p className="text-amber-400/40">
                      Not mentioned in budget answers:{" "}
                      <span className="text-amber-400/60">
                        {budgetInsights.disappearUnderBudget.join(", ")}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
