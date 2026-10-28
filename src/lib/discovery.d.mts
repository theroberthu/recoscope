export function todayCentral(): string;
export function formatSnapshotDate(value: string): string;
export function snapshotAge(
  value: string,
  today?: string,
): "Recent snapshot" | "Historical snapshot";
export function auditHref(category: string, source?: string): string;
export function resolveCategory(
  value: string | undefined,
  categories: { slug: string; name: string }[],
): string;
