"use client";

import { trackPostHog } from "@/lib/posthog";

interface CTABoxProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  href?: string;
  ctaLocation?: string;
}

export function CTABox({
  heading = "Your competitors are showing up in AI results. Are you?",
  description = "Get a free AI Visibility Audit \u2014 see exactly how ChatGPT, Claude, and Gemini talk about your brand, and where you\u2019re missing. Conducted personally by Robert Hu.",
  buttonText = "Book Your Free Audit",
  href = "https://theroberthu.com/geo-audit",
  ctaLocation = "report_bottom",
}: CTABoxProps) {
  return (
    <div className="animate-pulse_glow rounded-2xl border border-cyan/20 bg-surface px-8 py-16 text-center sm:px-12">
      <p className="mx-auto max-w-lg text-[28px] font-bold leading-[1.2] tracking-tight text-white">
        {heading}
      </p>
      <p className="mx-auto mt-5 max-w-sm text-[14px] leading-relaxed text-white/40">
        {description}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackPostHog("cta_clicked", { cta_location: ctaLocation, cta_type: "audit" })}
        className="mt-10 inline-block rounded-full bg-cyan px-8 py-3.5 font-mono text-[13px] font-bold tracking-tight text-void transition-colors hover:bg-cyan/90"
      >
        {buttonText}
      </a>
    </div>
  );
}
