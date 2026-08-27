"use client";

import React, { useState, useEffect } from "react";
import { History, RefreshCw, Filter, ShieldCheck, Clock } from "lucide-react";

interface LogRecord {
  id: string;
  sessionId: string | null;
  deviceName: string;
  connectionType: string;
  event: string;
  details: string | null;
  timestamp: string;
  durationSeconds: number | null;
}

export function ConnectionsTab() {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error("Failed to fetch connection logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getEventBadge = (evt: string) => {
    switch (evt) {
      case "phone_connected":
      case "camera_started":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "pairing_created":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "disconnected":
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
      case "error":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Connection Audit History</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Genuine connection event records stored in PostgreSQL.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs border border-zinc-700 flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center space-y-3 text-zinc-500">
            <History className="w-12 h-12 mx-auto text-zinc-700" />
            <div className="text-base font-bold text-zinc-400">No Connection History Recorded</div>
            <div className="text-xs text-zinc-500">
              When pairing sessions are created and phones connect, timestamps will appear here.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Device</th>
                  <th className="p-4">Connection Type</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4 text-zinc-400 font-bold whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-white whitespace-nowrap">
                      {log.deviceName}
                    </td>
                    <td className="p-4 text-emerald-400 uppercase whitespace-nowrap">
                      {log.connectionType}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getEventBadge(
                          log.event
                        )}`}
                      >
                        {log.event.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 font-sans max-w-md truncate">
                      {log.details || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
