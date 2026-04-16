"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface AuditRequestFormProps {
  categories: { name: string; slug: string }[];
}

export function AuditRequestForm({ categories }: AuditRequestFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  if (status === "success") {
    return (
      <div className="rounded-xl border border-cyan/20 bg-surface p-8">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <p className="text-center text-lg font-semibold text-white">
          Thanks &mdash; your audit is being prepared.
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-[#c8ccd0]">
          We&rsquo;ll email your full AI visibility report within 48 hours. It includes:
        </p>
        <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed text-white/40">
          <li className="flex items-start gap-2">
            <span className="mt-[6px] block h-1 w-1 shrink-0 rounded-full bg-cyan/40" />
            How often AI models mention your brand across ChatGPT, Claude, Gemini, and Perplexity
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[6px] block h-1 w-1 shrink-0 rounded-full bg-cyan/40" />
            Your rank position compared to competitors
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[6px] block h-1 w-1 shrink-0 rounded-full bg-cyan/40" />
            Specific content gaps holding your brand back
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[6px] block h-1 w-1 shrink-0 rounded-full bg-cyan/40" />
            Actionable recommendations for improvement
          </li>
        </ul>
        {submittedEmail && (
          <p className="mt-5 text-center text-[13px] text-white/25">
            Check your inbox at <span className="text-white/40">{submittedEmail}</span> soon.
          </p>
        )}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const categorySelect = fd.get("category_interest") as string;
    const categoryOther = fd.get("category_other") as string;
    const category = categorySelect === "Other" ? (categoryOther || "Other") : categorySelect;
    const email = fd.get("email") as string;

    const payload = {
      name: fd.get("name"),
      email,
      brand_name: fd.get("brand_name"),
      website: fd.get("product_url") || null,
      category_interest: category || null,
      notes: fd.get("challenge") || null,
      lead_type: "audit",
      source_page: "/audit",
    };

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Submission failed");
      }

      trackEvent("audit_form_submit");
      setSubmittedEmail(email);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setStatus("error");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-[14px] text-white placeholder:text-white/25 outline-none transition-all focus:border-cyan/30 focus:shadow-[0_0_12px_rgba(0,212,170,0.1)]";
  const labelCls = "mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-white/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelCls}>Name *</label>
        <input id="name" name="name" type="text" required className={inputCls} placeholder="Your name" />
      </div>

      <div>
        <label htmlFor="email" className={labelCls}>Email *</label>
        <input id="email" name="email" type="email" required className={inputCls} placeholder="you@company.com" />
      </div>

      <div>
        <label htmlFor="brand_name" className={labelCls}>Brand Name *</label>
        <input id="brand_name" name="brand_name" type="text" required className={inputCls} placeholder="Your brand or product name" />
      </div>

      <div>
        <label htmlFor="product_url" className={labelCls}>Product URL</label>
        <input id="product_url" name="product_url" type="url" className={inputCls} placeholder="Amazon storefront, product page, or DTC site" />
      </div>

      <div>
        <label htmlFor="category_interest" className={labelCls}>Product Category *</label>
        <select
          id="category_interest"
          name="category_interest"
          required
          className={`${inputCls} appearance-none`}
          onChange={(e) => setShowOtherCategory(e.target.value === "Other")}
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.name}>{c.name}</option>
          ))}
          <option value="Other">Other</option>
        </select>
        {showOtherCategory && (
          <input
            name="category_other"
            type="text"
            className={`${inputCls} mt-2`}
            placeholder="What category is your product in?"
          />
        )}
      </div>

      <div>
        <label htmlFor="challenge" className={labelCls}>Biggest challenge <span className="normal-case tracking-normal text-white/15">(optional)</span></label>
        <textarea
          id="challenge"
          name="challenge"
          rows={3}
          className={inputCls}
          placeholder="e.g. We don't show up when people ask AI what to buy"
        />
      </div>

      {status === "error" && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-cyan px-8 py-3.5 font-mono text-[13px] font-bold tracking-tight text-void transition-all hover:bg-cyan/90 hover:shadow-[0_0_20px_rgba(0,212,170,0.25)] disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting..." : "Request Your Free Audit"}
      </button>
    </form>
  );
}
