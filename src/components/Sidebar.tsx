"use client";

import React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  QrCode,
  Camera,
  Smartphone,
  History,
  Activity,
  Settings,
  HelpCircle,
  Info,
  Radio,
} from "lucide-react";

export type NavTab =
  | "dashboard"
  | "connect"
  | "camera"
  | "microphone"
  | "devices"
  | "connections"
  | "diagnostics"
  | "settings"
  | "help"
  | "about";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isConnected: boolean;
}

export function Sidebar({ activeTab, onSelectTab, isConnected }: SidebarProps) {
  const items: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "connect", label: "Connect Device", icon: QrCode },
    { id: "camera", label: "Camera", icon: Camera },
    { id: "devices", label: "Devices", icon: Smartphone },
    { id: "connections", label: "Connections", icon: History },
    { id: "diagnostics", label: "Diagnostics", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help", icon: HelpCircle },
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-900">
        <div className="flex items-center gap-3 mb-1">
          <Image src="/logo.png" alt="MOBILE as WEBCAM" width={42} height={42} className="h-10 w-10 object-contain" />
          <span className="text-chrome font-black tracking-wide text-sm">MOBILE as WEBCAM</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
            }`}
          />
          <span>{isConnected ? "CONNECTED & STREAMING" : "NO DEVICE CONNECTED"}</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/80 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-emerald-400" : "text-zinc-400"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.id === "connect" && !isConnected && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 uppercase">
                  Pair
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footprint */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/60">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-500" />
            <span>Virtual Cam</span>
          </div>
          <span className="text-emerald-400 font-medium">Ready</span>
        </div>
        <div className="text-[10px] text-zinc-400 font-mono mt-1">
          Endpoint: Mobile AS Webcam
        </div>
      </div>
    </aside>
  );
}
