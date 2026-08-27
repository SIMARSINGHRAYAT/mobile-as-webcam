"use client";

import React from "react";
import {
  Camera,
  Wifi,
  Shield,
  Lock,
  Video,
  Cloud,
  Cpu,
  Radio,
  Share2,
  Sliders,
} from "lucide-react";

export function FloatingTechSymbols() {
  const symbols = [
    { Icon: Camera, top: "12%", left: "10%", size: 48, delay: "0s", duration: "14s", rotate: "12deg" },
    { Icon: Wifi, top: "22%", left: "82%", size: 52, delay: "2s", duration: "16s", rotate: "-15deg" },
    { Icon: Shield, top: "68%", left: "12%", size: 44, delay: "1s", duration: "18s", rotate: "8deg" },
    { Icon: Lock, top: "78%", left: "85%", size: 40, delay: "3s", duration: "15s", rotate: "-10deg" },
    { Icon: Video, top: "15%", left: "48%", size: 36, delay: "4s", duration: "20s", rotate: "20deg" },
    { Icon: Cloud, top: "82%", left: "45%", size: 46, delay: "2.5s", duration: "17s", rotate: "-8deg" },
    { Icon: Cpu, top: "45%", left: "88%", size: 42, delay: "1.5s", duration: "19s", rotate: "15deg" },
    { Icon: Radio, top: "50%", left: "8%", size: 50, delay: "3.5s", duration: "13s", rotate: "-18deg" },
    { Icon: Share2, top: "35%", left: "18%", size: 34, delay: "0.5s", duration: "21s", rotate: "25deg" },
    { Icon: Sliders, top: "62%", left: "75%", size: 38, delay: "4.5s", duration: "16s", rotate: "-12deg" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Subtle ambient chrome radial spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-slate-800/20 via-slate-900/5 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Floating 3D metallic icons */}
      {symbols.map((item, i) => {
        const { Icon, top, left, size, delay, duration, rotate } = item;
        return (
          <div
            key={i}
            className="absolute transition-all ease-in-out opacity-20 hover:opacity-40 filter drop-shadow-[0_10px_15px_rgba(255,255,255,0.08)]"
            style={{
              top,
              left,
              animation: `float-slow ${duration} ease-in-out infinite alternate`,
              animationDelay: delay,
              transform: `rotate(${rotate})`,
            }}
          >
            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-zinc-800/40 via-zinc-900/60 to-black/80 border border-zinc-700/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] backdrop-blur-md">
              <Icon
                size={size}
                className="text-emerald-400 fill-emerald-400/20 stroke-[1.5] drop-shadow-[0_2px_8px_rgba(16,185,129,0.7)]"
              />
              {/* Metallic reflection highlight line */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-zinc-400/10 to-transparent pointer-events-none" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
