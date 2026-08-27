import { NextResponse } from "next/server";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(appSettings);
    const settings: Record<string, any> = {};

    rows.forEach((r) => {
      try {
        settings[r.key] = JSON.parse(r.value);
      } catch {
        settings[r.key] = r.value;
      }
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { success: false, error: "Settings object required" },
        { status: 400 }
      );
    }

    const now = new Date();

    for (const [key, val] of Object.entries(settings)) {
      const valStr = typeof val === "string" ? val : JSON.stringify(val);
      const existing = await db.select().from(appSettings).where(eq(appSettings.key, key));

      if (existing.length) {
        await db
          .update(appSettings)
          .set({ value: valStr, updatedAt: now })
          .where(eq(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({
          key,
          value: valStr,
          updatedAt: now,
        });
      }
    }

    return NextResponse.json({ success: true, updated: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
