"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FloatingTechSymbols } from "./FloatingTechSymbols";
import { ArrowRight, Loader2 } from "lucide-react";

interface WelcomePageProps {
  onGetStarted: () => void;
}

export function WelcomePage({ onGetStarted }: WelcomePageProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      onGetStarted();
    }, 350);
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* 3D Floating Tech Symbols Background */}
      <FloatingTechSymbols />

      {/* Center Brand Experience Content - High Contrast & Chrome Typography */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
        
        {/* Application Branding */}
        <Image
          src="/logo.png"
          alt="Mobile AS Webcam"
          width={190}
          height={190}
          priority
          className="h-36 w-36 object-contain sm:h-44 sm:w-44"
        />
        <div className="text-chrome flex items-center justify-center flex-wrap gap-3 text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight">
          <span>Mobile</span>
          <span className="font-black italic tracking-widest">AS</span>
          <span className="font-extrabold">Webcam</span>
        </div>

        {/* Verified Motivational Quotation directly below title */}
        <blockquote className="text-chrome max-w-xl mx-auto italic text-base sm:text-lg md:text-xl font-light leading-relaxed border-l-2 border-emerald-500/40 pl-4 py-1 text-center">
          &ldquo;Our industry does not respect tradition — it only respects innovation.&rdquo;
          <footer className="text-chrome mt-2 text-sm sm:text-base font-semibold not-italic tracking-wide">
            — Satya Nadella, <span className="font-normal">CEO of Microsoft</span>
          </footer>
        </blockquote>

        {/* Single Prominent "Get Started" Button with Tasteful Green Accent */}
        <div className="pt-4">
          <button
            onClick={handleClick}
            disabled={loading}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base sm:text-lg font-bold rounded-2xl bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all duration-200 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
