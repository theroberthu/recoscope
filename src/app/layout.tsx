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
      <body className="min-h-screen text-stone-900 antialiased">
        <header className="border-b border-stone-200/60">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <a
              href="/"
              className="text-sm font-bold uppercase tracking-widest text-stone-800"
            >
              RecoScope
            </a>
            <div className="flex gap-8 text-[13px] font-medium text-stone-400">
              <a href="/tracker" className="transition-colors hover:text-stone-800">
                Tracker
              </a>
              <a href="/methodology" className="transition-colors hover:text-stone-800">
                Methodology
              </a>
              <a href="/audit" className="transition-colors hover:text-stone-800">
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
