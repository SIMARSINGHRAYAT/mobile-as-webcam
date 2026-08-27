"use client";

import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  QrCode,
  Clock,
  Wifi,
  Usb,
  Globe,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  ExternalLink,
} from "lucide-react";

interface PairingSessionData {
  id: string;
  token: string;
  computerName: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  expirationMinutes: number;
  connectionType: string;
  publicHost?: string | null;
}

interface ConnectDeviceTabProps {
  onSessionPaired?: (session: PairingSessionData) => void;
  onNavigateToCamera?: () => void;
}

export function ConnectDeviceTab({
  onSessionPaired,
  onNavigateToCamera,
}: ConnectDeviceTabProps) {
  const [session, setSession] = useState<PairingSessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expirationMinutes, setExpirationMinutes] = useState<number>(5);
  const [connectionType, setConnectionType] = useState<string>("same_wifi");
  const [timeLeftStr, setTimeLeftStr] = useState<string>("00:00");
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileUrl, setMobileUrl] = useState<string>("");

  // Timestamps
  const [timestamps, setTimestamps] = useState<{
    sessionCreated: string | null;
    phoneConnected: string | null;
    cameraStarted: string | null;
  }>({
    sessionCreated: null,
    phoneConnected: null,
    cameraStarted: null,
  });

  const createNewSession = async (mins = expirationMinutes, type = connectionType) => {
    setLoading(true);
    setIsExpired(false);
    try {
      const res = await fetch("/api/pairing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expirationMinutes: mins,
          connectionType: type,
          computerName: "WIN-DESKTOP-802",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.session);
        const origin = data.session.publicHost
          ? `http://${data.session.publicHost}:3000`
          : window.location.origin;
        const fullUrl = `${origin}/mobile?session=${data.session.id}&token=${data.session.token}`;
        setMobileUrl(fullUrl);

        const createdDate = new Date(data.session.createdAt);
        setTimestamps((prev) => ({
          ...prev,
          sessionCreated: createdDate.toLocaleTimeString(),
        }));
      }
    } catch (e) {
      console.error("Failed to create pairing session", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createNewSession();
  }, []);

  // Server time based countdown
  useEffect(() => {
    if (!session || session.status !== "active") return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(session.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeftStr("00:00");
        setIsExpired(true);
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(
          `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Session status polling to check if phone has scanned and paired
  useEffect(() => {
    if (!session || isExpired) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pairing?id=${session.id}`);
        const data = await res.json();
        if (data.success && data.session) {
          if (data.session.status === "paired") {
            setSession(data.session);
            const nowTime = new Date().toLocaleTimeString();
            setTimestamps((prev) => ({
              ...prev,
              phoneConnected: prev.phoneConnected || nowTime,
              cameraStarted: prev.cameraStarted || nowTime,
            }));
            if (onSessionPaired) onSessionPaired(data.session);
            clearInterval(pollInterval);
          }
        }
      } catch (e) {
        console.error("Error polling session state", e);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [session, isExpired]);

  const copyUrl = () => {
    if (!mobileUrl) return;
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Title & Connection Mode Bar */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Connect Device</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Generate a secure temporary pairing QR code for phone mobile browsers.
          </p>
        </div>

        {/* Expiration selector */}
        <div className="flex items-center gap-3 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium px-2">QR Duration:</span>
          {[1, 5, 10, 30].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                setExpirationMinutes(mins);
                createNewSession(mins, connectionType);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                expirationMinutes === mins
                  ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* QR Code Container (Left) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-between space-y-6">
          <div className="w-full flex items-center justify-between border-b border-zinc-900 pb-3">
            <span className="text-xs uppercase tracking-wider font-mono text-zinc-400">
              Temporary Pairing QR
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {isExpired ? (
                  <span className="text-rose-400 font-bold">Expired</span>
                ) : (
                  `Expires in ${timeLeftStr}`
                )}
              </span>
            </div>
          </div>

          {/* QR Code Canvas */}
          <div className="relative p-6 rounded-2xl bg-white flex flex-col items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            {loading ? (
              <div className="w-64 h-64 flex items-center justify-center text-zinc-800 font-bold">
                Generating Token...
              </div>
            ) : isExpired ? (
              <div className="w-64 h-64 flex flex-col items-center justify-center text-zinc-800 text-center space-y-3 p-4">
                <Clock className="w-12 h-12 text-rose-500" />
                <span className="text-sm font-bold text-zinc-900">QR Session Expired</span>
                <button
                  onClick={() => createNewSession()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all"
                >
                  Generate New QR
                </button>
              </div>
            ) : (
              <QRCodeCanvas
                value={mobileUrl}
                size={240}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            )}
          </div>

          {/* Controls below QR */}
          <div className="w-full space-y-3">
            <button
              onClick={() => createNewSession()}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs border border-zinc-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Pairing QR Code</span>
            </button>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
              <input
                type="text"
                readOnly
                value={mobileUrl}
                className="flex-1 bg-transparent text-zinc-400 font-mono text-[11px] truncate outline-none"
              />
              <button
                onClick={copyUrl}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                title="Copy Webpage Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Connection Options & Event Timestamps (Right) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Connection Modes */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
              Select Connection Mode
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setConnectionType("same_wifi");
                  createNewSession(expirationMinutes, "same_wifi");
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  connectionType === "same_wifi"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <Wifi className="w-5 h-5 mb-2" />
                <div className="text-sm font-bold text-white">Same Wi-Fi</div>
                <div className="text-[11px] text-zinc-400 mt-1">Direct local P2P stream</div>
              </button>

              <button
                onClick={() => {
                  setConnectionType("usb_tether");
                  createNewSession(expirationMinutes, "usb_tether");
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  connectionType === "usb_tether"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <Usb className="w-5 h-5 mb-2" />
                <div className="text-sm font-bold text-white">USB Tethered</div>
                <div className="text-[11px] text-zinc-400 mt-1">Network interface via USB</div>
              </button>

              <button
                onClick={() => {
                  setConnectionType("remote_internet");
                  createNewSession(expirationMinutes, "remote_internet");
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  connectionType === "remote_internet"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <Globe className="w-5 h-5 mb-2" />
                <div className="text-sm font-bold text-white">Remote Internet</div>
                <div className="text-[11px] text-zinc-400 mt-1">WebRTC STUN/TURN fallback</div>
              </button>
            </div>
          </div>

          {/* Genuine Connection Timestamps */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
              Session Timestamps & Audit Log
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Pairing session created:</span>
                <span className="text-emerald-400 font-bold">
                  {timestamps.sessionCreated || "Not initialized"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Phone connected:</span>
                <span className={timestamps.phoneConnected ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                  {timestamps.phoneConnected || "Waiting for phone scan..."}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Camera started:</span>
                <span className={timestamps.cameraStarted ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                  {timestamps.cameraStarted || "Waiting for user start..."}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Simulation Link for Sandbox Testing */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-400">
              <Smartphone className="w-4 h-4" />
              <span>Test mobile browser pairing page in a new browser window:</span>
            </div>
            {mobileUrl && (
              <a
                href={mobileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold flex items-center gap-1 hover:bg-emerald-400 transition-all"
              >
                <span>Open Mobile Interface</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
