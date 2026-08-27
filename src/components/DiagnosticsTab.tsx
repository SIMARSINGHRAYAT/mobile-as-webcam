"use client";

import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Loader2,
  ShieldCheck,
  Cpu,
  Wifi,
  Video,
  Mic,
  Database,
  Lock,
} from "lucide-react";

interface TestItem {
  id: string;
  name: string;
  category: string;
  status: "PASS" | "WARNING" | "FAIL";
  message: string;
}

export function DiagnosticsTab() {
  const [loading, setLoading] = useState(false);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [testedAt, setTestedAt] = useState<string | null>(null);
  const [tests, setTests] = useState<TestItem[]>([]);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/diagnostics", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setOverallStatus(data.overallStatus);
        setTestedAt(data.testedAt);
        setTests(data.tests || []);
      }
    } catch (e) {
      console.error("Failed to run diagnostics", e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case "FAIL":
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">System Diagnostics</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Run complete 14-point capability audit for WebRTC, network, driver bridge, and MSIXStore compliance.
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running Suite...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run Diagnostics</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Badge */}
      {overallStatus && (
        <div
          className={`p-5 rounded-2xl border flex items-center justify-between ${
            overallStatus === "PASS"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : overallStatus === "WARNING"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {getStatusIcon(overallStatus)}
            <div>
              <div className="text-lg font-bold">
                Diagnostics Completed: Overall {overallStatus}
              </div>
              <div className="text-xs font-mono opacity-80 mt-0.5">
                Execution Time: {new Date(testedAt!).toLocaleString()}
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase border bg-black/40">
            {tests.filter((t) => t.status === "PASS").length} / {tests.length} Passed
          </span>
        </div>
      )}

      {/* Test Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.length === 0 ? (
          <div className="md:col-span-2 p-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3 text-zinc-500">
            <Activity className="w-12 h-12 mx-auto text-zinc-700" />
            <div className="text-base font-bold text-zinc-400">No Diagnostics Run Yet</div>
            <div className="text-xs text-zinc-500">
              Click 'Run Diagnostics' above to audit system endpoints, permissions, WebRTC transport, and Virtual Camera drivers.
            </div>
          </div>
        ) : (
          tests.map((test) => (
            <div
              key={test.id}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(test.status)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{test.name}</h4>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-zinc-900 text-zinc-400 uppercase">
                      {test.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {test.message}
                  </p>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                  test.status === "PASS"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : test.status === "WARNING"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {test.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
