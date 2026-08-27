"use client";

import React from "react";
import { QrCode, Power, ShieldCheck, Laptop, AlertCircle } from "lucide-react";
import { NavTab } from "./Sidebar";

interface TopBarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  isConnected: boolean;
  connectedDeviceName?: string | null;
  onDisconnect?: () => void;
}

export function TopBar({
  activeTab,
  onNavigate,
  isConnected,
  connectedDeviceName,
  onDisconnect,
}: TopBarProps) {
  const getTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Application Dashboard";
      case "connect":
        return "Connect Device & QR Pairing";
      case "camera":
        return "Camera Stream & Feed Pipeline";
      case "microphone":
        return "Microphone Audio Endpoint";
      case "devices":
        return "Paired & Stored Devices";
      case "connections":
        return "Connection Audit History";
      case "diagnostics":
        return "14-Point Diagnostic Suite";
      case "settings":
        return "Application Preferences";
      case "help":
        return "Help Center & Troubleshooting";
      case "about":
        return "About & MSIX Store Certification";
      default:
        return "Mobile AS Webcam";
    }
  };

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800 px-6 flex items-center justify-between select-none">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-white tracking-tight">{getTitle()}</h2>
        {isConnected ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Streaming from {connectedDeviceName || "Mobile Phone"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>No Device Connected</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isConnected ? (
          <button
            onClick={() => onNavigate("connect")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <QrCode className="w-4 h-4" />
            <span>Pair Device</span>
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-semibold text-xs transition-all"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        )}

        <div className="h-6 w-[1px] bg-zinc-800 mx-1" />

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 px-3 py-1.5 rounded-xl border border-zinc-800/60">
          <Laptop className="w-3.5 h-3.5 text-zinc-400" />
          <span>WIN-DESKTOP</span>
        </div>
      </div>
    </header>
  );
}
