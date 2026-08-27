"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Video, VideoOff, RefreshCw, AlertCircle, Wifi, CheckCircle } from "lucide-react";

export default function MobilePage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [deviceCode, setDeviceCode] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [status, setStatus] = useState("idle");

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimestampRef = useRef<number>(0);

  // Auto-detect session from URL params or prompt for manual entry
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get("session");
    
    if (sessionParam) {
      setSessionId(sessionParam);
      // Auto-connect if session provided in URL
      connectToDevice(sessionParam);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const connectToDevice = async (session: string) => {
    try {
      setStatus("connecting");
      
      // Verify session exists
      const response = await fetch(`/api/pairing?sessionId=${session}`);
      const data = await response.json();
      
      if (data.success) {
        setSessionId(session);
        startPolling(session);
        setStatus("connected");
        setIsConnected(true);
      } else {
        setStatus("error");
        setPermissionError("Invalid or expired session code");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setStatus("error");
      setPermissionError("Failed to connect to desktop");
    }
  };

  const startPolling = (session: string) => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/signaling?sessionId=${session}&lastTimestamp=${lastTimestampRef.current}`,
          { method: "GET" }
        );
        
        const data = await response.json();
        
        if (data.success && data.messages.length > 0) {
          lastTimestampRef.current = data.lastTimestamp;
          
          for (const message of data.messages) {
            if (message.from === "desktop") {
              await handleSignalingMessage(message);
            }
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 1000);
  };

  const handleSignalingMessage = async (message: any) => {
    if (!peerConnectionRef.current) return;
    
    const { type, data } = message;
    
    if (type === "offer") {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      await sendSignalingMessage({
        type: "answer",
        data: answer,
      });
    } else if (type === "answer") {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data));
    } else if (type === "candidate") {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data));
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    }
  };

  const sendSignalingMessage = async (message: any) => {
    if (!sessionId) return;
    
    try {
      await fetch("/api/signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          from: "mobile",
          ...message,
        }),
      });
    } catch (error) {
      console.error("Failed to send signaling message:", error);
    }
  };

  const startCamera = async () => {
    try {
      setPermissionError(null);
      setStatus("requesting_permission");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });
      
      mediaStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setHasPermission(true);
      setIsStreaming(true);
      setStatus("streaming");
      
      // Initialize WebRTC
      initWebRTC(stream);
    } catch (error: any) {
      console.error("Camera error:", error);
      setHasPermission(false);
      setPermissionError(error.message || "Camera access denied");
      setStatus("permission_denied");
    }
  };

  const initWebRTC = async (stream: MediaStream) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      
      peerConnectionRef.current = pc;
      
      // Add tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingMessage({
            type: "candidate",
            data: event.candidate,
          });
        }
      };
      
      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      await sendSignalingMessage({
        type: "offer",
        data: offer,
      });
    } catch (error) {
      console.error("WebRTC initialization error:", error);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    setIsStreaming(false);
    setStatus("stopped");
  };

  const switchCamera = async () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    
    if (isStreaming && mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        mediaStreamRef.current.removeTrack(videoTrack);
        
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: nextMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        
        const newTrack = newStream.getVideoTracks()[0];
        mediaStreamRef.current.addTrack(newTrack);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStreamRef.current;
        }
        
        // Restart WebRTC with new track
        if (peerConnectionRef.current) {
          peerConnectionRef.current.getSenders().forEach(sender => {
            if (sender.track?.kind === "video") {
              sender.replaceTrack(newTrack);
            }
          });
        }
      }
    }
  };

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (deviceCode.length >= 6) {
      // In a real app, you'd look up the session by device code
      // For demo, we'll just use it as session ID
      connectToDevice(`session_${deviceCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm">MOBILE as WEBCAM</span>
        </div>
        <div className={`flex items-center gap-2 text-xs ${
          isStreaming ? "text-green-400" : "text-yellow-400"
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isStreaming ? "bg-green-500 animate-pulse" : "bg-yellow-500"
          }`} />
          <span>{isStreaming ? "STREAMING" : "READY"}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 gap-4 max-w-md mx-auto w-full">
        {/* Connection Status */}
        {!isConnected ? (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">Connect to Desktop</h2>
            
            <form onSubmit={handleSubmitCode} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Enter Device Code from Desktop
                </label>
                <input
                  type="text"
                  value={deviceCode}
                  onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest uppercase focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <button
                type="submit"
                disabled={deviceCode.length < 6}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 disabled:from-zinc-700 disabled:to-zinc-800 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
              >
                Connect
              </button>
            </form>
            
            <div className="text-center">
              <p className="text-zinc-500 text-sm">Or scan QR code from desktop</p>
            </div>
          </div>
        ) : (
          <>
            {/* Video Preview */}
            <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-zinc-400">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Tap Start to begin streaming</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-3">
              {!isStreaming ? (
                <button
                  onClick={startCamera}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3"
                >
                  <Video className="w-5 h-5" />
                  Start Camera Stream
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3"
                >
                  <VideoOff className="w-5 h-5" />
                  Stop Stream
                </button>
              )}

              {isStreaming && (
                <button
                  onClick={switchCamera}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-5 h-5" />
                  Switch Camera
                </button>
              )}
            </div>

            {/* Status Info */}
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-zinc-300">
                  {status === "streaming" ? "Connected & Streaming" : status}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Keep this page open while using your phone as a webcam
              </p>
            </div>

            {permissionError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{permissionError}</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-zinc-600 text-xs border-t border-zinc-800">
        <p>Point your phone camera at the screen to use as webcam</p>
      </footer>
    </div>
  );
}
