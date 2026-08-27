"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Camera,
  Video,
  VideoOff,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Sliders,
  Maximize,
  Radio,
} from "lucide-react";

function MobileWebcamContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const token = searchParams.get("token");

  // State
  const [computerName, setComputerName] = useState<string>("Windows PC");
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Camera & Stream State
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [resolution, setResolution] = useState<string>("720p");
  const [fps, setFps] = useState<number>(30);
  const [isMirrored, setIsMirrored] = useState(false);

  // WebRTC PeerConnection
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const signalingPollRef = useRef<NodeJS.Timeout | null>(null);

  // Browser Compatibility
  const [browserCapabilities, setBrowserCapabilities] = useState({
    webrtcSupported: false,
    getUserMediaSupported: false,
    isSecureContext: false,
  });

  useEffect(() => {
    // Audit browser media APIs
    const webrtc = typeof window !== "undefined" && "RTCPeerConnection" in window;
    const gum =
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      "getUserMedia" in navigator.mediaDevices;
    const secure = typeof window !== "undefined" ? window.isSecureContext : false;

    setBrowserCapabilities({
      webrtcSupported: webrtc,
      getUserMediaSupported: !!gum,
      isSecureContext: secure,
    });
  }, []);

  useEffect(() => {
    if (browserCapabilities.isSecureContext && browserCapabilities.getUserMediaSupported) return;
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setPermissionError("Camera access requires HTTPS. Open the deployed Vercel HTTPS link from the QR code.");
    } else if (!browserCapabilities.getUserMediaSupported) {
      setPermissionError("This browser does not support camera capture. Open the link in Chrome or Safari.");
    }
  }, [browserCapabilities]);

  // Validate session token with backend
  useEffect(() => {
    if (!sessionId || !token) {
      setIsSessionValid(false);
      setSessionError("No session or token provided in QR URL.");
      return;
    }

    fetch(`/api/pairing?id=${sessionId}&token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.session && data.session.status === "active") {
          setIsSessionValid(true);
          setComputerName(data.session.computerName || "Windows PC");

          // Mark session as paired
          fetch("/api/pairing", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              token,
              status: "paired",
              deviceName: getDeviceModel(),
              browser: getBrowserName(),
              platform: navigator.platform || "Mobile",
            }),
          });
        } else {
          setIsSessionValid(false);
          setSessionError(data.error || "Session has expired or is invalid.");
        }
      })
      .catch((e) => {
        setIsSessionValid(false);
        setSessionError("Failed to connect to Windows receiver.");
      });
  }, [sessionId, token]);

  // Request getUserMedia
  const startCamera = async (requestedFacingMode = facingMode, requestedResolution = resolution) => {
    setPermissionError(null);
    try {
      let width = 1280;
      let height = 720;
      if (requestedResolution === "360p") {
        width = 640;
        height = 360;
      } else if (requestedResolution === "480p") {
        width = 854;
        height = 480;
      } else if (requestedResolution === "1080p") {
        width = 1920;
        height = 1080;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: requestedFacingMode },
          width: { ideal: width },
          height: { ideal: height },
          frameRate: { ideal: fps },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setHasPermission(true);
      setIsStreaming(true);

      // Establish WebRTC PeerConnection
      initWebRTC(stream);
    } catch (err: any) {
      console.error("Camera permission error", err);
      setHasPermission(false);
      setPermissionError(
        err.message || "Camera permission denied or camera in use by another app."
      );
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (signalingPollRef.current) {
      clearInterval(signalingPollRef.current);
    }
    setIsStreaming(false);
  };

  const initWebRTC = async (stream: MediaStream) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          ...(process.env.NEXT_PUBLIC_TURN_URL
            ? [{
                urls: process.env.NEXT_PUBLIC_TURN_URL,
                username: process.env.NEXT_PUBLIC_TURN_USERNAME,
                credential: process.env.NEXT_PUBLIC_TURN_PASSWORD,
              }]
            : []),
        ],
      });
      peerConnectionRef.current = pc;

      // Add camera and mic tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && sessionId) {
          fetch("/api/signaling", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              sender: "mobile",
              type: "candidate",
              payload: event.candidate,
            }),
          });
        }
      };

      // Create SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Post offer to signaling API
      if (sessionId) {
        await fetch("/api/signaling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            sender: "mobile",
            type: "offer",
            payload: offer,
          }),
        });

        // Poll for desktop SDP Answer and Candidate responses
        let lastCheck = new Date().toISOString();
        signalingPollRef.current = setInterval(async () => {
          try {
            const res = await fetch(
              `/api/signaling?sessionId=${sessionId}&recipient=mobile&since=${lastCheck}`
            );
            const data = await res.json();
            if (data.success && data.messages) {
              for (const msg of data.messages) {
                lastCheck = msg.createdAt;
                if (msg.type === "answer") {
                  await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
                } else if (msg.type === "candidate") {
                  await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
                } else if (msg.type === "control") {
                  const command = msg.payload?.command;
                  const data = msg.payload?.data;
                  if (command === "switch_camera" && data?.facingMode) {
                    setFacingMode(data.facingMode);
                    const track = mediaStreamRef.current?.getVideoTracks()[0];
                    await track?.applyConstraints({ facingMode: { ideal: data.facingMode } });
                  } else if (command === "set_resolution" && data?.resolution) {
                    setResolution(data.resolution);
                    const dimensions: Record<string, { width: number; height: number }> = {
                      "360p": { width: 640, height: 360 },
                      "480p": { width: 854, height: 480 },
                      "720p": { width: 1280, height: 720 },
                      "1080p": { width: 1920, height: 1080 },
                    };
                    const size = dimensions[data.resolution];
                    if (size) await mediaStreamRef.current?.getVideoTracks()[0]?.applyConstraints(size);
                  } else if (command === "set_fps" && data?.fps) {
                    setFps(data.fps);
                    await mediaStreamRef.current?.getVideoTracks()[0]?.applyConstraints({ frameRate: { ideal: data.fps } });
                  }
                }
              }
            }
          } catch (e) {
            console.error("Signaling error", e);
          }
        }, 1000);
      }
    } catch (e) {
      console.error("Failed to initialize WebRTC PeerConnection", e);
    }
  };

  const switchCamera = async () => {
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
    if (isStreaming) {
      stopCamera();
      setTimeout(() => startCamera(nextFacing), 300);
    }
  };

  function getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome Mobile";
    if (ua.includes("Safari")) return "Safari Mobile";
    if (ua.includes("Firefox")) return "Firefox Mobile";
    if (ua.includes("Edg")) return "Edge Mobile";
    return "Mobile Web Browser";
  }

  function getDeviceModel() {
    const ua = navigator.userAgent;
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("iPad")) return "iPad";
    if (ua.includes("Android")) return "Android Phone";
    return "Mobile Device";
  }

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col justify-between p-4 sm:p-6 select-none font-sans">
      {/* Top Mobile Bar */}
      <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="pill-capsule px-2.5 py-0.5 rounded-full text-emerald-400 font-extrabold text-xs">
            Mobile
          </span>
          <span className="text-chrome font-black tracking-widest text-sm">AS</span>
          <span className="text-chrome-bright font-bold text-sm">Webcam</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isStreaming ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
            }`}
          />
          <span>{isStreaming ? "STREAMING" : "STANDBY"}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="my-auto py-4 space-y-6 max-w-md mx-auto w-full">
        {/* Session Error */}
        {isSessionValid === false && (
          <div className="p-6 rounded-2xl bg-zinc-950 border border-rose-500/30 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">QR Session Expired</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{sessionError}</p>
            <p className="text-[11px] text-zinc-500 font-mono">
              Scan a fresh QR code from your Windows screen to connect.
            </p>
          </div>
        )}

        {/* Valid Session Interface */}
        {isSessionValid === true && (
          <div className="space-y-4">
            {/* Connected Windows PC Badge */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-400">Paired Windows PC:</span>
              </div>
              <span className="font-bold text-white font-mono">{computerName}</span>
            </div>

            {/* Video Viewport */}
            <div className="relative w-full aspect-video bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.9)]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: isMirrored ? "scaleX(-1)" : "none" }}
              />

              {!isStreaming && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-zinc-950/90">
                  <Camera className="w-10 h-10 text-zinc-600" />
                  <div className="text-sm font-bold text-zinc-300">Camera Ready</div>
                  <p className="text-xs text-zinc-500">
                    Tap 'Start Camera Stream' to transmit HD video to Windows.
                  </p>
                </div>
              )}
            </div>

            {/* Permission Explanation */}
            {!hasPermission && !isStreaming && (
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Browser Privacy Request:</span>
                  <p className="text-zinc-400 mt-1 leading-relaxed">
                    When you tap 'Start Camera', your mobile browser will ask for camera permission. Select 'Allow'.
                  </p>
                </div>
              </div>
            )}

            {permissionError && !isStreaming && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                {permissionError}
              </div>
            )}

            {/* Stream Action Button */}
            {!isStreaming ? (
              <button
                onClick={() => startCamera()}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                <span>Start Camera Stream</span>
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="w-full py-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-bold text-base transition-all flex items-center justify-center gap-2"
              >
                <VideoOff className="w-5 h-5" />
                <span>Stop Stream</span>
              </button>
            )}

            {/* Camera Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={switchCamera}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-white flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Switch Camera ({facingMode === "user" ? "Front" : "Rear"})</span>
              </button>

              <button
                onClick={() => setIsMirrored(!isMirrored)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  isMirrored
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300"
                }`}
              >
                Mirror Video
              </button>
            </div>

            {/* Format Pickers */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-zinc-400 font-mono">
                <span>Resolution Target</span>
                <span className="text-emerald-400 font-bold">{resolution}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {["360p", "480p", "720p", "1080p"].map((res) => (
                  <button
                    key={res}
                    onClick={() => {
                      setResolution(res);
                      if (isStreaming) {
                        stopCamera();
                        setTimeout(() => startCamera(facingMode, res), 300);
                      }
                    }}
                    className={`py-1.5 rounded-lg text-[11px] font-bold border ${
                      resolution === res
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="w-full text-center text-[10px] text-zinc-500 font-mono pt-4 border-t border-zinc-900">
        Mobile AS Webcam • WebRTC Encrypted Channel
      </div>
    </div>
  );
}

export default function MobileWebcamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
          Loading Mobile Interface...
        </div>
      }
    >
      <MobileWebcamContent />
    </Suspense>
  );
}
