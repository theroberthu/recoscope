import { permanentRedirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string; period: string }>;
}

export default async function PeriodReportPage({ params }: Props) {
  const { slug, period } = await params;
  permanentRedirect(`/tracker/${slug}?period=${encodeURIComponent(period)}`);
}
