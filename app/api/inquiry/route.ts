import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/app/lib/mongodb";

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      console.error("[Inquiry] MONGODB_URI is not configured.");
      return NextResponse.json(
        { error: "Feedback service is temporarily unavailable." },
        { status: 503 }
      );
    }

    const client = await getMongoClient();
    const db = client.db("portfolio");
    await db.collection("feedback").insertOne({
      name: name.trim(),
      email: email.trim(),
      description: description.trim(),
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, message: "Thanks for your message." });
  } catch (err) {
    console.error("[Inquiry]", err);
    return NextResponse.json(
      { error: "Failed to save your message. Please try again." },
      { status: 500 }
    );
  }
}
