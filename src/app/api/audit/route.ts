import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, brand_name, website, category_interest, notes, lead_type, source_page } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  // Audit requests require name and brand_name
  const resolvedLeadType = lead_type === "free_monthly_signup" ? "free_monthly_signup" : "audit";
  if (resolvedLeadType === "audit" && (!name || !brand_name)) {
    return NextResponse.json(
      { error: "Name and brand name are required for audit requests." },
      { status: 400 },
    );
  }

  try {
    const sql = getDb();

    // Check for duplicate email with the same lead type
    const existing = await sql`
      SELECT id FROM audit_leads
      WHERE email = ${email} AND lead_type = ${resolvedLeadType}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ duplicate: true });
    }

    await sql`
      INSERT INTO audit_leads (name, email, brand_name, website, category_interest, source_page, lead_type, notes)
      VALUES (
        ${name || ""},
        ${email},
        ${brand_name || ""},
        ${website ?? null},
        ${category_interest ?? null},
        ${source_page || "/audit"},
        ${resolvedLeadType},
        ${notes ?? null}
      )
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
