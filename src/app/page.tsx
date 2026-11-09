import type { Metadata } from "next";
import {
  getCategoriesWithRuns,
  getLatestPublicSnapshot,
  getAuditStats,
} from "@/lib/queries";
import { todayCentral } from "@/lib/discovery.mjs";
import { HomeExperience } from "@/components/home/HomeExperience";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const revalidate = 300;
export default async function HomePage() {
  const [cats, latest, corpus] = await Promise.allSettled([
    getCategoriesWithRuns(), getLatestPublicSnapshot(), getAuditStats(),
  ]);
  return <HomeExperience categories={cats.status === "fulfilled" ? cats.value : []}
    snapshot={latest.status === "fulfilled" ? latest.value : null}
    stats={corpus.status === "fulfilled" ? corpus.value : null} today={todayCentral()} />;
}
