interface CTABoxProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}

export function CTABox({
  heading = "Want to know where your brand stands?",
  description = "Get a free AI Visibility Audit and see how AI models talk about your brand.",
  buttonText = "Request Your Audit",
  href = "/audit",
}: CTABoxProps) {
  return (
    <div className="rounded-lg border border-gray-900 bg-gray-900 px-6 py-8 text-center">
      <p className="text-lg font-bold text-white">{heading}</p>
      <p className="mt-2 text-sm text-gray-300">{description}</p>
      <a
        href={href}
        className="mt-5 inline-block rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
      >
        {buttonText}
      </a>
    </div>
  );
}
