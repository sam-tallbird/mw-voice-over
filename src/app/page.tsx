'use client'

import { SparklesCore } from "@/components/ui/sparkles";
import GradientText from "@/components/ui/GradientText";
import TextToSpeechInput from "@/components/TextToSpeechInput";
import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [particleDensity, setParticleDensity] = useState(7200);

  useEffect(() => {
    setMounted(true);
    // Set particle density based on screen size, only on client side
    if (typeof window !== 'undefined') {
      setParticleDensity(window.innerWidth < 768 ? 4000 : 7200);
    }
  }, []);
  return (
    <div>
      <div className="h-[20rem] w-full bg-white flex flex-col items-center justify-center relative pt-16 md:pt-32">
        <GradientText
          colors={["#660AF0", "#1DB6FD", "#45FC79"]}
          animationSpeed={8}
          showBorder={false}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center whitespace-normal md:whitespace-nowrap relative z-20 px-4 md:px-0"
        >
          FIRST IRAQI TEXT TO SPEECH
        </GradientText>
        <div className="w-full md:w-[90%] lg:w-[100rem] h-40 relative">
          {/* Gradients */}
          <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px w-3/4" />
          <div className="absolute inset-x-30 md:inset-x-60 top-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px w-1/4" />

          {/* Core component */}
          {mounted && (
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1.2}
              particleDensity={particleDensity}
              className="w-full h-full"
              particleColor="#9033ff"
            />
          )}

          {/* Radial Gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-white [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
        </div>
      </div>
      
      {/* TTS Input Section */}
      <TextToSpeechInput />
    </div>
  );
}
