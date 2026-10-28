import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { getLatestPublicSnapshot } from "@/lib/queries";
import { formatSnapshotDate } from "@/lib/discovery.mjs";
import { SnapshotPreview } from "@/components/home/SnapshotPreview";
export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Research and Findings",
  description:
    "Current benchmark findings and dated research into how AI assistants mention and rank product brands.",
};
export const revalidate = 300;
export default async function BlogIndexPage() {
  const posts = getAllPosts();
  let snapshot: Awaited<ReturnType<typeof getLatestPublicSnapshot>> = null;
  try {
    snapshot = await getLatestPublicSnapshot();
  } catch (e) {
    console.error("[research] latest snapshot unavailable", e);
  }
  return (
    <div className="page-shell section-space">
      <p className="eyebrow">Research</p>
      <h1 className="page-title">Findings you can trace to the answers.</h1>
      <p className="page-description">
        Start with a current snapshot, then explore the longer analyses. Each
        publication has its own date, scope, and collection limitations.
      </p>
      {snapshot && (
        <div className="max-w-3xl my-10">
          <SnapshotPreview snapshot={snapshot} />
        </div>
      )}
      <h2 className="section-title">Research archive</h2>
      <div className="research-grid mt-6">
        {posts.map((post) => (
          <Link
            href={`/blog/${post.slug}`}
            key={post.slug}
            className="category-card"
          >
            <time
              dateTime={post.publish_date}
              className="text-sm text-[var(--secondary)]"
            >
              {formatSnapshotDate(post.publish_date)}
            </time>
            <h3 className="mt-3">{post.title}</h3>
            <p className="mt-3 leading-relaxed">{post.excerpt}</p>
            <span className="mt-5 font-semibold text-[var(--brand)]">
              Read the analysis →
            </span>
          </Link>
        ))}
      </div>
      <div className="audit-callout mt-12">
        <div>
          <h2>Keep following the evidence.</h2>
          <p>Subscribe to report updates for the categories you care about.</p>
        </div>
        <a href="/subscribe" className="button-primary">
          Get report updates
        </a>
      </div>
    </div>
  );
}
