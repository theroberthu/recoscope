import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { PostHogProvider } from "@/lib/posthog";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: {
    template: "%s — RecoScope",
    default: "RecoScope — AI Brand Recommendation Tracker",
  },
  description:
    "Explore dated AI recommendation benchmarks from ChatGPT, Claude, Gemini, and Perplexity, with recorded brand mentions, comparison ranks, prompts, and collection limitations.",
  metadataBase: new URL("https://www.getrecoscope.com"),
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
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
    <html lang="en" data-theme="light">
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
      <body className="min-h-screen bg-void font-sans text-ink antialiased">
        <SiteNav />
        <PostHogProvider>
          <main id="main-content">{children}</main>
        </PostHogProvider>
        <footer className="border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {/* Identity */}
              <div className="sm:col-span-1">
                <p className="text-[13px] font-semibold text-white/60">
                  RecoScope
                </p>
                <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-white/30">
                  An independent AI commerce benchmark designed, built, and
                  operated by{" "}
                  <a
                    href="https://theroberthu.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 transition-colors hover:text-white/60"
                  >
                    Robert Hu
                  </a>
                  .
                </p>
              </div>

              {/* Explore */}
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">
                  Explore
                </p>
                <ul className="mt-3 space-y-2 text-[12px] text-white/30">
                  <li>
                    <Link
                      href="/platform"
                      className="transition-colors hover:text-white/60"
                    >
                      Case study
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tracker"
                      className="transition-colors hover:text-white/60"
                    >
                      Benchmarks
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/methodology"
                      className="transition-colors hover:text-white/60"
                    >
                      Methodology
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="transition-colors hover:text-white/60"
                    >
                      Research
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="transition-colors hover:text-white/60"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/subscribe"
                      className="transition-colors hover:text-white/60"
                    >
                      Subscribe
                    </Link>
                  </li>
                </ul>
              </div>

              {/* For brands */}
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">
                  For brands
                </p>
                <ul className="mt-3 space-y-2 text-[12px] text-white/30">
                  <li>
                    <Link
                      href="/audit"
                      className="transition-colors hover:text-white/60"
                    >
                      Request a private analysis
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6 text-[12px] text-white/20">
              <div className="flex items-center gap-4">
                <a
                  href="https://x.com/recoscope"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white/40"
                >
                  @recoscope
                </a>
                <span className="text-white/10">&middot;</span>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-white/40"
                >
                  Terms
                </Link>
                <span className="text-white/10">&middot;</span>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-white/40"
                >
                  Privacy
                </Link>
              </div>
              <p className="text-white/20">Built and operated by Robert Hu.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
