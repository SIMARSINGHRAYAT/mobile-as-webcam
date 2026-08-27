"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  CheckCircle2,
  Activity,
  ShieldCheck,
} from "lucide-react";

interface MicrophoneTabProps {
  isConnected: boolean;
  audioActive?: boolean;
  audioLevel?: number; // 0 to 100
  onToggleMute?: () => void;
}

export function MicrophoneTab({
  isConnected,
  audioActive = true,
  audioLevel = 0,
  onToggleMute,
}: MicrophoneTabProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [gain, setGain] = useState<number>(100);
  const [sampleRate] = useState<string>("48,000 Hz");
  const [channels] = useState<string>("Stereo (2 Channels)");

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (onToggleMute) onToggleMute();
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Microphone Audio Endpoint</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time audio input routing via WebRTC Opus / PCM into Windows applications.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
          <Radio className="w-4 h-4" />
          <span>Mobile AS Microphone Endpoint Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Audio Meter Card (Left) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl ${
                  isMuted
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isMuted ? "Microphone Muted" : "Microphone Audio Live"}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Codec: Opus 48kHz • Latency: &lt;15ms
                </p>
              </div>
            </div>

            <button
              onClick={handleMuteToggle}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                isMuted
                  ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30"
              }`}
            >
              {isMuted ? (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Unmute Microphone</span>
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Mute Audio</span>
                </>
              )}
            </button>
          </div>

          {/* Real Audio VU Level Meter */}
          <div className="space-y-3 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 font-bold uppercase">Real-Time Input Level</span>
              <span className="text-emerald-400 font-bold">
                {isConnected && !isMuted ? `${audioLevel}%` : "0% (Inactive)"}
              </span>
            </div>

            <div className="h-6 w-full bg-zinc-950 rounded-xl p-1 border border-zinc-800 flex items-center gap-1">
              {Array.from({ length: 30 }).map((_, i) => {
                const step = (i + 1) * (100 / 30);
                const isActive = isConnected && !isMuted && audioLevel >= step;
                const isWarning = step > 75;
                const isDanger = step > 90;

                let color = "bg-emerald-500";
                if (isDanger) color = "bg-rose-500";
                else if (isWarning) color = "bg-amber-400";

                return (
                  <div
                    key={i}
                    className={`h-full flex-1 rounded-sm transition-all duration-75 ${
                      isActive ? color : "bg-zinc-850 opacity-20"
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>-60 dB</span>
              <span>-36 dB</span>
              <span>-18 dB</span>
              <span>-6 dB</span>
              <span>0 dB</span>
            </div>
          </div>

          {/* Gain Slider */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="font-semibold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> Input Digital Gain
              </span>
              <span className="font-mono text-emerald-400 font-bold">{gain}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-zinc-950 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Audio Specifications (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
              Audio Driver Properties
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Windows Audio Endpoint:</span>
                <span className="text-white font-mono font-bold">Mobile AS Microphone</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Sample Rate:</span>
                <span className="text-emerald-400 font-mono font-bold">{sampleRate}</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Audio Channels:</span>
                <span className="text-zinc-300 font-mono">{channels}</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Buffer Size:</span>
                <span className="text-zinc-300 font-mono">128 samples (~2.6ms)</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">A/V Sync Offset:</span>
                <span className="text-emerald-400 font-mono font-bold">0 ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
