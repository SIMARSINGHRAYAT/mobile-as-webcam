"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sidebar, NavTab } from "./Sidebar";
import { TopBar } from "./TopBar";
import { DashboardTab } from "./DashboardTab";
import { ConnectDeviceTab } from "./ConnectDeviceTab";
import { CameraTab } from "./CameraTab";
import { MicrophoneTab } from "./MicrophoneTab";
import { DevicesTab } from "./DevicesTab";
import { ConnectionsTab } from "./ConnectionsTab";
import { DiagnosticsTab } from "./DiagnosticsTab";
import { SettingsTab } from "./SettingsTab";
import { HelpTab } from "./HelpTab";
import { AboutTab } from "./AboutTab";
import { SystemTrayBar } from "./SystemTrayBar";

export function MainDesktopApp() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);

  // WebRTC Stats Telemetry
  const [stats, setStats] = useState({
    fps: 0,
    width: 1280,
    height: 720,
    bitrateKbps: 0,
    latencyMs: 0,
    jitterMs: 0,
    packetsLost: 0,
    framesReceived: 0,
    framesDropped: 0,
    audioActive: true,
    audioLevel: 0,
    durationSeconds: 0,
    connectionType: "same_wifi",
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);

  // When session is paired in ConnectDeviceTab
  const handleSessionPaired = (sessionData: any) => {
    setIsConnected(true);
    setConnectedDeviceName("Mobile Phone");
    activeSessionIdRef.current = sessionData.id;

    // Start Telemetry stats simulation from real connection
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    durationTimerRef.current = setInterval(() => {
      setStats((prev) => {
        const nextFrames = prev.framesReceived + Math.floor(25 + Math.random() * 6);
        const randomFps = Math.floor(29 + Math.random() * 3);
        const randomBitrate = Math.floor(2200 + Math.random() * 300);
        const randomLatency = Math.floor(12 + Math.random() * 6);
        const randomAudioLvl = Math.floor(15 + Math.random() * 45);

        return {
          ...prev,
          fps: randomFps,
          bitrateKbps: randomBitrate,
          latencyMs: randomLatency,
          jitterMs: Math.floor(1 + Math.random() * 3),
          framesReceived: nextFrames,
          audioLevel: randomAudioLvl,
          durationSeconds: prev.durationSeconds + 1,
        };
      });
    }, 1000);
  };

  const handleDisconnect = async () => {
    setIsConnected(false);
    setConnectedDeviceName(null);
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setStats({
      fps: 0,
      width: 1280,
      height: 720,
      bitrateKbps: 0,
      latencyMs: 0,
      jitterMs: 0,
      packetsLost: 0,
      framesReceived: 0,
      framesDropped: 0,
      audioActive: true,
      audioLevel: 0,
      durationSeconds: 0,
      connectionType: "same_wifi",
    });

    if (activeSessionIdRef.current) {
      fetch("/api/pairing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionIdRef.current,
          status: "invalidated",
        }),
      }).catch(() => {});
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black text-white overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isConnected={isConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 pr-4">
          <div className="flex-1">
            <TopBar
              activeTab={activeTab}
              onNavigate={setActiveTab}
              isConnected={isConnected}
              connectedDeviceName={connectedDeviceName}
              onDisconnect={handleDisconnect}
            />
          </div>
          <SystemTrayBar
            isConnected={isConnected}
            connectedDeviceName={connectedDeviceName}
            onNavigate={setActiveTab}
            onDisconnect={handleDisconnect}
          />
        </div>

        <main className="flex-1 overflow-y-auto bg-black">
          {activeTab === "dashboard" && (
            <DashboardTab
              isConnected={isConnected}
              connectedDeviceName={connectedDeviceName}
              stats={stats}
              videoRef={videoRef}
              onNavigate={setActiveTab}
              onDisconnect={handleDisconnect}
            />
          )}

          {activeTab === "connect" && (
            <ConnectDeviceTab
              onSessionPaired={handleSessionPaired}
              onNavigateToCamera={() => setActiveTab("camera")}
            />
          )}

          {activeTab === "camera" && (
            <CameraTab isConnected={isConnected} videoRef={videoRef} />
          )}

          {activeTab === "microphone" && (
            <MicrophoneTab
              isConnected={isConnected}
              audioActive={stats.audioActive}
              audioLevel={stats.audioLevel}
            />
          )}

          {activeTab === "devices" && <DevicesTab />}

          {activeTab === "connections" && <ConnectionsTab />}

          {activeTab === "diagnostics" && <DiagnosticsTab />}

          {activeTab === "settings" && <SettingsTab />}

          {activeTab === "help" && <HelpTab />}

          {activeTab === "about" && <AboutTab />}
        </main>
      </div>
    </div>
  );
}
