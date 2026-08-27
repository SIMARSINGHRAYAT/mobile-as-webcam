import { NextResponse } from "next/server";
import { newId, pairingStore } from "@/lib/pairing-store";
import { db } from "@/db";
import { pairingSessions, connectionLogs } from "@/db/schema";
import { and, desc, eq, gt } from "drizzle-orm";
import crypto from "crypto";
import { ensureSchema } from "@/db/ensure-schema";

const useDatabase = Boolean(process.env.DATABASE_URL);

export async function POST(request: Request) {
  try {
    if (useDatabase) await ensureSchema();
    const body = await request.json().catch(() => ({}));
    const expirationMinutes = Number(body.expirationMinutes) || 5;
    const connectionType = body.connectionType || "same_wifi";
    const computerName = body.computerName || "WINDOWS-DESKTOP";

    const id = newId("sess");
    const token = newId("tok");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationMinutes * 60 * 1000);

    const session = {
      id,
      token,
      computerName,
      status: "active",
      createdAt: now,
      expiresAt,
      expirationMinutes,
      connectionType,
    };
    if (useDatabase) {
      await db.insert(pairingSessions).values(session);
      await db.insert(connectionLogs).values({
        id: newId("log"),
        sessionId: id,
        deviceName: "Windows Application",
        connectionType,
        event: "pairing_created",
        details: `Pairing session ${id} created with ${expirationMinutes}m expiration`,
        timestamp: now,
      });
    } else {
      pairingStore.sessions.set(id, session);
    }

    return NextResponse.json({
      success: true,
      session: {
        id,
        token,
        computerName,
        status: "active",
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        expirationMinutes,
        connectionType,
        publicHost: process.env.PUBLIC_HOST || null,
      },
    });
  } catch (err: any) {
    console.error("Error creating pairing session:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    if (useDatabase) await ensureSchema();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");
    const token = searchParams.get("token");

    const now = new Date();

    if (sessionId || token) {
      const session = useDatabase
        ? (sessionId
          ? (await db.select().from(pairingSessions).where(eq(pairingSessions.id, sessionId)))[0]
          : (await db.select().from(pairingSessions).where(eq(pairingSessions.token, token!)))[0])
        : sessionId
          ? pairingStore.sessions.get(sessionId)
          : [...pairingStore.sessions.values()].find((item) => item.token === token);

      if (!session) {
        return NextResponse.json(
          { success: false, error: "Session not found" },
          { status: 404 }
        );
      }

      // Check expiration
      if (new Date(session.expiresAt) < now && session.status === "active") {
        if (useDatabase) {
          await db.update(pairingSessions).set({ status: "expired" }).where(eq(pairingSessions.id, session.id));
        } else {
          session.status = "expired";
        }
      }

      return NextResponse.json({
        success: true,
        session,
      });
    }

    // Return latest active session
    const activeSessions = useDatabase
      ? await db.select().from(pairingSessions).where(and(eq(pairingSessions.status, "active"), gt(pairingSessions.expiresAt, now))).orderBy(desc(pairingSessions.createdAt)).limit(1)
      : [...pairingStore.sessions.values()]
        .filter((item) => item.status === "active" && item.expiresAt > now)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      success: true,
      activeSession: activeSessions[0] || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to query session" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (useDatabase) await ensureSchema();
    const body = await request.json();
    const { sessionId, token, status, deviceName, browser, platform, clientIp } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const session = useDatabase
      ? (await db.select().from(pairingSessions).where(eq(pairingSessions.id, sessionId)))[0]
      : pairingStore.sessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.status === "expired" || new Date(session.expiresAt) < now) {
      return NextResponse.json(
        { success: false, error: "Session has expired" },
        { status: 400 }
      );
    }

    if (token && session.token !== token) {
      return NextResponse.json(
        { success: false, error: "Invalid session token" },
        { status: 403 }
      );
    }

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (status === "paired") {
      updateData.pairedAt = now;
      if (clientIp) updateData.clientIp = clientIp;
    }

    if (useDatabase) {
      await db.update(pairingSessions).set(updateData).where(eq(pairingSessions.id, sessionId));
      if (status === "paired" && deviceName) {
        await db.insert(connectionLogs).values({
          id: crypto.randomUUID(),
          sessionId,
          deviceName,
          connectionType: session.connectionType,
          event: "phone_connected",
          details: `Connected from ${browser || "Browser"} on ${platform || "Mobile"}`,
          timestamp: now,
        });
      }
    } else {
      Object.assign(session, updateData);
    }

    return NextResponse.json({ success: true, updated: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update session" },
      { status: 500 }
    );
  }
}
