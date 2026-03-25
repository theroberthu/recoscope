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
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <header className="border-b border-gray-200">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <a href="/" className="text-xl font-bold tracking-tight">
              RecoScope
            </a>
            <div className="flex gap-6 text-sm font-medium">
              <a href="/tracker" className="hover:text-gray-600">
                Tracker
              </a>
              <a href="/methodology" className="hover:text-gray-600">
                Methodology
              </a>
              <a href="/audit" className="hover:text-gray-600">
                Get an Audit
              </a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
