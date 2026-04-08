"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function CategoryRequestForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (status === "success") {
    return (
      <div className="rounded-xl border border-cyan/20 bg-surface p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <p className="text-lg font-semibold text-white">Request submitted.</p>
        <p className="mt-2 text-[14px] text-[#c8ccd0]">
          We review requests weekly. You&rsquo;ll hear from us if your category is selected.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: "",
      email: fd.get("email"),
      brand_name: fd.get("brand_name") || "",
      category_interest: fd.get("category_name"),
      notes: [
        `Role: ${fd.get("role") || "—"}`,
        `Why: ${fd.get("why") || "—"}`,
      ].join("\n"),
      lead_type: "waitlist",
      source_page: "/request-category",
    };

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Submission failed");

      trackEvent("category_request_submit");
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
        <label htmlFor="category_name" className={labelCls}>Category Name *</label>
        <input id="category_name" name="category_name" type="text" required className={inputCls} placeholder="e.g. Sunscreen, Protein Powder, Pet Food" />
      </div>

      <div>
        <label htmlFor="role" className={labelCls}>Your Role</label>
        <select id="role" name="role" className={`${inputCls} appearance-none`}>
          <option value="">Select your role</option>
          <option value="Brand Owner / DTC Founder">Brand Owner / DTC Founder</option>
          <option value="Brand Manager">Brand Manager</option>
          <option value="Agency / Consultant">Agency / Consultant</option>
          <option value="Analyst / Researcher">Analyst / Researcher</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="email" className={labelCls}>Email *</label>
        <input id="email" name="email" type="email" required className={inputCls} placeholder="you@company.com" />
      </div>

      <div>
        <label htmlFor="brand_name" className={labelCls}>Brand Name</label>
        <input id="brand_name" name="brand_name" type="text" className={inputCls} placeholder="Optional — leave blank if you're not representing a brand" />
      </div>

      <div>
        <label htmlFor="why" className={labelCls}>Why This Category?</label>
        <textarea id="why" name="why" rows={3} className={inputCls} placeholder="e.g. We sell in this category and want to know how AI is recommending competitors" />
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
        {status === "submitting" ? "Submitting..." : "Submit Request"}
      </button>

      <p className="text-center text-[12px] text-white/20">
        We review all requests weekly. You&rsquo;ll hear from us if your category is selected.
      </p>
    </form>
  );
}
