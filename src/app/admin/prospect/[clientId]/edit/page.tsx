import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getProspectProfile, updateProspectProfile } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Edit Prospect — RecoScope Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const COOKIE_NAME = "prospect_auth";

function isAuthed(cookieStore: Awaited<ReturnType<typeof cookies>>): boolean {
  const password = process.env.PROSPECT_DASHBOARD_PASSWORD;
  if (!password) return false;
  return cookieStore.get(COOKIE_NAME)?.value === password;
}

async function saveAction(formData: FormData) {
  "use server";
  const clientId = formData.get("clientId") as string;
  const cookieStore = await cookies();
  const password = process.env.PROSPECT_DASHBOARD_PASSWORD;
  if (!password || cookieStore.get(COOKIE_NAME)?.value !== password) {
    redirect(`/admin/prospect/${clientId}`);
  }

  await updateProspectProfile(clientId, {
    personal_note: (formData.get("personal_note") as string) || undefined,
    strategy_text: (formData.get("strategy_text") as string) || undefined,
    recommendation_1: (formData.get("recommendation_1") as string) || undefined,
    recommendation_2: (formData.get("recommendation_2") as string) || undefined,
    recommendation_3: (formData.get("recommendation_3") as string) || undefined,
  });

  redirect(`/admin/prospect/${clientId}/edit?saved=1`);
}

interface Props {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditProspectPage({ params, searchParams }: Props) {
  const { clientId } = await params;
  const { saved } = await searchParams;
  const cookieStore = await cookies();

  if (!isAuthed(cookieStore)) {
    redirect(`/admin/prospect/${clientId}`);
  }

  const profile = await getProspectProfile(clientId);
  if (!profile) notFound();

  return (
    <div className="min-h-screen bg-void">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
              Admin
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white">
              Edit: {profile.brand_name}
            </h1>
          </div>
          <a
            href={`/admin/prospect/${clientId}`}
            className="rounded-lg border border-white/10 px-4 py-2 text-[13px] text-white/40 hover:text-white/60"
          >
            Back to Dashboard
          </a>
        </div>

        {saved && (
          <p className="mt-4 rounded-lg bg-green-500/10 px-4 py-2 text-[13px] text-green-400">
            Changes saved successfully.
          </p>
        )}

        <form action={saveAction} className="mt-8 space-y-8">
          <input type="hidden" name="clientId" value={clientId} />

          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/30">
              Prospect Info
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-surface p-5">
              <div>
                <p className="text-[11px] text-white/25">Name</p>
                <p className="mt-1 text-[14px] text-white/60">{profile.prospect_name}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/25">Brand</p>
                <p className="mt-1 text-[14px] text-white/60">{profile.brand_name}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/25">Password</p>
                <p className="mt-1 font-mono text-[14px] text-white/60">{profile.password}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/25">Report URL</p>
                <p className="mt-1 font-mono text-[12px] text-cyan/60">/prospect/{clientId}?key={profile.password}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/30">
              Personal Note (Section 1)
            </label>
            <p className="mt-1 text-[11px] text-white/20">
              Addressed to the prospect by name. 2-3 sentences, conversational.
            </p>
            <textarea
              name="personal_note"
              rows={4}
              defaultValue={profile.personal_note ?? ""}
              placeholder={`${profile.prospect_name} - this report is your private snapshot of how AI search is treating ${profile.brand_name} right now. I tracked your brand across ChatGPT and Claude over 5 days. Findings below.`}
              className="mt-2 w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-[14px] text-white placeholder-white/15 outline-none focus:border-cyan/50"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/30">
              Strategy Text (Section 6)
            </label>
            <p className="mt-1 text-[11px] text-white/20">
              Overrides the auto-generated strategy from run insights. Leave blank to use auto-generated.
            </p>
            <textarea
              name="strategy_text"
              rows={4}
              defaultValue={profile.strategy_text ?? ""}
              placeholder="Custom strategy paragraph..."
              className="mt-2 w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-[14px] text-white placeholder-white/15 outline-none focus:border-cyan/50"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/30">
              Recommendations (Section 8)
            </label>
            <p className="mt-1 text-[11px] text-white/20">
              Three specific actions. Leave blank to hide this section.
            </p>
            <div className="mt-2 space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan/10 font-mono text-[11px] font-bold text-cyan">1</span>
                <textarea
                  name="recommendation_1"
                  rows={2}
                  defaultValue={profile.recommendation_1 ?? ""}
                  placeholder="First recommendation..."
                  className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-[14px] text-white placeholder-white/15 outline-none focus:border-cyan/50"
                />
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan/10 font-mono text-[11px] font-bold text-cyan">2</span>
                <textarea
                  name="recommendation_2"
                  rows={2}
                  defaultValue={profile.recommendation_2 ?? ""}
                  placeholder="Second recommendation..."
                  className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-[14px] text-white placeholder-white/15 outline-none focus:border-cyan/50"
                />
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan/10 font-mono text-[11px] font-bold text-cyan">3</span>
                <textarea
                  name="recommendation_3"
                  rows={2}
                  defaultValue={profile.recommendation_3 ?? ""}
                  placeholder="Third recommendation..."
                  className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-[14px] text-white placeholder-white/15 outline-none focus:border-cyan/50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="rounded-lg bg-cyan px-6 py-3 font-mono text-[13px] font-bold text-void transition-colors hover:bg-cyan/90"
            >
              Save Changes
            </button>
            <a
              href={`/prospect/${clientId}?key=${profile.password}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-cyan/60 underline underline-offset-2 hover:text-cyan"
            >
              Preview prospect page →
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
