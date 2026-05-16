import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(d: string): string {
  const parts = d.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!parts) return d;
  return `${MONTHS[parseInt(parts[2], 10) - 1]} ${parseInt(parts[3], 10)}, ${parts[1]}`;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publish_date,
      authors: [post.author],
    },
  };
}

function renderMarkdown(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "---") {
      elements.push(<hr key={key++} className="my-10 border-white/5" />);
      i++;
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="mt-10 text-lg font-semibold text-white">
          {line.slice(4)}
        </h3>,
      );
      i++;
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="mt-12 text-xl font-bold text-white">
          {line.slice(3)}
        </h2>,
      );
      i++;
    } else if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={key++}
          className="my-6 border-l-2 border-cyan/40 pl-6 italic text-white/50"
        >
          {quoteLines.join(" ")}
        </blockquote>,
      );
    } else if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\.\s*/, ""));
        i++;
      }
      elements.push(
        <ol key={key++} className="my-4 list-decimal space-y-2 pl-6 text-[#c8ccd0]">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="my-4 list-disc space-y-2 pl-6 text-[#c8ccd0]">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
    } else if (line.trim() === "") {
      i++;
    } else {
      const paraLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("> ") && !lines[i].startsWith("- ") && !lines[i].startsWith("* ") && !lines[i].match(/^\d+\. /)) {
        paraLines.push(lines[i]);
        i++;
      }
      elements.push(
        <p key={key++} className="text-[#c8ccd0]">
          {renderInline(paraLines.join(" "))}
        </p>,
      );
    }
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  const tokens = text.split(/(`[^`]+`|\[([^\]]+)\]\(([^)]+)\)|\*\*[^*]+\*\*)/g);
  const result: React.ReactNode[] = [];
  let idx = 0;

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const codeRegex = /`([^`]+)`/g;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const combined = /(`[^`]+`|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g;

  let lastIndex = 0;
  let match;
  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    const full = match[0];
    if (full.startsWith("`")) {
      result.push(
        <code key={idx++} className="rounded bg-cyan/10 px-1.5 py-0.5 font-mono text-[13px] text-cyan">
          {full.slice(1, -1)}
        </code>,
      );
    } else if (full.startsWith("[")) {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(full);
      if (lm) {
        result.push(
          <a key={idx++} href={lm[2]} className="text-cyan/60 underline underline-offset-2 transition-colors hover:text-cyan">
            {lm[1]}
          </a>,
        );
      }
    } else if (full.startsWith("**")) {
      result.push(
        <strong key={idx++} className="font-semibold text-white">{full.slice(2, -2)}</strong>,
      );
    }
    lastIndex = match.index + full.length;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const baseUrl = "https://www.getrecoscope.com";

  return (
    <div className="bg-dot-grid min-h-screen">
      <ArticleSchema
        headline={post.title}
        description={post.excerpt}
        datePublished={post.publish_date}
        url={`${baseUrl}/blog/${post.slug}`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: baseUrl },
          { name: "Blog", url: `${baseUrl}/blog` },
          { name: post.title, url: `${baseUrl}/blog/${post.slug}` },
        ]}
      />

      <article className="mx-auto max-w-3xl px-6 pb-20 pt-20">
        <p className="font-mono text-[11px] text-white/25">
          {formatDate(post.publish_date)} &middot; {post.author}
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-10 space-y-4 text-base leading-[1.8]">
          {renderMarkdown(post.content)}
        </div>

        <div className="mt-16 border-t border-white/5 pt-8">
          <a
            href="/blog"
            className="font-mono text-[12px] font-medium text-cyan/60 transition-colors hover:text-cyan"
          >
            &larr; All posts
          </a>
        </div>
      </article>
    </div>
  );
}
