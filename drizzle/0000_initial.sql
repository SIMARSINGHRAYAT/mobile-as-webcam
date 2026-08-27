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

CREATE TABLE IF NOT EXISTS devices (
  id text PRIMARY KEY,
  device_name text NOT NULL,
  browser text NOT NULL DEFAULT 'Unknown Browser',
  platform text NOT NULL DEFAULT 'Mobile',
  client_ip text,
  last_connected_at timestamp NOT NULL DEFAULT now(),
  is_blocked boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diagnostics_results (
  id text PRIMARY KEY,
  tested_at timestamp NOT NULL DEFAULT now(),
  overall_status text NOT NULL,
  results_json text NOT NULL
);