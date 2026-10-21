import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const NOTIFY_EMAIL = "robert@theroberthu.com";

const VALID_LEAD_TYPES = new Set(["audit", "free_monthly_signup", "waitlist"]);

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
  const name = text(body.name);
  const email = text(body.email).toLowerCase();
  const brand_name = text(body.brand_name);
  const category_interest = text(body.category_interest);
  const notes = text(body.notes);
  const source_page = text(body.source_page);
  const lead_type = text(body.lead_type);
  let website = text(body.website);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (website) {
    try {
      const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(website) ? website : `https://${website}`);
      if (!["https:", "http:"].includes(url.protocol) || !url.hostname.includes(".")) {
        throw new Error("Invalid website");
      }
      website = url.href;
    } catch {
      return NextResponse.json({ error: "Enter a valid product website, such as example.com." }, { status: 400 });
    }
  }

  const resolvedLeadType = VALID_LEAD_TYPES.has(lead_type) ? lead_type : "audit";

  if (resolvedLeadType === "audit" && (!name || !brand_name)) {
    return NextResponse.json(
      { error: "Name and brand name are required for audit requests." },
      { status: 400 },
    );
  }

  try {
    const sql = getDb();

    const existing = await sql`
      SELECT id FROM audit_leads
      WHERE lower(trim(email)) = ${email} AND lead_type = ${resolvedLeadType}
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
        ${website || null},
        ${category_interest || null},
        ${source_page || "/audit"},
        ${resolvedLeadType},
        ${notes || null}
      )
    `;

    // Finish the notification attempt before the serverless request ends.
    // The saved lead remains successful even when the email provider fails.
    if (resend) {
      const subjects: Record<string, string> = {
        audit: `New Audit Lead: ${brand_name || email}`,
        free_monthly_signup: `New Subscriber: ${email}`,
        waitlist: `Category Request: ${category_interest || email}`,
      };

      const bodies: Record<string, string> = {
        audit: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Brand: ${brand_name}`,
          `Product URL: ${website || "—"}`,
          `Category: ${category_interest || "—"}`,
          `Challenge: ${notes || "—"}`,
          `Submitted: ${new Date().toISOString()}`,
        ].join("\n"),
        free_monthly_signup: [
          `Email: ${email}`,
          `Name: ${name || "—"}`,
          `Brand: ${brand_name || "—"}`,
          `Category: ${category_interest || "All"}`,
          `Submitted: ${new Date().toISOString()}`,
        ].join("\n"),
        waitlist: [
          `Category: ${category_interest || "—"}`,
          `Email: ${email}`,
          `Brand: ${brand_name || "—"}`,
          `Details: ${notes || "—"}`,
          `Submitted: ${new Date().toISOString()}`,
        ].join("\n"),
      };

      try {
        const result = await resend.emails.send({
          from: "RecoScope <alerts@getrecoscope.com>",
          replyTo: email,
          to: NOTIFY_EMAIL,
          subject: subjects[resolvedLeadType] ?? `New RecoScope Lead: ${email}`,
          text: bodies[resolvedLeadType] ?? `Email: ${email}\nType: ${resolvedLeadType}`,
        });
        if (result.error) {
          console.error("[audit-api] email notification rejected:", result.error);
        }
      } catch (err) {
          console.error("[audit-api] email notification failed:", err);
      }
    } else {
      console.error("[audit-api] lead saved but RESEND_API_KEY is not configured");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[audit-api] insert error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
