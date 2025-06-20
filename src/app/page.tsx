'use client'

import { useState, useEffect } from 'react';
import { SparklesCore } from "@/components/ui/sparkles";
import GradientText from "@/components/ui/GradientText";
import TextToSpeechInput from "@/components/TextToSpeechInput";
import LoginModal from "@/components/LoginModal";
// import ConnectionTest from "@/components/ConnectionTest"; // Kept for future debugging

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Check for stored authentication
    const storedToken = localStorage.getItem('mw_token');
    const storedUser = localStorage.getItem('mw_user');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('mw_token');
        localStorage.removeItem('mw_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (newToken: string, userData: any) => {
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('mw_token');
    localStorage.removeItem('mw_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="h-[20rem] w-full bg-white flex flex-col items-center justify-center relative pt-16 md:pt-32">
        <GradientText
          colors={["#660AF0", "#1DB6FD", "#45FC79"]}
          animationSpeed={8}
          showBorder={false}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center whitespace-normal md:whitespace-nowrap relative z-20 px-4 md:px-0"
        >
          IRAQI FIRST TEXT TO SPEACH
        </GradientText>
        <div className="w-full md:w-[90%] lg:w-[100rem] h-40 relative">
          {/* Gradients */}
          <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px w-3/4" />
          <div className="absolute inset-x-30 md:inset-x-60 top-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px w-1/4" />

          {/* Core component */}
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1.2}
            particleDensity={window.innerWidth < 768 ? 4000 : 7200}
            className="w-full h-full"
            particleColor="#9033ff"
          />

          {/* Radial Gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-white [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
        </div>
      </div>
      
      {/* Connection Test - Removed but kept component for future debugging
      <div className="py-8">
        <ConnectionTest />
      </div>
      */}
      
      {/* Input Section - Always shown, handles auth state internally */}
      <TextToSpeechInput 
        user={user} 
        token={token || undefined} 
        onLogout={handleLogout}
        onLoginClick={handleLoginClick}
        isAuthenticated={isAuthenticated}
          />
      
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onLogin={handleLogin}
        onClose={handleCloseModal}
      />
      
      {/* MoonWhale Voice-Over content will go here */}
    </div>
  );
}
