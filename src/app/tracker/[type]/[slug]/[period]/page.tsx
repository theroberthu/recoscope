import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ type: string; slug: string; period: string }>;
}

export default async function PeriodReportPage({ params }: Props) {
  const { type, slug, period } = await params;
  redirect(`/tracker/${type}/${slug}?period=${encodeURIComponent(period)}`);
}
