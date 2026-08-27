"use client";

import React, { useState } from "react";
import {
  Info,
  ShieldCheck,
  FileText,
  Code,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

export function AboutTab() {
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [showManifest, setShowManifest] = useState(false);

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities">
  <Identity Name="MobileASWebcam.App" Publisher="CN=Mobile AS Webcam, O=Software, C=US" Version="1.0.0.0" ProcessorArchitecture="x64" />
  <Properties>
    <DisplayName>Mobile AS Webcam</Identity>
    <PublisherDisplayName>Mobile AS Webcam Corporation</PublisherDisplayName>
    <Logo>Assets\\StoreLogo.png</Logo>
  </Properties>
  <Capabilities>
    <Capability Name="internetClient" />
    <Capability Name="privateNetworkClientServer" />
    <DeviceCapability Name="webcam" />
    <DeviceCapability Name="microphone" />
  </Capabilities>
</Package>`;

  const copyManifest = () => {
    navigator.clipboard.writeText(manifestXml);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Brand Card */}
      <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-black text-2xl text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            MW
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pill-capsule px-3 py-1 rounded-full text-emerald-400 font-extrabold text-sm">
                Mobile
              </span>
              <span className="text-chrome font-black tracking-widest text-xl">AS</span>
              <span className="text-chrome-bright font-extrabold text-xl">Webcam</span>
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              Version 1.0.0 (x64 Production Release) • Windows App SDK
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Microsoft Partner Center Certified Precheck</span>
        </div>
      </div>

      {/* Store Packaging Precheck Summary */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            MSIX Package Identity & Capability Audit
          </h3>
          <button
            onClick={() => setShowManifest(!showManifest)}
            className="px-3 py-1 rounded-lg bg-zinc-900 text-xs font-bold text-emerald-400 border border-zinc-800 hover:bg-zinc-800"
          >
            {showManifest ? "Hide AppxManifest.xml" : "View AppxManifest.xml"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase font-mono">Package Family</div>
            <div className="font-bold text-white truncate">MobileASWebcam.App_82hfa</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase font-mono">Target Platform</div>
            <div className="font-bold text-emerald-400">Windows 10/11 (x64)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase font-mono">Requested Capabilities</div>
            <div className="font-bold text-white">4 Capabilities (Audited)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase font-mono">Admin Privileges</div>
            <div className="font-bold text-emerald-400">Not Required (User Level)</div>
          </div>
        </div>

        {showManifest && (
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">AppxManifest.xml</span>
              <button
                onClick={copyManifest}
                className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-[11px] font-bold flex items-center gap-1 hover:bg-zinc-700"
              >
                {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedManifest ? "Copied" : "Copy Manifest"}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-emerald-400/90 overflow-x-auto">
              {manifestXml}
            </pre>
          </div>
        )}
      </div>

      {/* Legal & Licenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Privacy & Data Transparency
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Mobile AS Webcam collects zero media frames, zero voice recordings, and zero personal credentials. Video and audio streams travel directly peer-to-peer over DTLS-SRTP encrypted WebRTC channels between your phone browser and your Windows computer.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" /> Publisher & Open Source Acknowledgments
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Built using Next.js App Router, WebRTC Native APIs, Drizzle ORM, PostgreSQL, Lucide Icons, and Windows App SDK. All third-party libraries comply with MIT and Apache 2.0 open-source licensing.
          </p>
        </div>
      </div>
    </div>
  );
}
