import { NextResponse } from "next/server";
import { newId, pairingStore } from "@/lib/pairing-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, sender, type, payload } = body;

    if (!sessionId || !sender || !type || !payload) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (sessionId, sender, type, payload)" },
        { status: 400 }
      );
    }

    const id = newId("sig");
    const message = {
      id,
      sessionId,
      sender,
      type,
      payload,
      createdAt: new Date(),
    };
    pairingStore.messages.push(message);

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to post signaling message" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const recipient = searchParams.get("recipient"); // target recipient e.g. 'desktop' means messages sent by 'mobile'
    const since = searchParams.get("since"); // timestamp or ISO string

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId parameter is required" },
        { status: 400 }
      );
    }

    // Sender is opposite of recipient
    const targetSender = recipient === "desktop" ? "mobile" : recipient === "mobile" ? "desktop" : undefined;

    const sinceDate = since ? new Date(since) : null;
    const messages = pairingStore.messages.filter((m) =>
      m.sessionId === sessionId &&
      (!targetSender || m.sender === targetSender) &&
      (!sinceDate || isNaN(sinceDate.getTime()) || m.createdAt > sinceDate)
    );
    const parsedMessages = messages.map((m) => ({
        id: m.id,
        sessionId: m.sessionId,
        sender: m.sender,
        type: m.type,
        payload: m.payload,
        createdAt: m.createdAt.toISOString(),
      }));

    return NextResponse.json({
      success: true,
      messages: parsedMessages,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch signaling messages" },
      { status: 500 }
    );
  }
}
