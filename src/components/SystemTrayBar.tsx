"use client";

import React, { useState } from "react";
import { Radio, Power, Camera, Mic, Settings, Minimize2, ExternalLink } from "lucide-react";
import { NavTab } from "./Sidebar";

interface SystemTrayBarProps {
  isConnected: boolean;
  connectedDeviceName?: string | null;
  onNavigate: (tab: NavTab) => void;
  onDisconnect?: () => void;
}

export function SystemTrayBar({
  isConnected,
  connectedDeviceName,
  onNavigate,
  onDisconnect,
}: SystemTrayBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Tray Status Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono transition-all"
        title="Windows Notification Tray Widget"
      >
        <Radio className={`w-3.5 h-3.5 ${isConnected ? "text-emerald-400 animate-pulse" : "text-zinc-500"}`} />
        <span>Tray Helper</span>
      </button>

      {/* Popover Tray Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.9)] z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold">
              Windows System Tray
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
              }`}
            />
          </div>

          <div className="text-xs space-y-1">
            <div className="font-bold text-white">
              {isConnected ? connectedDeviceName || "Phone Stream Active" : "No Device Connected"}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              Driver: Mobile AS Webcam (Ready)
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => {
                onNavigate("connect");
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center justify-between"
            >
              <span>Connect Device</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </button>

            <button
              onClick={() => {
                onNavigate("camera");
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center justify-between"
            >
              <span>Camera Settings</span>
              <Camera className="w-3 h-3 text-emerald-400" />
            </button>

            {isConnected && (
              <button
                onClick={() => {
                  if (onDisconnect) onDisconnect();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-between"
              >
                <span>Disconnect Phone</span>
                <Power className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
