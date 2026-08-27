"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  MonitorCheck,
  Wifi,
  Usb,
  ShieldAlert,
  Video,
} from "lucide-react";

export function HelpTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Do I need to install an Android or iOS mobile application?",
      a: "No! Mobile AS Webcam is entirely mobile-browser-based. You do not need to install anything from Google Play Store or Apple App Store. Simply open Chrome, Safari, Edge, or Firefox on your phone, scan the QR code, allow camera permissions in the browser, and start streaming.",
    },
    {
      q: "How do I select Mobile AS Webcam inside Microsoft Teams, Zoom, or OBS Studio?",
      a: "1. Launch Mobile AS Webcam on Windows and pair your phone.\n2. Open Teams, Zoom, Google Meet, OBS Studio, or Discord.\n3. Navigate to Video Settings inside that application.\n4. Under 'Camera' or 'Video Device', select 'Mobile AS Webcam' from the drop-down menu.\n5. Your phone camera feed will appear directly inside the meeting or broadcast.",
    },
    {
      q: "How does USB Tethering work with mobile web browsers?",
      a: "Because web browsers cannot access raw USB hardware directly, Mobile AS Webcam uses USB Network Tethering (RNDIS/NCM). Enable 'USB Tethering' or 'Personal Hotspot via USB' in your phone settings. Your phone creates a virtual local network adapter. Your phone browser can then access the local Windows receiver over the high-speed USB network connection with minimal latency.",
    },
    {
      q: "Why is my browser asking for Camera/Microphone permissions?",
      a: "Modern mobile operating systems (iOS & Android) enforce strict privacy security. Browsers require explicit user consent via `navigator.mediaDevices.getUserMedia` before capturing video or audio. Always tap 'Allow' when prompted.",
    },
    {
      q: "What should I do if the camera screen is black or not appearing?",
      a: "1. Ensure camera permissions were granted in the phone browser.\n2. Verify that no other browser tab or phone app is locking the camera.\n3. Verify that Windows Firewall is not blocking local port 3000.\n4. Click 'Run Diagnostics' in the Diagnostics tab to perform an automated health check.",
    },
    {
      q: "Is my video stream private and encrypted?",
      a: "Yes. All video frames and microphone audio streams are encrypted end-to-end using WebRTC DTLS-SRTP standards. No media is ever sent to third-party cloud servers or stored on disk.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Help Center & Knowledge Base</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Documentation, connection troubleshooting, and third-party app setup guides.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides & errors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Guide Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
          <Wifi className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-white">Wi-Fi & Network</div>
            <div className="text-xs text-zinc-400 mt-0.5">Ensure phone and PC are on same local subnet.</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
          <Usb className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-white">USB Tethering</div>
            <div className="text-xs text-zinc-400 mt-0.5">Enable RNDIS network adapter in phone settings.</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
          <MonitorCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-white">App Integration</div>
            <div className="text-xs text-zinc-400 mt-0.5">Configure Teams, Zoom, Meet, OBS, Discord.</div>
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <div
              key={i}
              className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between hover:bg-zinc-900/50"
              >
                <span>{faq.q}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                )}
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-zinc-900 text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/30">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
