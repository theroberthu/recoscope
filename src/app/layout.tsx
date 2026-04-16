import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { PostHogProvider } from "@/lib/posthog";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — RecoScope",
    default: "RecoScope — AI Brand Recommendation Tracker",
  },
  description:
    "See which brands ChatGPT, Claude, Gemini & Perplexity recommend. Free AI visibility reports for consumer product categories.",
  metadataBase: new URL("https://getrecoscope.com"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "RecoScope",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@recoscope",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NWNHPKNGBB"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NWNHPKNGBB');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-void font-sans text-white antialiased">
        <header className="relative z-50 border-b border-white/5">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="block">
              <img src="/logo.svg" alt="RecoScope" className="hidden h-10 w-auto sm:block" />
              <img src="/icon.svg" alt="RecoScope" className="block h-8 w-8 sm:hidden" />
            </Link>
            <div className="flex items-center gap-8 text-[13px] font-medium text-white/40">
              <Link href="/tracker" className="transition-colors hover:text-white">
                Tracker
              </Link>
              <Link href="/methodology" className="transition-colors hover:text-white">
                Methodology
              </Link>
              <Link href="/subscribe" className="transition-colors hover:text-white">
                Subscribe
              </Link>
              <Link
                href="/audit"
                className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-1.5 text-cyan transition-all hover:bg-cyan/20"
              >
                Audit
              </Link>
            </div>
          </nav>
        </header>
        <PostHogProvider>
          <main>{children}</main>
        </PostHogProvider>
        <footer className="border-t border-white/5 py-8 text-center">
          <div className="flex justify-center gap-4 text-[12px] text-white/20">
            <a href="https://x.com/recoscope" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white/40">@recoscope</a>
            <span className="text-white/10">&middot;</span>
            <Link href="/terms" className="transition-colors hover:text-white/40">Terms</Link>
            <span className="text-white/10">&middot;</span>
            <Link href="/privacy" className="transition-colors hover:text-white/40">Privacy</Link>
          </div>
          <p className="mt-3 text-[12px] text-white/20">
            An independent benchmark published by{" "}
            <a
              href="https://theroberthu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 transition-colors hover:text-white/50"
            >
              Robert Hu
            </a>
            , e-commerce strategist
          </p>
        </footer>
      </body>
    </html>
  );
}
