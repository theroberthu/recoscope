import type { Metadata } from "next";
import Script from "next/script";
import { PostHogProvider } from "@/lib/posthog";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — RecoScope",
    default: "RecoScope — AI Recommendation Benchmarks for Consumer Brands",
  },
  description:
    "Track which brands AI models recommend. RecoScope benchmarks product recommendations across ChatGPT, Claude, Gemini, and Perplexity so brands can see where they stand.",
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
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <a
              href="/"
              className="font-mono text-sm font-bold uppercase tracking-widest text-cyan"
            >
              RecoScope
            </a>
            <div className="flex items-center gap-8 text-[13px] font-medium text-white/40">
              <a href="/tracker" className="transition-colors hover:text-white">
                Tracker
              </a>
              <a href="/methodology" className="transition-colors hover:text-white">
                Methodology
              </a>
              <a href="/subscribe" className="transition-colors hover:text-white">
                Subscribe
              </a>
              <a
                href="/audit"
                className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-1.5 text-cyan transition-all hover:bg-cyan/20"
              >
                Audit
              </a>
            </div>
          </nav>
        </header>
        <PostHogProvider>
          <main>{children}</main>
        </PostHogProvider>
        <footer className="border-t border-white/5 py-8 text-center">
          <p className="text-[12px] text-white/20">
            Built by{" "}
            <a
              href="https://theroberthu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 transition-colors hover:text-white/50"
            >
              Robert Hu
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
