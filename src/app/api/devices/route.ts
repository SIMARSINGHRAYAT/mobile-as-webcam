import { NextResponse } from "next/server";
import { db } from "@/db";
import { devices, connectionLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  try {
    const allDevices = await db
      .select()
      .from(devices)
      .orderBy(desc(devices.lastConnectedAt));

    return NextResponse.json({
      success: true,
      devices: allDevices,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch devices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceName, browser, platform, clientIp } = body;

    if (!deviceName) {
      return NextResponse.json(
        { success: false, error: "Device name required" },
        { status: 400 }
      );
    }

    const id = "dev_" + crypto.randomBytes(8).toString("hex");
    const now = new Date();

    await db.insert(devices).values({
      id,
      deviceName,
      browser: browser || "Mobile Web",
      platform: platform || "Mobile",
      clientIp: clientIp || "127.0.0.1",
      lastConnectedAt: now,
      createdAt: now,
    });

    return NextResponse.json({ success: true, device: { id, deviceName } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to add device" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, deviceName, isBlocked } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Device ID required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (deviceName !== undefined) updateData.deviceName = deviceName;
    if (isBlocked !== undefined) updateData.isBlocked = isBlocked;
    updateData.lastConnectedAt = new Date();

    await db.update(devices).set(updateData).where(eq(devices.id, id));

    return NextResponse.json({ success: true, updated: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update device" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Device ID required" }, { status: 400 });
    }

    await db.delete(devices).where(eq(devices.id, id));

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete device" },
      { status: 500 }
    );
  }
}
