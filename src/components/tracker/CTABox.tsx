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
    <div className="rounded-2xl bg-gray-900 px-10 py-14 text-center">
      <p className="mx-auto max-w-md text-2xl font-bold leading-snug tracking-tight text-white">
        {heading}
      </p>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
        {description}
      </p>
      <a
        href={href}
        className="mt-8 inline-block rounded-lg bg-white px-8 py-3.5 text-sm font-bold tracking-tight text-gray-900 transition-colors hover:bg-gray-100"
      >
        {buttonText}
      </a>
    </div>
  );
}
