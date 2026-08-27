"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, MonitorPlay, CheckCircle2, Download, Play, Settings } from "lucide-react";

interface OBSBridgeTabProps {
  isConnected: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export function OBSBridgeTab({ isConnected, videoRef }: OBSBridgeTabProps) {
  const [status, setStatus] = useState("");
  const [videoAspectRatio, setVideoAspectRatio] = useState("16 / 9");
  const [virtualCameraInstalled, setVirtualCameraInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState("");

  useEffect(() => {
    if (window.mobileAsWebcam?.checkVirtualCamera) {
      window.mobileAsWebcam.checkVirtualCamera().then((result) => {
        setVirtualCameraInstalled(result.installed);
      });
    }
  }, []);

  const handleVideoMetadata = () => {
    const video = videoRef?.current;
    if (video?.videoWidth && video.videoHeight) {
      setVideoAspectRatio(`${video.videoWidth} / ${video.videoHeight}`);
    }
  };

  const launchObs = async () => {
    if (!window.mobileAsWebcam) {
      setStatus("Open this page from the Windows application.");
      return;
    }
    const result = await window.mobileAsWebcam.launchObs();
    setStatus(result.success ? "OBS opened. Start Virtual Camera in OBS." : result.error || "OBS could not be opened.");
  };

  const installVirtualCamera = async () => {
    if (!window.mobileAsWebcam) {
      setInstallStatus("Open this page from the Windows application.");
      return;
    }
    setInstalling(true);
    setInstallStatus("Downloading and installing Unity Capture virtual camera driver...");
    
    try {
      const result = await window.mobileAsWebcam.installVirtualCamera();
      if (result.success) {
        setInstallStatus("Installation successful! Please restart the app to use the virtual camera.");
        setVirtualCameraInstalled(true);
      } else {
        setInstallStatus(result.error || "Installation failed.");
      }
    } catch (err) {
      setInstallStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setInstalling(false);
    }
  };

  const launchVirtualCameraConfig = async () => {
    if (!window.mobileAsWebcam) {
      setInstallStatus("Open this page from the Windows application.");
      return;
    }
    const result = await window.mobileAsWebcam.launchVirtualCameraApp();
    setInstallStatus(result.success ? "Virtual Camera configuration tool opened." : result.error || "Could not open configuration tool.");
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="p-6 rounded-2xl bg-zinc-950 border border-emerald-500/30">
        <div className="flex items-center gap-3 text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
          <h1 className="text-2xl font-black">Connection Established</h1>
        </div>
        <p className="mt-2 text-sm text-zinc-300">
          Your phone is connected and the camera stream is ready.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isConnected ? "LIVE PHONE CAMERA PREVIEW" : "WAITING FOR PHONE"}</span>
          </div>
          <div className="max-h-[70vh] rounded-xl bg-black border border-zinc-800 overflow-hidden flex items-center justify-center">
            {isConnected ? (
              <video ref={videoRef} autoPlay playsInline muted onLoadedMetadata={handleVideoMetadata} className="w-full h-full object-contain" style={{ aspectRatio: videoAspectRatio }} />
            ) : (
              <span className="text-sm text-zinc-500">Pair your phone to start the preview.</span>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <MonitorPlay className="w-8 h-8 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Virtual Camera Options</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Unity Capture Driver</span>
                {virtualCameraInstalled && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Installed</span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mb-3">
                Native Windows virtual camera driver. Works with Zoom, Teams, Google Meet without OBS.
              </p>
              
              {!virtualCameraInstalled ? (
                <button 
                  onClick={installVirtualCamera} 
                  disabled={installing}
                  className="w-full px-4 py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {installing ? "Installing..." : "Install Virtual Camera"}
                </button>
              ) : (
                <button 
                  onClick={launchVirtualCameraConfig}
                  className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configure Virtual Camera
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 px-2 text-zinc-500">Alternative</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">OBS Virtual Camera</span>
              </div>
              <p className="text-xs text-zinc-400 mb-3">
                Use OBS Studio as a bridge. Requires OBS to be installed.
              </p>
              <button onClick={launchObs} className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white font-bold text-sm hover:bg-zinc-700 flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Launch OBS Studio
              </button>
            </div>
          </div>

          {(installStatus || status) && (
            <p className="text-xs text-emerald-300">{installStatus || status}</p>
          )}
        </div>
      </div>
    </div>
  );
}