import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ type: string; slug: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function OldTrackerRedirect({ params, searchParams }: Props) {
  const { slug } = await params;
  const { period } = await searchParams;
  const url = period ? `/tracker/${slug}?period=${encodeURIComponent(period)}` : `/tracker/${slug}`;
  redirect(url);
}
