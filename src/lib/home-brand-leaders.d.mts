export interface BrandLeaderCategory {
  name: string;
  slug: string;
  latest_run_date: string;
  latest_period_label: string;
  coverage: { eligible: number; captured: number };
  leadingBrands: { name: string; mentionCount: number }[];
}
export interface HomeBrandLeader {
  brand: string;
  category: string;
  slug: string;
  mentionCount: number;
  eligibleAnswers: number;
  capturedAnswers: number;
  runDate: string;
  tied: boolean;
  href: string;
}
export function homeBrandLeaders(
  categories: BrandLeaderCategory[],
): HomeBrandLeader[];
