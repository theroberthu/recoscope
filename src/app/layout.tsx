import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecoScope — AI Recommendation Tracking & Benchmarks",
  description:
    "Track how AI models recommend products and services. Monthly evergreen benchmarks, seasonal weekly reports, and AI Visibility Audits.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-void font-sans text-white antialiased">
        <header className="relative z-50 border-b border-white/5">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <a
              href="/"
              className="font-mono text-sm font-bold uppercase tracking-widest text-cyan"
            >
              RecoScope
            </a>
            <div className="flex gap-8 text-[13px] font-medium text-white/40">
              <a href="/tracker" className="transition-colors hover:text-white">
                Tracker
              </a>
              <a href="/methodology" className="transition-colors hover:text-white">
                Methodology
              </a>
              <a href="/audit" className="transition-colors hover:text-white">
                Audit
              </a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
