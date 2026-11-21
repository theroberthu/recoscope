import { TrackedLink } from "@/components/TrackedLink";
import { auditHref } from "@/lib/discovery.mjs";

export function AuditDeliverables() {
  return <dl className="audit-deliverables">
    <div><dt>Your brand and its competitors</dt><dd>Which brands appear in the captured shopper answers, and how often.</dd></div>
    <div><dt>Where recommendations differ</dt><dd>Who is explicitly ranked first, with the shopper question and original answer attached.</dd></div>
    <div><dt>Questions worth investigating</dt><dd>Product-information gaps and follow-up questions to test, with the collection limits stated.</dd></div>
  </dl>;
}

export function AuditSteps() {
  return <ol className="audit-steps" aria-label="How your free audit works">
    <li><span aria-hidden="true">01</span><div><h3>Tell us your brand.</h3><p>Share your brand, category and email. A product link helps us identify the right business.</p></div></li>
    <li><span aria-hidden="true">02</span><div><h3>We prepare the comparison.</h3><p>We review captured recommendations across ChatGPT, Claude, Gemini and Perplexity.</p></div></li>
    <li><span aria-hidden="true">03</span><div><h3>Get a report you can use.</h3><p>Within 48 hours, receive the evidence and questions worth investigating. No call required.</p></div></li>
  </ol>;
}

export function BrandNextStep({ categoryName, categorySlug }: { categoryName: string; categorySlug: string }) {
  return <section className="brand-next-step" aria-labelledby="brand-next-step-heading">
    <div>
      <p className="eyebrow">For brand owners & ecommerce teams</p>
      <h2 id="brand-next-step-heading">What this means for your brand</h2>
      <p>Use these {categoryName} answers to see which competitors appear for the saved shopper needs. Compare the original answers for product fit, pricing claims and information worth checking.</p>
      <p className="brand-next-step-note">This public snapshot may not cover your brand. A private audit uses your brand and category; an absent listing here does not establish your overall AI visibility.</p>
    </div>
    <div className="brand-next-step-action">
      <TrackedLink href={auditHref(categorySlug)} event="audit_cta_click" source="report" className="button-primary">Get my free brand audit <span aria-hidden="true">↗</span></TrackedLink>
      <p>Brand comparison, captured answers and questions to investigate.<br />Free · No call · Emailed within 48 hours</p>
    </div>
  </section>;
}

export function SampleReadingGuide() {
  return <section className="sample-reading-guide" aria-labelledby="sample-guide-heading">
    <p className="eyebrow">How to use this example</p>
    <h2 id="sample-guide-heading">Three questions your audit helps answer.</h2>
    <ol>
      <li><strong>Are we in the answer?</strong><p>Mention counts describe visibility in these captured answers. They do not measure sales, market share or product quality.</p></li>
      <li><strong>Who gets the first recommendation?</strong><p>Compare explicit ranks separately. An unranked answer has no recorded first choice.</p></li>
      <li><strong>What should we investigate?</strong><p>Read the prompt and answer together. Check product-information differences and frame follow-up tests; these results do not establish why an assistant chose a brand.</p></li>
    </ol>
  </section>;
}
