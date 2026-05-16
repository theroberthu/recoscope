import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights on AI-driven product recommendations, brand visibility, and e-commerce strategy from RecoScope.",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(d: string): string {
  const parts = d.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!parts) return d;
  return `${MONTHS[parseInt(parts[2], 10) - 1]} ${parseInt(parts[3], 10)}, ${parts[1]}`;
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="bg-dot-grid min-h-screen">
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-20">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
          Blog
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
          Insights
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/40">
          How AI models recommend products, which brands are winning, and what e-commerce sellers can do about it.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        {posts.length === 0 ? (
          <p className="text-[14px] text-white/30">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glow-card block rounded-xl border border-white/10 bg-surface px-6 py-6"
              >
                <p className="font-mono text-[11px] text-white/25">
                  {formatDate(post.publish_date)}
                </p>
                <h2 className="mt-2 text-[18px] font-semibold text-white">
                  {post.title}
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-white/40">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
