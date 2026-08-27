"use client";

import React, { useState } from "react";
import { ExternalLink, MonitorPlay, CheckCircle2 } from "lucide-react";

interface OBSBridgeTabProps {
  isConnected: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export function OBSBridgeTab({ isConnected, videoRef }: OBSBridgeTabProps) {
  const [status, setStatus] = useState("");

  const launchObs = async () => {
    if (!window.mobileAsWebcam) {
      setStatus("Open this page from the Windows application.");
      return;
    }
    const result = await window.mobileAsWebcam.launchObs();
    setStatus(result.success ? "OBS opened. Start Virtual Camera in OBS." : result.error || "OBS could not be opened.");
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="p-6 rounded-2xl bg-zinc-950 border border-emerald-500/30">
        <div className="flex items-center gap-3 text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
          <h1 className="text-2xl font-black">Connection Established</h1>
        </div>
        <p className="mt-2 text-sm text-zinc-300">
          Your phone is connected and the camera stream is ready for OBS Virtual Camera.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isConnected ? "LIVE PHONE CAMERA PREVIEW" : "WAITING FOR PHONE"}</span>
          </div>
          <div className="aspect-video rounded-xl bg-black border border-zinc-800 overflow-hidden flex items-center justify-center">
            {isConnected ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
            ) : (
              <span className="text-sm text-zinc-500">Pair your phone to start the preview.</span>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <MonitorPlay className="w-8 h-8 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">OBS Virtual Camera</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Open OBS, capture this app window, then start OBS Virtual Camera. Select it in Google Meet.
          </p>
          <button onClick={launchObs} className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 flex items-center justify-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Start OBS Bridge
          </button>
          {status && <p className="text-xs text-emerald-300">{status}</p>}
        </div>
      </div>
    </div>
  );
}