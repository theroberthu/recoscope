import { getActiveCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TestDbPage() {
  let categories;
  let error: string | null = null;

  try {
    categories = await getActiveCategories();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown database error";
  }

  return (
    <main className="mx-auto max-w-xl p-8 font-mono text-sm">
      <h1 className="mb-4 text-lg font-bold">RecoScope — DB Connection Test</h1>

      {error ? (
        <div className="rounded border border-red-400 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Connection failed</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="rounded border border-green-400 bg-green-50 p-4 text-green-800">
          <p className="font-semibold">
            Connected — {categories!.length} categories found
          </p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(categories, null, 2)}
          </pre>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400">
        Temporary page — remove before production deploy.
      </p>
    </main>
  );
}
