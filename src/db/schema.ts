import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const pairingSessions = pgTable("pairing_sessions", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  computerName: text("computer_name").notNull().default("WINDOWS-PC"),
  status: text("status").notNull().default("active"), // active, paired, expired, invalidated
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  expirationMinutes: integer("expiration_minutes").notNull().default(5),
  connectionType: text("connection_type").notNull().default("same_wifi"), // same_wifi, usb_tether, remote_internet
  pairedAt: timestamp("paired_at"),
  pairedDeviceId: text("paired_device_id"),
  clientIp: text("client_ip"),
});

export const devices = pgTable("devices", {
  id: text("id").primaryKey(),
  deviceName: text("device_name").notNull(),
  browser: text("browser").notNull().default("Unknown Browser"),
  platform: text("platform").notNull().default("Mobile"),
  clientIp: text("client_ip"),
  lastConnectedAt: timestamp("last_connected_at").notNull().defaultNow(),
  isBlocked: boolean("is_blocked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const connectionLogs = pgTable("connection_logs", {
  id: text("id").primaryKey(),
  sessionId: text("session_id"),
  deviceId: text("device_id"),
  deviceName: text("device_name").notNull(),
  connectionType: text("connection_type").notNull(),
  event: text("event").notNull(), // pairing_created, phone_connected, camera_started, mic_started, camera_stopped, mic_stopped, degraded, reconnecting, disconnected, error
  details: text("details"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  durationSeconds: integer("duration_seconds"),
});

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // JSON string or simple value
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const diagnosticsResults = pgTable("diagnostics_results", {
  id: text("id").primaryKey(),
  testedAt: timestamp("tested_at").notNull().defaultNow(),
  overallStatus: text("overall_status").notNull(), // PASS, WARNING, FAIL
  resultsJson: text("results_json").notNull(),
});

export const webrtcSignaling = pgTable("webrtc_signaling", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  sender: text("sender").notNull(), // 'desktop' or 'mobile'
  type: text("type").notNull(), // 'offer', 'answer', 'candidate', 'heartbeat', 'control'
  payload: text("payload").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
