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
      <div className="h-[28rem] w-full bg-white flex flex-col items-center justify-center relative pt-12 md:pt-32">
        <GradientText
          colors={["#1073FF", "#1DB6FD", "#45FC79"]}
          animationSpeed={8}
          showBorder={false}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center whitespace-normal md:whitespace-nowrap relative z-20 px-4 md:px-0 mb-6"
        >
          FIRST IRAQI TEXT TO SPEECH
        </GradientText>
        
        <div className="w-full md:w-[90%] lg:w-[100rem] h-full relative">
          {/* Gradients */}
          <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px w-3/4" />
          <div className="absolute inset-x-30 md:inset-x-60 top-0 bg-gradient-to-r from-transparent to-transparent h-px w-1/4" style={{ background: 'linear-gradient(to right, transparent, #1073FF, transparent)' }} />

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

          {/* Welcome Section - Overlapping with particles */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
                             <div className="text-lg md:text-2xl text-gray-900 font-medium leading-relaxed max-w-5xl mx-auto">
                <p>
                  We're continuously improving the experience to bring you the most natural, 
                  Your feedback means a lot and helps us build better.
                  expressive voiceovers in Iraqi dialect.
                </p>
                
                
                <p>
                  If you would like to keep using Klam.ai, feel free to explore our{' '}
                  <a 
                    href="/pricing" 
                    className="font-medium transition-colors duration-200"
                    style={{ color: '#1073FF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0952CC'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#1073FF'}
                  >
                    pricing page
                  </a>{' '}
                  to learn more about our plans.
                </p>
              </div>
            </div>
          </div>

          {/* Radial Gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-white [mask-image:radial-gradient(450px_300px_at_top,transparent_30%,white)]"></div>
        </div>
      </div>
      
      {/* TTS Input Section */}
      <TextToSpeechInput />
    </div>
  );
}
