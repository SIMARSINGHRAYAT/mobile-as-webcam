"use client";

import React, { useState } from "react";
import {
  Camera,
  Maximize2,
  RefreshCw,
  Sliders,
  Video,
  MonitorCheck,
  RotateCw,
  Sun,
  Contrast,
  Zap,
} from "lucide-react";

declare global {
  interface Window {
    mobileAsWebcam?: {
      launchObs: () => Promise<{ success: boolean; error?: string }>;
    };
  }
}

interface CameraTabProps {
  isConnected: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onSendControlCommand?: (type: string, data: any) => void;
}

export function CameraTab({
  isConnected,
  videoRef,
  onSendControlCommand,
}: CameraTabProps) {
  const [resolution, setResolution] = useState<string>("720p");
  const [fps, setFps] = useState<number>(30);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isMirrored, setIsMirrored] = useState(false);
  const [orientation, setOrientation] = useState<string>("landscape");
  
  // Filter adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [obsStatus, setObsStatus] = useState<string>("");
  const [videoAspectRatio, setVideoAspectRatio] = useState("16 / 9");

  const handleVideoMetadata = () => {
    const video = videoRef?.current;
    if (video?.videoWidth && video.videoHeight) {
      setVideoAspectRatio(`${video.videoWidth} / ${video.videoHeight}`);
    }
  };

  const launchObs = async () => {
    if (!window.mobileAsWebcam) {
      setObsStatus("OBS launch is available in the Windows app.");
      return;
    }
    const result = await window.mobileAsWebcam.launchObs();
    setObsStatus(result.success ? "OBS opened. Start Virtual Camera there." : result.error || "Unable to open OBS.");
  };

  const handleResolutionChange = (res: string) => {
    setResolution(res);
    if (onSendControlCommand) {
      onSendControlCommand("set_resolution", { resolution: res });
    }
  };

  const handleFpsChange = (targetFps: number) => {
    setFps(targetFps);
    if (onSendControlCommand) {
      onSendControlCommand("set_fps", { fps: targetFps });
    }
  };

  const handleSwitchCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    if (onSendControlCommand) {
      onSendControlCommand("switch_camera", { facingMode: nextMode });
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Camera Pipeline</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time phone camera preview & Windows Virtual Camera output settings.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
          <MonitorCheck className="w-4 h-4" />
          <span>MOBILE as WEBCAM Endpoint Active</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
        <div className="text-xs text-emerald-200">Send this preview to Google Meet through OBS Virtual Camera.</div>
        <button onClick={launchObs} className="shrink-0 px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400">
          Start OBS Bridge
        </button>
        {obsStatus && <span className="text-xs text-emerald-300">{obsStatus}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Stream Viewport (Left) */}
        <div className="lg:col-span-8 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between px-2 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-2 text-white font-bold">
              <Camera className="w-4 h-4 text-emerald-400" />
              Live Camera Feed
            </span>
            <span>
              Target: {resolution} @ {fps} FPS • {facingMode === "user" ? "Front" : "Rear"} Camera
            </span>
          </div>

          <div className="relative w-full max-h-[70vh] bg-black rounded-xl border border-zinc-800 overflow-hidden flex items-center justify-center">
            {isConnected ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={handleVideoMetadata}
                className="w-full h-full object-contain transition-all"
                style={{
                  aspectRatio: videoAspectRatio,
                  transform: isMirrored ? "scaleX(-1)" : "none",
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 text-zinc-500">
                <Video className="w-12 h-12 text-zinc-600" />
                <div className="text-sm font-bold text-zinc-400">No Stream Active</div>
                <div className="text-xs text-zinc-500 max-w-xs">
                  Connect a phone browser from the 'Connect Device' tab to start streaming video.
                </div>
              </div>
            )}
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSwitchCamera}
                disabled={!isConnected}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Switch Camera ({facingMode === "user" ? "Front" : "Rear"})</span>
              </button>

              <button
                onClick={() => setIsMirrored(!isMirrored)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isMirrored
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                Mirror Video
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono">Format:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 text-xs font-mono font-bold">
                NV12 / YUV420
              </span>
            </div>
          </div>
        </div>

        {/* Video Adjustments & Controls (Right) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stream Configuration */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
              Stream Settings
            </h3>

            {/* Resolution Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Target Resolution</label>
              <div className="grid grid-cols-2 gap-2">
                {["360p", "480p", "720p", "1080p"].map((res) => (
                  <button
                    key={res}
                    onClick={() => handleResolutionChange(res)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      resolution === res
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* FPS Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Target Frame Rate</label>
              <div className="grid grid-cols-3 gap-2">
                {[24, 30, 60].map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFpsChange(f)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      fps === f
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {f} FPS
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color & Image Filters */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
              Image Adjustments
            </h3>

            {/* Brightness */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-emerald-400" /> Brightness
                </span>
                <span className="font-mono text-white">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-emerald-400" /> Contrast
                </span>
                <span className="font-mono text-white">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Saturation
                </span>
                <span className="font-mono text-white">{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-900 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                setBrightness(100);
                setContrast(100);
                setSaturation(100);
              }}
              className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold border border-zinc-800"
            >
              Reset Image Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
