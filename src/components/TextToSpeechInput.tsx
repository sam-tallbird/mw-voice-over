'use client'

import { useState, useEffect } from "react";
import CustomAudioPlayer from "./ui/CustomAudioPlayer";

interface Voice {
  googleApiName: string; // Name sent to Google API
  displayName: string;   // Name shown in UI
  arabicName: string;    // Arabic name
  characteristics: string;
  gender: 'male' | 'female';
}

const AVAILABLE_VOICES: Voice[] = [
  { googleApiName: 'Puck', displayName: 'Bashar', arabicName: 'بشار', characteristics: 'Upbeat', gender: 'male' },
  { googleApiName: 'Kore', displayName: 'Razan', arabicName: 'رزان', characteristics: 'Firm', gender: 'female' },
  { googleApiName: 'Fenrir', displayName: 'Firas', arabicName: 'فراس', characteristics: 'Excitable', gender: 'male' },
  { googleApiName: 'Leda', displayName: 'Zahra', arabicName: 'زهراء', characteristics: 'Youthful', gender: 'female' },
  { googleApiName: 'Orus', displayName: 'Qays', arabicName: 'قيس', characteristics: 'Firm', gender: 'male' },
  { googleApiName: 'Aoede', displayName: 'Sama', arabicName: 'سما', characteristics: 'Breezy', gender: 'female' },
  { googleApiName: 'Callirrhoe', displayName: 'Rowaida', arabicName: 'رويدا', characteristics: 'Easy-going', gender: 'female' },
  { googleApiName: 'Enceladus', displayName: 'Naseem', arabicName: 'نسيم', characteristics: 'Breathy', gender: 'male' },
  { googleApiName: 'Sadachbia', displayName: 'Marah', arabicName: 'مرح', characteristics: 'Lively', gender: 'female' }
];

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
  const [selectedVoice, setSelectedVoice] = useState<string>('Orus'); // Default to Qays (Google API: Orus)
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

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoice(e.target.value);
  };

  const getVoiceGender = (voiceName: string): 'male' | 'female' => {
    const voice = AVAILABLE_VOICES.find(v => v.googleApiName === voiceName);
    return voice?.gender || 'male';
  };

  const getVoiceDisplayName = (voiceName: string): string => {
    const voice = AVAILABLE_VOICES.find(v => v.googleApiName === voiceName);
    return voice?.displayName || voiceName;
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
          text: `Read aloud in a warm and friendly iraqi tone: ${inputText.trim()}`,
          email: user?.email,
          voiceName: selectedVoice
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
    <div className="w-full bg-white py-8 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* User Info and Authentication */}
        {isAuthenticated && user ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Welcome, {user.email}</h3>
              <div className="mt-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="text-sm text-gray-600">
                    Usage: {usageInfo?.used || 0}/{usageInfo?.max || 3} generations
                  </span>
                  <div className="w-24 sm:w-32 h-2 bg-gray-200 rounded-full">
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
            <div className="p-4 sm:p-8 bg-gray-50 rounded-lg border border-gray-200">
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

        {/* Voice Selection Dropdown */}
        {isAuthenticated && (
          <div className="mb-6">
            <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Voice
            </label>
            <div className="relative">
              <select
                id="voice-select"
                value={selectedVoice}
                onChange={handleVoiceChange}
                className={`w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 appearance-none ${
                  getVoiceGender(selectedVoice) === 'male'
                    ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-blue-50'
                    : 'border-pink-300 focus:border-pink-500 focus:ring-pink-500 bg-pink-50'
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
                disabled={!isAuthenticated || (usageInfo && remainingUses === 0)}
              >
                {AVAILABLE_VOICES.map((voice) => (
                  <option 
                    key={voice.googleApiName} 
                    value={voice.googleApiName}
                    className={voice.gender === 'male' ? 'text-blue-700' : 'text-pink-700'}
                                      >
                      {voice.displayName} ({voice.arabicName}) - {voice.characteristics} ({voice.gender === 'male' ? '♂' : '♀'})
                    </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Male voices</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>Female voices</span>
              </div>
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
            className="w-full min-h-[200px] p-4 sm:p-6 border border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:outline-none text-gray-800 text-base sm:text-lg leading-relaxed transition-colors duration-200"
            maxLength={maxLength}
            disabled={!isAuthenticated || (usageInfo && remainingUses === 0)}
          />
          <div className="absolute bottom-4 right-4 text-sm text-gray-500 bg-white px-2">
            {inputText.length}/{maxLength}
          </div>
        </div>
        
        {/* Generate Button */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <button
            className={`w-full sm:w-auto px-6 sm:px-95 py-2 sm:py-3 text-base sm:text-lg font-medium text-white border-2 border-gray-300 rounded-lg transition-colors duration-300 ease-in-out ${
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
            <div className="w-full" style={{ maxWidth: "450px" }}>
              <CustomAudioPlayer src={audioUrl} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 