'use client'

import { useState, useEffect } from "react";

interface TextToSpeechInputProps {
  user?: any;
  token?: string;
  onLogout?: () => void;
  onLoginClick?: () => void;
  isAuthenticated: boolean;
}

export default function TextToSpeechInput({ 
  user, 
  token, 
  onLogout, 
  onLoginClick, 
  isAuthenticated 
}: TextToSpeechInputProps) {
  const [inputText, setInputText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState(user?.usage || { used: 0, max: 3 });
  const maxLength = 1000;

  useEffect(() => {
    if (user?.usage) {
      setUsageInfo(user.usage);
    } else if (user && !user.usage) {
      // Fallback if user exists but no usage info
      console.warn('User exists but no usage info found, using default:', user);
      setUsageInfo({ used: 0, max: 3 });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setInputText(value);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim() || !isAuthenticated || !token) return;
    
    // Check if user has remaining uses
    if (usageInfo && usageInfo.used >= usageInfo.max) {
      alert("You have reached your usage limit. Please contact support for more generations.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          text: inputText.trim(),
          email: user?.email
        }),
      });

      if (!res.ok) {
        const details = await res.json().catch(() => null);
        console.error('API error details', details);
        
        if (res.status === 401) {
          alert("Session expired. Please log in again.");
          onLogout?.();
          return;
        }
        
        if (res.status === 403) {
          alert("Usage limit exceeded. You have reached the maximum number of generations.");
          // Update usage info from response headers or error details
          if (details?.usage) {
            setUsageInfo(details.usage);
          }
          return;
        }
        
        throw new Error(details?.error || `Request failed with ${res.status}`);
      }

      // Update usage info from response headers
      const usedCount = res.headers.get('X-Usage-Count');
      const usageLimit = res.headers.get('X-Usage-Limit');
      if (usedCount && usageLimit) {
        setUsageInfo({
          used: parseInt(usedCount),
          max: parseInt(usageLimit)
        });
      }

      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate audio");
    } finally {
      setLoading(false);
    }
  };

  const remainingUses = usageInfo ? usageInfo.max - usageInfo.used : 0;
  const usagePercentage = usageInfo ? (usageInfo.used / usageInfo.max) * 100 : 0;

  return (
    <div className="w-full bg-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* User Info and Authentication */}
        {isAuthenticated && user ? (
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Welcome, {user.email}</h3>
              <div className="mt-2">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Usage: {usageInfo?.used || 0}/{usageInfo?.max || 3} generations
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        usagePercentage >= 100 ? 'bg-red-500' : 
                        usagePercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${
                    remainingUses === 0 ? 'text-red-600' : 
                    remainingUses === 1 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {remainingUses} left
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="text-center mb-8">
            <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                🔒 Authentication Required
              </h3>
              <p className="text-gray-600 mb-4">
                Please sign in to access the text-to-speech functionality
              </p>
              <button
                onClick={onLoginClick}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder={
              isAuthenticated 
                ? "Enter your text here to convert to speech..." 
                : "Sign in to use text-to-speech functionality..."
            }
            className="w-full min-h-[200px] p-6 border border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:outline-none text-gray-800 text-lg leading-relaxed transition-colors duration-200"
            maxLength={maxLength}
            disabled={!isAuthenticated || (usageInfo && remainingUses === 0)}
          />
          <div className="absolute bottom-4 right-4 text-sm text-gray-500 bg-white px-2">
            {inputText.length}/{maxLength}
          </div>
        </div>
        
        {/* Generate Button */}
        <div className="mt-8 flex justify-center">
          <button
            className={`px-95 py-3 text-lg font-medium text-white border-2 border-gray-300 rounded-lg transition-colors duration-300 ease-in-out ${
              !isAuthenticated ? 'bg-gray-400 cursor-not-allowed' :
              remainingUses === 0 ? 'bg-gray-400 cursor-not-allowed' : ''
            }`}
            style={{
              backgroundColor: !isAuthenticated ? '#9CA3AF' :
                             remainingUses === 0 ? '#9CA3AF' : "#660AF0",
            }}
            onMouseEnter={(e) => {
              if (isAuthenticated && remainingUses > 0) {
                e.currentTarget.style.backgroundColor = "#1DB6FD"
              }
            }}
            onMouseLeave={(e) => {
              if (isAuthenticated && remainingUses > 0) {
                e.currentTarget.style.backgroundColor = "#660AF0"
              }
            }}
            onClick={isAuthenticated ? handleGenerate : onLoginClick}
            disabled={loading || (!isAuthenticated) || (usageInfo && remainingUses === 0)}
          >
            {loading ? "Generating..." : 
             !isAuthenticated ? "Sign In to Generate" :
             remainingUses === 0 ? "No Uses Remaining" : "Generate"}
          </button>
        </div>
        
        {audioUrl && (
          <div className="mt-6 flex justify-center">
            <audio controls src={audioUrl} className="w-full max-w-md" />
          </div>
        )}
      </div>
    </div>
  );
} 