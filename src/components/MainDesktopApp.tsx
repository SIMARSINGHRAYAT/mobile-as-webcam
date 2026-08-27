"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  Smartphone, 
  Wifi, 
  QrCode, 
  Play, 
  StopCircle,
  Settings,
  Monitor,
  Video,
  Copy,
  Check
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function MainDesktopApp() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [deviceCode, setDeviceCode] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("waiting");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimestampRef = useRef<number>(0);

  const baseURL = typeof window !== "undefined" ? window.location.origin : "";
  const mobileUrl = `${baseURL}/mobile`;

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const createPairingSession = async () => {
    try {
      const response = await fetch("/api/pairing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.sessionId);
        setDeviceCode(data.deviceCode);
        startPolling(data.sessionId);
      }
    } catch (error) {
      console.error("Failed to create pairing session:", error);
    }
  };

  const startPolling = (sessionId: string) => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/signaling?sessionId=${sessionId}&lastTimestamp=${lastTimestampRef.current}`,
          { method: "GET" }
        );
        
        const data = await response.json();
        
        if (data.success && data.messages.length > 0) {
          lastTimestampRef.current = data.lastTimestamp;
          
          for (const message of data.messages) {
            if (message.from === "mobile") {
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
          from: "desktop",
          ...message,
        }),
      });
    } catch (error) {
      console.error("Failed to send signaling message:", error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });
      
      setLocalStream(stream);
      setStatus("camera_active");
      
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      
      peerConnectionRef.current = pc;
      
      // Add local tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Handle remote tracks
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        setIsConnected(true);
        setStatus("connected");
      };
      
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
      console.error("Failed to start camera:", error);
      setStatus("camera_error");
    }
  };

  const stopCamera = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setIsConnected(false);
    setStatus("waiting");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">MOBILE as WEBCAM</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            }`}>
              {isConnected ? "Connected" : "Waiting for device"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Connection */}
          <div className="space-y-6">
            {/* Connection Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                Connect Your Phone
              </h2>
              
              {!sessionId ? (
                <button
                  onClick={createPairingSession}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <QrCode className="w-5 h-5" />
                  Generate Pairing Code
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 flex justify-center">
                    <QRCodeSVG 
                      value={mobileUrl} 
                      size={180}
                      level="H"
                    />
                  </div>
                  
                  <div className="bg-black/30 rounded-xl p-4">
                    <p className="text-blue-200 text-sm mb-2">Or visit this URL on your phone:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-black/50 text-white px-3 py-2 rounded-lg text-sm truncate">
                        {mobileUrl}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-white font-semibold mb-2">Device Code: <span className="text-2xl text-blue-400">{deviceCode}</span></p>
                    <p className="text-blue-200 text-sm">Enter this code on your mobile device</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Camera className="w-6 h-6" />
                Camera Control
              </h2>
              
              <div className="space-y-4">
                {!localStream ? (
                  <button
                    onClick={startCamera}
                    disabled={!sessionId}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    Start Camera Stream
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <StopCircle className="w-5 h-5" />
                    Stop Camera Stream
                  </button>
                )}
                
                <div className="bg-black/30 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Status: <span className="text-blue-400 capitalize">{status.replace("_", " ")}</span></h3>
                  <p className="text-blue-200 text-sm">
                    {status === "waiting" && "Ready to connect"}
                    {status === "camera_active" && "Camera active, waiting for mobile connection..."}
                    {status === "connected" && "Successfully connected to mobile device!"}
                    {status === "camera_error" && "Camera access denied or failed"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Video Preview */}
          <div className="space-y-6">
            {/* Local Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Monitor className="w-6 h-6" />
                Desktop Preview
              </h2>
              
              <div className="aspect-video bg-black/50 rounded-xl overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!localStream && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-blue-200">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No camera active</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Remote Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                Mobile Feed
              </h2>
              
              <div className="aspect-video bg-black/50 rounded-xl overflow-hidden relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!remoteStream && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-blue-200">
                      <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Waiting for mobile connection...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-400/30">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Video className="w-5 h-5" />
                How to Use in Video Calls
              </h3>
              <ol className="space-y-2 text-blue-200 text-sm">
                <li>1. Keep this page open on your computer</li>
                <li>2. Connect your phone using the QR code or URL</li>
                <li>3. Start the camera stream</li>
                <li>4. In OBS Studio: Add &quot;Window Capture&quot; → Select this browser window</li>
                <li>5. In OBS: Click &quot;Start Virtual Camera&quot;</li>
                <li>6. In Google Meet/Zoom: Select &quot;OBS Virtual Camera&quot; as your camera</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
