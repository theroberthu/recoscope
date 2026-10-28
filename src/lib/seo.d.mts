export const SITE_URL: string;
export const CONTENT_UPDATED_AT: string;
export function canonicalUrl(path?: string): string;
export function reportUrl(slug: string, period: string): string;
export function isoDate(value: unknown): string | undefined;
export function latestDate(...values: unknown[]): string | undefined;
export const PUBLISHER: {
  "@type": string;
  "@id": string;
  name: string;
  url: string;
  logo: { "@type": string; url: string };
};
export const ROBERT_HU: {
  "@type": string;
  "@id": string;
  name: string;
  url: string;
  sameAs: string[];
};
export interface ArticleDataProps {
  headline: string;
  description: string;
  datePublished: unknown;
  dateModified?: unknown;
  url: string;
  authorName?: string;
}
export function articleSchemaData(
  props: ArticleDataProps,
): Record<string, unknown>;
export function jsonLd(data: unknown): string;
