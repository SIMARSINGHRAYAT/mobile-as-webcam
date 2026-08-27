import { NextResponse } from "next/server";
import { db } from "@/db";
import { connectionLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  try {
    const logs = await db
      .select()
      .from(connectionLogs)
      .orderBy(desc(connectionLogs.timestamp))
      .limit(100);

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch connection logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, deviceId, deviceName, connectionType, event, details, durationSeconds } = body;

    if (!eventNameCheck(event)) {
      return NextResponse.json(
        { success: false, error: "Invalid event type" },
        { status: 400 }
      );
    }

    const id = "log_" + crypto.randomBytes(8).toString("hex");

    await db.insert(connectionLogs).values({
      id,
      sessionId: sessionId || null,
      deviceId: deviceId || null,
      deviceName: deviceName || "System",
      connectionType: connectionType || "same_wifi",
      event,
      details: details || null,
      timestamp: new Date(),
      durationSeconds: durationSeconds ? Number(durationSeconds) : null,
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to insert log" },
      { status: 500 }
    );
  }
}

function eventNameCheck(event: string) {
  return typeof event === "string" && event.length > 0;
}
