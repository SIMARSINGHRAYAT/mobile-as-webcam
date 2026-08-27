"use client";

import React from "react";
import {
  Smartphone,
  QrCode,
  ShieldCheck,
  Wifi,
  Video,
  MonitorCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface HowToUsePageProps {
  onContinue: () => void;
}

export function HowToUsePage({ onContinue }: HowToUsePageProps) {
  const steps = [
    {
      num: 1,
      title: "Open Phone Browser",
      desc: "Open the Mobile AS Webcam web page on your phone browser (Chrome, Safari, Edge, Firefox). No mobile app download or installation required.",
      icon: Smartphone,
    },
    {
      num: 2,
      title: "Scan QR Code",
      desc: "Scan the secure temporary QR code displayed on this Windows application using your phone camera.",
      icon: QrCode,
    },
    {
      num: 3,
      title: "Allow Permissions",
      desc: "Grant temporary camera and microphone access when prompted by your mobile web browser.",
      icon: ShieldCheck,
    },
    {
      num: 4,
      title: "Establish Connection",
      desc: "The phone securely pairs with this Windows computer over Same Wi-Fi, USB Tethering, or Remote Internet via WebRTC.",
      icon: Wifi,
    },
    {
      num: 5,
      title: "Start Live Stream",
      desc: "Tap 'Start Camera' on your phone to transmit ultra low-latency HD video directly into Windows.",
      icon: Video,
    },
    {
      num: 6,
      title: "Select in Windows Apps",
      desc: "Select 'Mobile AS Webcam' inside Microsoft Teams, Zoom, Google Meet, OBS Studio, Discord, or Skype.",
      icon: MonitorCheck,
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col justify-between p-6 md:p-12 overflow-y-auto">
      {/* Subtle top brand header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-zinc-800 pb-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="pill-capsule px-3 py-1 rounded-full text-emerald-400 font-bold text-sm">
            Mobile
          </span>
          <span className="text-chrome font-black tracking-widest text-lg">AS</span>
          <span className="text-chrome-bright font-bold text-lg">Webcam</span>
        </div>
        <div className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
          Setup Workflow Guide
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full my-auto py-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-chrome-bright mb-3">
            How to Use Mobile AS Webcam
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
            Zero mobile installation. Pure web browser pairing. Direct WebRTC streaming to Windows virtual camera.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group relative p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
                      {step.num}
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 text-zinc-400 group-hover:text-emerald-400 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
                  <span>Requirement verified</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Action Button */}
        <div className="mt-12 text-center flex justify-center">
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-emerald-500 text-black font-extrabold text-lg hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.7)]"
          >
            <span>Continue to Application</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto w-full pt-8 text-center text-xs text-zinc-500">
        Compatible with Windows 10/11 • Microsoft Teams, Zoom, Google Meet, OBS Studio, Discord, Skype
      </div>
    </div>
  );
}
