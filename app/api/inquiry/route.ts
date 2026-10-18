import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/app/lib/mongodb";
import { validateInquiry, type Inquiry } from "@/app/lib/inquiry";
import { isInquiryEmailConfigured, sendInquiryEmail } from "@/app/lib/sendgrid";

export type InquiryBody = {
  name: string;
  email: string;
  description: string;
  /** Honeypot — hidden from people, so only bots fill it in. */
  company?: string;
};

/**
 * Best-effort per-IP limit. It lives in memory, so each serverless instance
 * counts separately — enough to stop a single bot hammering the form.
 */
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };
const recentHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recentHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  hits.push(now);
  recentHits.set(ip, hits);

  if (recentHits.size > 1000) {
    for (const [key, times] of recentHits) {
      if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) recentHits.delete(key);
    }
  }
  return hits.length > RATE_LIMIT.max;
}

async function saveInquiry(inquiry: Inquiry) {
  const client = await getMongoClient();
  await client.db("portfolio").collection("feedback").insertOne({
    name: inquiry.name,
    email: inquiry.email,
    description: inquiry.message,
    createdAt: new Date(),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Partial<InquiryBody> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Pretend success so bots don't learn to skip the honeypot.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true, message: "Thanks for your message." });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages — please try again later, or email me directly." },
      { status: 429 }
    );
  }

  const result = validateInquiry(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const deliveries: Promise<void>[] = [];
  if (process.env.MONGODB_URI) deliveries.push(saveInquiry(result.inquiry));
  if (isInquiryEmailConfigured()) deliveries.push(sendInquiryEmail(result.inquiry));

  if (deliveries.length === 0) {
    console.error("[Inquiry] Neither MONGODB_URI nor SendGrid email is configured.");
    return NextResponse.json(
      { error: "The contact form is temporarily unavailable — please email me directly." },
      { status: 503 }
    );
  }

  const outcomes = await Promise.allSettled(deliveries);
  for (const outcome of outcomes) {
    if (outcome.status === "rejected") console.error("[Inquiry]", outcome.reason);
  }

  // One successful channel is enough: the message has reached you.
  if (!outcomes.some((o) => o.status === "fulfilled")) {
    return NextResponse.json(
      { error: "Failed to send your message. Please try again, or email me directly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, message: "Thanks for your message." });
}
