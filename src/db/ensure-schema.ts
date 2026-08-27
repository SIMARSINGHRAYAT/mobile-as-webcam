import { db } from "@/db";
import { sql } from "drizzle-orm";

let schemaReady: Promise<void> | null = null;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS pairing_sessions (
          id text PRIMARY KEY,
          token text NOT NULL UNIQUE,
          computer_name text NOT NULL DEFAULT 'WINDOWS-PC',
          status text NOT NULL DEFAULT 'active',
          created_at timestamp NOT NULL DEFAULT now(),
          expires_at timestamp NOT NULL,
          expiration_minutes integer NOT NULL DEFAULT 5,
          connection_type text NOT NULL DEFAULT 'same_wifi',
          paired_at timestamp,
          paired_device_id text,
          client_ip text
        );
        CREATE TABLE IF NOT EXISTS connection_logs (
          id text PRIMARY KEY,
          session_id text,
          device_id text,
          device_name text NOT NULL,
          connection_type text NOT NULL,
          event text NOT NULL,
          details text,
          timestamp timestamp NOT NULL DEFAULT now(),
          duration_seconds integer
        );
        CREATE TABLE IF NOT EXISTS webrtc_signaling (
          id text PRIMARY KEY,
          session_id text NOT NULL,
          sender text NOT NULL,
          type text NOT NULL,
          payload text NOT NULL,
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS webrtc_signaling_session_created_idx
          ON webrtc_signaling (session_id, created_at);
      `);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}