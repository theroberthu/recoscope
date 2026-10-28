import { displayAgent, isEligibleResponse } from "@/lib/report-ranking.mjs";
import { AnswerProducts } from "./TrackerMedia";
import type { ProductExample } from "@/lib/tracker-media.mjs";
import type { AgentResponse } from "@/lib/types";
export function CapturedAnswers({
  responses,
  products = [],
}: {
  responses: AgentResponse[];
  products?: ProductExample[];
}) {
  if (!responses.length) return null;
  return (
    <section
      id="captured-answers"
      className="report-card mt-6"
      aria-labelledby="captured-heading"
    >
      <h2 id="captured-heading" className="text-xl font-semibold">
        Inspect the captured answers
      </h2>
      <p className="mt-3 text-sm text-[var(--secondary)]">
        Saved response text is model output. Product and health claims are
        unverified. Tables and cards may be transcribed as text; source labels
        can remain. Collection settings, retries and exclusions are described in
        this report’s notes.
      </p>
      <div className="mt-5 space-y-3">
        {[...responses]
          .sort(
            (a, b) =>
              a.prompt_number - b.prompt_number ||
              a.agent_name.localeCompare(b.agent_name),
          )
          .map((r) => (
            <details
              key={r.id}
              id={`answer-${r.agent_name}-${r.prompt_number}`}
              className="answer-disclosure"
            >
              <summary>
                {displayAgent(r.agent_name)} · Prompt {r.prompt_number}
                <span>
                  {isEligibleResponse(r)
                    ? "Usable answer"
                    : r.analysis_exclusion_reason
                      ? "Excluded from analysis"
                      : "Unavailable or excluded"}
                </span>
              </summary>
              <p className="answer-prompt">{r.prompt_text}</p>
              {r.analysis_exclusion_reason && (
                <p className="report-warning">
                  Excluded: {r.analysis_exclusion_reason}
                </p>
              )}
              <AnswerProducts products={products} answerId={r.id} />
              <pre className="captured-prose">
                {r.raw_response || "No response text was saved."}
              </pre>
            </details>
          ))}
      </div>
    </section>
  );
}
