import type { Metadata } from "next";
import { FAQSchema } from "@/components/seo/JsonLd";
export const metadata: Metadata = {
  alternates: { canonical: "/methodology" },
  title: "How RecoScope Measures AI Recommendations",
  description:
    "The current rules for saved shopper prompts, usable-answer coverage, unique brand mentions, explicitly supported ranks, collection settings and review status.",
};
const questions = [
  {
    question: "What does a brand mention measure?",
    answer:
      "A brand counts once per usable answer, including alternatives, comparisons and criticism. Mention frequency measures presence in the captured answers, not endorsement, product quality or sales.",
  },
  {
    question: "When does a brand receive a numeric rank?",
    answer:
      "Current collections record a numeric brand rank only when the comparative answer explicitly supports that position. Product-card order, source order and category-best labels do not become inferred overall ranks. Unranked answers remain usable for mentions.",
  },
  {
    question: "How are collection failures handled?",
    answer:
      "Unavailable or explicitly excluded answers do not contribute to the usable-answer denominator or brand analysis. Completed answers with no named brands remain usable. Reports disclose coverage, exclusions and retries.",
  },
  {
    question: "Do differences prove commercial influence?",
    answer:
      "No. The benchmark observes answers for particular prompts and interfaces. It does not establish the hidden cause of a recommendation, advertising influence, model bias or sales impact.",
  },
];
export default function MethodologyPage() {
  return (
    <div className="page-shell section-space reading-page">
      <FAQSchema items={questions} />
      <p className="eyebrow">Measurement rules · updated October 28, 2026</p>
      <h1 className="page-title">How to read the evidence.</h1>
      <p className="page-description">
        RecoScope measures observed answers to saved shopper questions. Every
        report should make clear what was collected, which answers were usable,
        and what the extracted numbers mean.
      </p>
      <div className="rule-summary">
        <h2>The distinction that matters</h2>
        <p>
          <strong>Mentions:</strong> how often a brand enters the answer.{" "}
          <strong>Ranks:</strong> explicitly supported positions in a
          comparison. A mention can be an alternative or a criticism; it does
          not automatically receive a rank.
        </p>
      </div>
      <nav className="contents-list" aria-label="Methodology sections">
        <a href="#collection">Collection</a>
        <a href="#measures">Measures</a>
        <a href="#coverage">Coverage and review</a>
        <a href="#limits">Interpretation limits</a>
      </nav>
      <section id="collection">
        <h2>1. Keep the shopper question consistent</h2>
        <p>
          Each category uses a saved persona and three standalone prompt types:
          broad discovery, a budget or use-case constraint, and a comparison
          asking for ranks. Repeat runs reuse the exact saved text. A changed
          prompt set establishes a comparison boundary.
        </p>
        <h3>Record the collection conditions</h3>
        <p>
          Collection uses the live ChatGPT, Claude, Gemini, and Perplexity
          consumer interfaces. Account tier, model or selected mode, browser
          surface, native private/temporary settings, collection window,
          failures and retries are recorded. A setting that cannot be verified
          is disclosed; it is not silently assumed.
        </p>
        <p>
          Each prompt starts in a fresh chat. Complete answers and relevant
          product cards or tables are preserved before extraction. A loading or
          capture failure may receive one fresh-chat retry, with the original
          failure retained. Contradictory or undesirable recommendations are not
          rerun to obtain a preferred result.
        </p>
        <p>
          Model names, retrieval behavior and commercial features can change.
          They are collection context, not fixed categories that establish a
          model’s independence or commercial influence.
        </p>
      </section>
      <section id="measures">
        <h2>2. Measure presence and explicit position separately</h2>
        <div className="overflow-x-auto">
          <table className="preview-table">
            <thead>
              <tr>
                <th scope="col">Measure</th>
                <th scope="col">Rule</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Mention frequency</th>
                <td>
                  One normalized brand per usable model/prompt answer.
                  Alternatives and critical mentions count as visibility.
                  Repeated names within that answer count once.
                </td>
              </tr>
              <tr>
                <th scope="row">Mention rate</th>
                <td>
                  Usable answers mentioning the brand divided by all usable
                  answers in the stated scope, including usable answers that
                  name no brands.
                </td>
              </tr>
              <tr>
                <th scope="row">Recorded rank</th>
                <td>
                  In current collections, a numeric position must be explicitly
                  supported by the comparative answer. Product-card order,
                  appearance order and category-best numbering do not substitute
                  for an overall rank.
                </td>
              </tr>
              <tr>
                <th scope="row">First and top-three positions</th>
                <td>
                  Recorded rank 1, or ranks 1–3, within the stated comparison
                  answers. Unranked responses contribute mentions without
                  invented positions. Ties and empty slots are preserved.
                </td>
              </tr>
              <tr>
                <th scope="row">Cross-model agreement</th>
                <td>
                  Report which services mention or explicitly rank a brand, with
                  the number of usable comparison answers stated. Agreement is
                  an observation about this collection.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3>Normalize names, preserve context</h3>
        <p>
          Raw brand strings are retained alongside normalized names. A brand is
          counted once per answer. Retailers, source labels, image-only captions
          and suggested follow-up questions are not additional product-brand
          mentions. Grouped ranks, product variants and ambiguous names require
          explicit interpretation notes.
        </p>
      </section>
      <section id="coverage">
        <h2>3. Show coverage and review status</h2>
        <p>
          Unavailable, empty or explicitly excluded answers are removed from
          brand analysis and its denominator. A completed clarification or
          answer with no named brands remains usable. Reports show usable versus
          stored answer counts and participating services; a missing numeric
          ranking does not make an otherwise usable answer unavailable.
        </p>
        <p>
          Capture, extraction and stored-data checks gate publication.
          AI-assisted review is distinct from human review. A report says “No
          human review recorded” unless a human review has been recorded;
          publication alone does not imply human validation.
        </p>
        <h3>Use dates as the source of truth</h3>
        <p>
          Collections follow a rolling rotation. The intended cadence is monthly
          for evergreen categories and weekly during active seasonal periods;
          actual collection dates and gaps remain visible. “Recent snapshot”
          means a publication within 45 days. “Historical snapshot” describes an
          older publication, not an unpublished report.
        </p>
      </section>
      <section id="limits">
        <h2>4. Interpret each snapshot within its limits</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            AI outputs vary between sessions. A small set of captured answers
            does not predict every shopper’s experience.
          </li>
          <li>
            Model, tier, prompt, browser, collection window and parsing changes
            can limit historical comparisons. Older records may use earlier rank
            conventions; the current rules do not retroactively certify them.
          </li>
          <li>
            Trends describe recorded mention positions. They do not establish
            the cause of a change or a clean growth rate across method changes.
          </li>
          <li>
            Product prices, availability, performance, health, safety and
            certification claims in captured answers are model output unless
            separately verified.
          </li>
          <li>
            Differences between services do not prove bias, advertising
            influence, or another hidden cause. RecoScope does not measure sales
            lift.
          </li>
          <li>
            Brands do not pay to alter benchmark rankings. A private audit does
            not change the public benchmark.
          </li>
        </ul>
      </section>
      <section>
        <h2>Questions about the method</h2>
        {questions.map((q) => (
          <details className="answer-disclosure" key={q.question}>
            <summary>{q.question}</summary>
            <p>{q.answer}</p>
          </details>
        ))}
      </section>
      <div className="hero-actions">
        <a href="/tracker" className="button-primary">
          Explore the benchmarks
        </a>
        <a href="/platform" className="button-secondary">
          Read the project case study
        </a>
      </div>
    </div>
  );
}
