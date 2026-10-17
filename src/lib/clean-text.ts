/** Preserve published findings, including numeric ranges and line-separated caveats. */
export function cleanText(text: string | null | undefined): string | undefined {
  return text?.trim() || undefined;
}
