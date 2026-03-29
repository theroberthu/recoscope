"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface AuditFormProps {
  categories: { name: string; slug: string }[];
}

export function AuditForm({ categories }: AuditFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "duplicate" | "error">("idle");
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
        <p className="text-lg font-semibold text-white">You&rsquo;re in.</p>
        <p className="mt-2 text-[14px] text-[#c8ccd0]">
          We&rsquo;ll send your first report when the next benchmark drops.
        </p>
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className="rounded-xl border border-cyan/20 bg-surface p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <p className="text-lg font-semibold text-white">You&rsquo;re already signed up.</p>
        <p className="mt-2 text-[14px] text-[#c8ccd0]">
          We&rsquo;ll be in touch.
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
      email: fd.get("email"),
      name: fd.get("name") || null,
      brand_name: fd.get("brand_name") || null,
      category_interest: fd.get("category_interest") || null,
      lead_type: "free_monthly_signup",
    };

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (data?.duplicate) {
        setStatus("duplicate");
        return;
      }

      if (!res.ok) {
        throw new Error(data?.error ?? "Submission failed");
      }

      trackEvent("subscribe_form_submit");
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
        <label htmlFor="email" className={labelCls}>Email *</label>
        <input id="email" name="email" type="email" required className={inputCls} placeholder="you@company.com" />
      </div>

      <div>
        <label htmlFor="name" className={labelCls}>Name</label>
        <input id="name" name="name" type="text" className={inputCls} placeholder="Optional" />
      </div>

      <div>
        <label htmlFor="brand_name" className={labelCls}>Brand Name</label>
        <input id="brand_name" name="brand_name" type="text" className={inputCls} placeholder="Leave blank if you're not representing a brand" />
      </div>

      <div>
        <label htmlFor="category_interest" className={labelCls}>Category Interest</label>
        <select id="category_interest" name="category_interest" className={`${inputCls} appearance-none`}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.name}>{c.name}</option>
          ))}
        </select>
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
        {status === "submitting" ? "Subscribing..." : "Subscribe \u2014 It\u2019s Free"}
      </button>
    </form>
  );
}
