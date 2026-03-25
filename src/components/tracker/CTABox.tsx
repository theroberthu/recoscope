interface CTABoxProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}

export function CTABox({
  heading = "Your competitors are showing up in AI results. Are you?",
  description = "Get a free AI Visibility Audit — see exactly how ChatGPT, Claude, and Gemini talk about your brand, and where you're missing.",
  buttonText = "Request Your Free Audit",
  href = "/audit",
}: CTABoxProps) {
  return (
    <div className="rounded-lg bg-gray-900 px-8 py-10 text-center">
      <p className="text-lg font-bold leading-snug text-white">{heading}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
        {description}
      </p>
      <a
        href={href}
        className="mt-6 inline-block rounded-md bg-white px-6 py-3 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-100"
      >
        {buttonText}
      </a>
    </div>
  );
}
