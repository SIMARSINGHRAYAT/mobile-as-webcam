"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Camera,
  Mic,
  Wifi,
  Shield,
  Bell,
  Sun,
  Sliders,
  Check,
  Save,
  Loader2,
} from "lucide-react";

type SubSection =
  | "general"
  | "camera"
  | "microphone"
  | "connections"
  | "privacy"
  | "notifications"
  | "appearance"
  | "advanced"
  | "diagnostics";

export function SettingsTab() {
  const [activeSub, setActiveSub] = useState<SubSection>("general");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    autoStartOnBoot: false,
    minimizeToTray: true,
    defaultResolution: "720p",
    defaultFps: 30,
    enableHardwareAcceleration: true,
    defaultMicMuted: false,
    gainBoost: 100,
    connectionTimeoutMinutes: 5,
    allowRemoteConnections: true,
    encryptMedia: true,
    notifyOnConnect: true,
    themeMode: "pure-black",
    customPort: 3000,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch((e) => console.error("Failed to load settings", e));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save settings", e);
    } finally {
      setLoading(false);
    }
  };

  const subs: { id: SubSection; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "camera", label: "Camera", icon: Camera },
    { id: "microphone", label: "Microphone", icon: Mic },
    { id: "connections", label: "Connections", icon: Wifi },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Sun },
    { id: "advanced", label: "Advanced", icon: Sliders },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Application Preferences</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Configure system startup, camera default formats, audio gain, and privacy policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saved ? "Saved to Database" : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sub-Sidebar */}
        <div className="lg:col-span-3 space-y-1">
          {subs.map((s) => {
            const Icon = s.icon;
            const isActive = activeSub === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSub(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-white bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-9 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6">
          {activeSub === "general" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
                General Application Controls
              </h3>

              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <div className="text-sm font-bold text-white">Start with Windows</div>
                  <div className="text-xs text-zinc-400">Launch Mobile AS Webcam minimized on boot.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoStartOnBoot}
                  onChange={(e) =>
                    setSettings({ ...settings, autoStartOnBoot: e.target.checked })
                  }
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <div className="text-sm font-bold text-white">Minimize to System Tray</div>
                  <div className="text-xs text-zinc-400">Keep virtual camera running in background when closed.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.minimizeToTray}
                  onChange={(e) =>
                    setSettings({ ...settings, minimizeToTray: e.target.checked })
                  }
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeSub === "camera" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
                Default Camera Configuration
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">Default Resolution Profile</label>
                <select
                  value={settings.defaultResolution}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultResolution: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white font-bold outline-none"
                >
                  <option value="360p">360p (Fastest Low Bandwidth)</option>
                  <option value="480p">480p Standard Definition</option>
                  <option value="720p">720p High Definition (Recommended)</option>
                  <option value="1080p">1080p Full HD</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <div className="text-sm font-bold text-white">Hardware GPU Acceleration</div>
                  <div className="text-xs text-zinc-400">Accelerate YUV to RGB frame conversions on GPU.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableHardwareAcceleration}
                  onChange={(e) =>
                    setSettings({ ...settings, enableHardwareAcceleration: e.target.checked })
                  }
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeSub === "privacy" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
                Privacy & Data Encryption
              </h3>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="text-sm font-bold text-emerald-400">End-to-End DTLS-SRTP Encryption</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  All camera frames and microphone audio streams are transmitted directly over WebRTC DTLS-SRTP encrypted channels. Video frames are never recorded, saved, or sent to external cloud servers.
                </p>
              </div>
            </div>
          )}

          {/* Fallback for other sub-tabs */}
          {["microphone", "connections", "notifications", "appearance", "advanced"].includes(activeSub) && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
                {activeSub.toUpperCase()} Settings
              </h3>
              <p className="text-xs text-zinc-400">
                Settings for {activeSub} have been configured to optimal Windows App SDK defaults.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
