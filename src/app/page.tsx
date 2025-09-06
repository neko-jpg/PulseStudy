"use client";

import { useState } from "react";
import WelcomeScreen from "@/components/onboarding/welcome-screen";
import SlidesScreen from "@/components/onboarding/slides-screen";
import PrivacyScreen from "@/components/onboarding/privacy-screen";
import AuthScreen from "@/components/onboarding/auth-screen";
import { Card } from "@/components/ui/card";

type Screen = "welcome" | "slides" | "privacy" | "auth";

export default function OnboardingPage() {
  const [screen, setScreen] = useState<Screen>("welcome");

  const renderScreen = () => {
    switch (screen) {
      case "welcome":
        return <WelcomeScreen onNext={() => setScreen("slides")} />;
      case "slides":
        return <SlidesScreen onNext={() => setScreen("privacy")} />;
      case "privacy":
        return <PrivacyScreen onNext={() => setScreen("auth")} />;
      case "auth":
        return <AuthScreen />;
      default:
        return <WelcomeScreen onNext={() => setScreen("slides")} />;
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[linear-gradient(135deg,_#6e8efb,_#a777e3)] p-4">
      <Card className="relative h-[600px] w-full max-w-sm overflow-hidden rounded-2xl shadow-xl">
        {renderScreen()}
      </Card>
    </main>
  );
}
