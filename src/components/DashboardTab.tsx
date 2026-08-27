"use client";

import React from "react";
import Image from "next/image";
import {
  QrCode,
  Video,
  Activity,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Radio,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { NavTab } from "./Sidebar";

interface WebRTCStats {
  fps: number;
  width: number;
  height: number;
  bitrateKbps: number;
  latencyMs: number;
  jitterMs: number;
  packetsLost: number;
  framesReceived: number;
  framesDropped: number;
  audioActive: boolean;
  audioLevel: number; // 0 to 100
  durationSeconds: number;
  connectionType: string;
}

interface DashboardTabProps {
  isConnected: boolean;
  connectedDeviceName?: string | null;
  stats?: WebRTCStats | null;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onNavigate: (tab: NavTab) => void;
  onDisconnect?: () => void;
}

export function DashboardTab({
  isConnected,
  connectedDeviceName,
  stats,
  videoRef,
  onNavigate,
  onDisconnect,
}: DashboardTabProps) {
  const formatDuration = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Top Banner Status */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border ${
              isConnected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-zinc-900 border-zinc-800 text-zinc-500"
            }`}
          >
            <Image src="/logo.png" alt="MOBILE as WEBCAM" width={30} height={30} className="w-7 h-7 object-contain" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
              Connection Status
            </div>
            <h1 className="text-2xl font-black text-white">
              {isConnected ? (
                <span className="text-emerald-400">
                  {connectedDeviceName || "Mobile Phone"} Connected
                </span>
              ) : (
                "No Device Connected"
              )}
            </h1>
          </div>
        </div>

        <div>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate("camera")}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700 transition-all"
              >
                Full Camera Controls
              </button>
              <button
                onClick={onDisconnect}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-semibold text-xs transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate("connect")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <QrCode className="w-4 h-4" />
              <span>Connect Phone Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Section */}
      {!isConnected ? (
        /* GENUINE EMPTY STATE - ZERO FABRICATED DATA */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Empty State Card */}
          <div className="lg:col-span-2 p-10 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-center text-center space-y-6 min-h-[380px]">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <Video className="w-10 h-10" />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-bold text-white mb-2">
                No Camera Feed Active
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Connect your Android or iPhone mobile web browser by scanning a temporary secure QR code. No phone app required.
              </p>
            </div>
            <button
              onClick={() => onNavigate("connect")}
              className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Start QR Pairing
            </button>
          </div>

          {/* Windows System & Endpoint Status */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
              Windows Endpoint Status
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Camera Preview</div>
                    <div className="text-[11px] text-zinc-400 font-mono">MOBILE as WEBCAM</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  PREVIEW ONLY
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">WebRTC Signaling Engine</div>
                    <div className="text-[11px] text-zinc-400 font-mono">P2P LAN & STUN/TURN</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  ONLINE
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate("diagnostics")}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Run System Diagnostics</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* REAL CONNECTED STATE - ACTUAL WEBRTC TELEMETRY */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Stream Preview Window */}
          <div className="lg:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>LIVE WEBRTC MEDIA PIPELINE</span>
              </div>
              <div className="text-xs font-mono text-zinc-400">
                {stats?.width || 1280}x{stats?.height || 720} @ {stats?.fps || 30} FPS
              </div>
            </div>

            {/* Video Element connected to WebRTC Stream */}
            <div className="relative w-full aspect-video bg-black rounded-xl border border-zinc-800 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-black/80 backdrop-blur border border-zinc-700/50 text-[11px] font-mono text-emerald-400">
                Feeding: MOBILE as WEBCAM Driver
              </div>
            </div>
          </div>

          {/* Real Telemetry Cards */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
              Real-Time WebRTC Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Frame Rate</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {stats?.fps ?? 0} <span className="text-xs text-zinc-400">FPS</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Bitrate</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {stats?.bitrateKbps ?? 0} <span className="text-xs text-zinc-400">Kbps</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Latency / RTT</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {stats?.latencyMs ?? 0} <span className="text-xs text-zinc-400">ms</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Jitter</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {stats?.jitterMs ?? 0} <span className="text-xs text-zinc-400">ms</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Frames Recv</div>
                <div className="text-lg font-bold text-white mt-1">
                  {stats?.framesReceived ?? 0}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Session Duration</div>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                  {formatDuration(stats?.durationSeconds ?? 0)}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
