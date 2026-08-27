"use client";

import React from "react";
import { ArrowRight, Smartphone, Laptop, Video } from "lucide-react";

interface HowToUsePageProps {
  onContinue: () => void;
}

export function HowToUsePage({ onContinue }: HowToUsePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
          How It Works
        </h2>

        <div className="space-y-6 mb-8">
          <div className="flex items-start gap-4 bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              1
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Open on Your Computer
              </h3>
              <p className="text-blue-200">
                This web application runs in your browser. Keep this tab open on your computer where you want to use the virtual camera.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              2
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Connect Your Phone
              </h3>
              <p className="text-blue-200">
                Scan the QR code with your phone&apos;s camera or visit the URL on your mobile device. Your phone&apos;s camera will stream video to your computer.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              3
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Install Virtual Camera Driver
              </h3>
              <p className="text-blue-200">
                For the video to appear in video conferencing apps, you&apos;ll need a virtual camera driver. We recommend OBS Studio with Virtual Camera enabled - it&apos;s free and works instantly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              4
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Use in Video Calls
              </h3>
              <p className="text-blue-200">
                In Google Meet, Zoom, or Teams, select &quot;OBS Virtual Camera&quot; as your camera source. Your phone&apos;s camera feed will now appear in your video calls!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/20 rounded-xl p-6 mb-8 border border-blue-400/30">
          <div className="flex items-start gap-3">
            <Video className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-white font-semibold mb-2">Important Note</h4>
              <p className="text-blue-200 text-sm">
                Due to browser security restrictions, websites cannot directly create virtual camera devices. You need either:
              </p>
              <ul className="text-blue-200 text-sm mt-2 space-y-1">
                <li>• <strong>OBS Studio</strong> (Free, recommended) - Capture browser window and enable Virtual Camera</li>
                <li>• <strong>Unity Capture</strong> - Third-party virtual camera driver</li>
                <li>• <strong>Chrome Extension</strong> - Screen capture to existing virtual camera</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Continue to App
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
