interface CTABoxProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}

export function CTABox({
  heading = "Your competitors are showing up in AI results. Are you?",
  description = "Get a free AI Visibility Audit \u2014 see exactly how ChatGPT, Claude, and Gemini talk about your brand, and where you\u2019re missing.",
  buttonText = "Request Your Free Audit",
  href = "/audit",
}: CTABoxProps) {
  return (
    <div className="rounded-2xl bg-gray-950 px-8 py-16 text-center sm:px-12">
      <p className="mx-auto max-w-lg text-[28px] font-bold leading-[1.2] tracking-tight text-white">
        {heading}
      </p>
      <p className="mx-auto mt-5 max-w-sm text-[14px] leading-relaxed text-gray-500">
        {description}
      </p>
      <a
        href={href}
        className="mt-10 inline-block rounded-full bg-white px-8 py-3.5 text-[13px] font-bold tracking-tight text-gray-900 transition-colors hover:bg-gray-100"
      >
        {buttonText}
      </a>
    </div>
  );
}
