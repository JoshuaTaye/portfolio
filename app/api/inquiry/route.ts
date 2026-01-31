import { NextRequest, NextResponse } from "next/server";

export type InquiryBody = {
  name: string;
  email: string;
  description: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InquiryBody;
    const { name, email, description } = body;

    if (!name?.trim() || !email?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and description are required." },
        { status: 400 }
      );
    }

    // Optional: validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // TODO: Send email, store in DB, or forward to a service.
    // For now we just acknowledge receipt.
    console.info("[Inquiry]", { name: name.trim(), email: email.trim(), description: description.trim() });

    return NextResponse.json({ ok: true, message: "Thanks for your message." });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
