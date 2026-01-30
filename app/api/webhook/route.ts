import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Handle webhook payloads from Farcaster/Base as needed
    console.log("Webhook received:", body);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }
}
