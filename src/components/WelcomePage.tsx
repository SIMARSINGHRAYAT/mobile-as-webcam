"use client";

import React from "react";
import { Camera, Smartphone, Wifi, ArrowRight } from "lucide-react";

interface WelcomePageProps {
  onGetStarted: () => void;
}

export function WelcomePage({ onGetStarted }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            MOBILE as WEBCAM
          </h1>
          <p className="text-xl text-blue-100 mb-2">
            Turn Your Phone into a Professional Webcam
          </p>
          <p className="text-blue-200">
            High-quality video streaming directly to your video calls
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
            <Smartphone className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Use Your Phone</h3>
            <p className="text-blue-200 text-sm">
              Leverage your smartphone&apos;s high-quality camera
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
            <Wifi className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Wireless Connection</h3>
            <p className="text-blue-200 text-sm">
              Connect via WiFi with low-latency WebRTC streaming
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
            <Camera className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Works Everywhere</h3>
            <p className="text-blue-200 text-sm">
              Compatible with Google Meet, Zoom, Teams & more
            </p>
          </div>
        </div>

        <button
          onClick={onGetStarted}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-blue-300 text-sm mt-6">
          No installation required • Works in your browser • Free to use
        </p>
      </div>
    </div>
  );
}
