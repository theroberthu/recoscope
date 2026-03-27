import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, brand_name, website, category_interest, notes } = body;

  if (!name || !email || !brand_name) {
    return NextResponse.json(
      { error: "Name, email, and brand name are required." },
      { status: 400 },
    );
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  try {
    const sql = getDb();
    await sql`
      INSERT INTO audit_leads (name, email, brand_name, website, category_interest, source_page, lead_type, notes)
      VALUES (${name}, ${email}, ${brand_name}, ${website ?? null}, ${category_interest ?? null}, '/audit', 'audit', ${notes ?? null})
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[audit-api] insert error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
