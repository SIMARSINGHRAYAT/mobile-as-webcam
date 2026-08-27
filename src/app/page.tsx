"use client";

import React, { useState } from "react";
import { WelcomePage } from "@/components/WelcomePage";
import { HowToUsePage } from "@/components/HowToUsePage";
import { MainDesktopApp } from "@/components/MainDesktopApp";

type AppStep = "welcome" | "how-to-use" | "main";

export default function Home() {
  const [step, setStep] = useState<AppStep>("welcome");

  if (step === "welcome") {
    return <WelcomePage onGetStarted={() => setStep("how-to-use")} />;
  }

  if (step === "how-to-use") {
    return <HowToUsePage onContinue={() => setStep("main")} />;
  }

  return <MainDesktopApp />;
}
