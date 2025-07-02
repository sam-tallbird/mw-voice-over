'use client'

import { useState, useEffect } from "react";
import CustomAudioPlayer from "./ui/CustomAudioPlayer";
import { useAuth } from "./AuthProvider";
import { createClientSupabase } from "@/lib/supabase";
import Link from "next/link";

interface Voice {
  googleApiName: string; // Name sent to Google API
  displayName: string;   // Name shown in UI
  arabicName: string;    // Arabic name
  characteristics: string;
  gender: 'male' | 'female';
}

interface UserUsage {
  current_usage: number;
  max_usage: number;
  custom_limit: number | null;
  email: string;
  full_name: string;
}

const AVAILABLE_VOICES: Voice[] = [
  { googleApiName: 'puck', displayName: 'Bashar', arabicName: 'بشار', characteristics: 'Upbeat', gender: 'male' },
  { googleApiName: 'kore', displayName: 'Razan', arabicName: 'رزان', characteristics: 'Firm', gender: 'female' },
  { googleApiName: 'fenrir', displayName: 'Firas', arabicName: 'فراس', characteristics: 'Excitable', gender: 'male' },
  { googleApiName: 'leda', displayName: 'Zahra', arabicName: 'زهراء', characteristics: 'Youthful', gender: 'female' },
  { googleApiName: 'orus', displayName: 'Qays', arabicName: 'قيس', characteristics: 'Firm', gender: 'male' },
  { googleApiName: 'aoede', displayName: 'Sama', arabicName: 'سما', characteristics: 'Breezy', gender: 'female' },
  { googleApiName: 'callirrhoe', displayName: 'Rowaida', arabicName: 'رويدا', characteristics: 'Easy-going', gender: 'female' },
  { googleApiName: 'enceladus', displayName: 'Naseem', arabicName: 'نسيم', characteristics: 'Breathy', gender: 'male' },
  { googleApiName: 'sadachbia', displayName: 'Marah', arabicName: 'مرح', characteristics: 'Lively', gender: 'male' },
  { googleApiName: 'zephyr', displayName: 'Sarah', arabicName: 'سارة', characteristics: 'Gentle', gender: 'female' }
];

export default function TextToSpeechInput() {
  const { user, loading } = useAuth();
  const [inputText, setInputText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>('orus'); // Default to Qays (Google API: orus)
  const [temperature, setTemperature] = useState<number>(1); // Temperature control
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const maxLength = 1000;
  
  const supabase = createClientSupabase();

  // Fetch user usage data
  const fetchUserUsage = async (isRetry = false) => {
    if (!user) return;
    
    setLoadingUsage(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('current_usage, max_usage, custom_limit, email, full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user usage:', error);
        return;
      }

      setUserUsage(data);
    } catch (error) {
      if (!isRetry) {
        // Wait 500ms and try once more for auth session propagation
        await new Promise(resolve => setTimeout(resolve, 500));
        return fetchUserUsage(true);
      }
      // If retry also fails, just log it gracefully
      console.log('User usage data temporarily unavailable');
    } finally {
      setLoadingUsage(false);
    }
  };

  // Fetch usage data when user loads
  useEffect(() => {
    if (user) {
      fetchUserUsage();
    }
  }, [user]);

  // Usage Bar Component
  const UsageBar = () => {
    if (!userUsage) return null;
    
    const effectiveLimit = userUsage.custom_limit || userUsage.max_usage;
    const usagePercentage = (userUsage.current_usage / effectiveLimit) * 100;
    const remaining = effectiveLimit - userUsage.current_usage;
    const isLow = usagePercentage >= 80;
    const isExhausted = userUsage.current_usage >= effectiveLimit;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Generation Usage</h3>
          <span className="text-sm text-gray-600">
            {userUsage.current_usage} / {effectiveLimit} used
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              isExhausted ? 'bg-red-500' : 
              isLow ? 'bg-orange-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>
        
        {/* Usage Status */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={`font-medium ${
            isExhausted ? 'text-red-600' : 
            isLow ? 'text-orange-600' : 
            'text-green-600'
          }`}>
            {isExhausted ? 'Limit reached' : 
             isLow ? `Only ${remaining} left` : 
             `${remaining} remaining`}
          </span>
          {userUsage.custom_limit && (
            <span className="font-medium" style={{ color: '#1073FF' }}>
              Custom Limit ⭐
            </span>
          )}
        </div>
      </div>
    );
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="w-full bg-white py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="w-full bg-white py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E6F0FF' }}>
              <svg className="w-8 h-8" style={{ color: '#1073FF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-6">
              Please sign in to access Iraqi Arabic text-to-speech generation
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg transition-colors"
        style={{ backgroundColor: '#1073FF' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0952CC'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1073FF'}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setInputText(value);
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoice(e.target.value);
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow demo1 user to change temperature
    if (userUsage?.email !== 'demo1@mw.com') return;
    
    const newTemp = parseFloat(e.target.value);
    setTemperature(newTemp);
  };

  const getVoiceGender = (voiceName: string): 'male' | 'female' => {
    const voice = AVAILABLE_VOICES.find(v => v.googleApiName === voiceName);
    return voice?.gender || 'male';
  };

  const handleGenerate = async () => {
    if (!inputText.trim() || !userUsage) return;
    
    // Check if user has reached their limit
    const effectiveLimit = userUsage.custom_limit || userUsage.max_usage;
    if (userUsage.current_usage >= effectiveLimit) {
      alert(`You have reached your generation limit of ${effectiveLimit}. Please contact support for more generations.`);
      return;
    }
    
    try {
      setGenerating(true);
      
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          text: `Speak clearly in authentic Iraqi Arabic dialect (لهجة عراقية) with consistent neutral delivery: ${inputText.trim()}`,
          voiceName: selectedVoice,
          temperature: temperature
        }),
      });

      if (!res.ok) {
        const details = await res.json().catch(() => null);
        console.error('API error details', details);
        throw new Error(details?.error || `Request failed with ${res.status}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      // Refresh usage data after successful generation
      await fetchUserUsage();
      
    } catch (err) {
      console.error(err);
      alert("Failed to generate audio");
    } finally {
      setGenerating(false);
    }
  };

  // Check if user can generate
  const canGenerate = userUsage && userUsage.current_usage < (userUsage.custom_limit || userUsage.max_usage);
  
  // Check if user is demo1 (has special privileges)
  const isDemo1User = userUsage?.email === 'demo1@mw.com';

  return (
    <div className="w-full bg-white py-8 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Voice Selection Dropdown */}
        <div className="mb-6">
          <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Voice
          </label>
          <div className="relative">
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={handleVoiceChange}
              disabled={!canGenerate}
              className={`w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 appearance-none ${
                !canGenerate 
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  : getVoiceGender(selectedVoice) === 'male'
                  ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-blue-50'
                  : 'border-pink-300 focus:border-pink-500 focus:ring-pink-500 bg-pink-50'
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
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

        {/* Temperature Control - Only for demo1 user */}
        {isDemo1User && (
          <div className="mb-6">
            <label htmlFor="temperature-control" className="block text-sm font-medium text-gray-700 mb-2">
              Temperature Control (Advanced) 
              <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#E6F0FF', color: '#0952CC' }}>Premium Feature</span>
            </label>
            <div className="relative">
              {/* Custom progress bar like audio player */}
              <div className="h-1.5 bg-gray-300 rounded-full cursor-pointer relative">
                {/* Progress fill */}
                <div 
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ 
                    width: `${(temperature / 2) * 100}%`,
                    backgroundColor: canGenerate ? '#1073FF' : '#9CA3AF' // Blue or gray
                  }}
                ></div>
                
                {/* Thumb/dot */}
                <div 
                  className="absolute top-1/2 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm transform -translate-y-1/2"
                  style={{ 
                    left: (() => {
                      const percentage = (temperature / 2) * 100;
                      if (percentage <= 0) return '0%';
                      if (percentage >= 100) return 'calc(100% - 8px)';
                      return `calc(${percentage}% - 4px)`;
                    })(),
                    backgroundColor: canGenerate ? '#1DB6FD' : '#9CA3AF'
                  }}
                ></div>
              </div>
              
              {/* Hidden range input for accessibility */}
              <input
                id="temperature-control"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={handleTemperatureChange}
                disabled={!canGenerate}
                className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Temperature Control"
              />
              
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 (Consistent)</span>
                <span className="font-medium text-blue-600">Current: {temperature}</span>
                <span>2 (Creative)</span>
              </div>
            </div>
          </div>
        )}

        {/* Usage Bar */}
        {loadingUsage ? (
          <div className="mb-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <UsageBar />
        )}

        <div className="relative">
          <textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder={canGenerate ? "Enter your text here to convert to speech..." : "You have reached your generation limit..."}
            disabled={!canGenerate}
            className={`w-full min-h-[200px] p-4 sm:p-6 border rounded-lg resize-none focus:outline-none text-base sm:text-lg leading-relaxed transition-colors duration-200 ${
              !canGenerate 
                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                : 'border-gray-300 focus:border-blue-500 text-gray-800'
            }`}
            maxLength={maxLength}
          />
          <div className="absolute bottom-4 right-4 text-sm text-gray-500 bg-white px-2">
            {inputText.length}/{maxLength}
          </div>
        </div>
        
        {/* Generate Button */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <button
            className={`w-full sm:w-auto px-6 sm:px-95 py-2 sm:py-3 text-base sm:text-lg font-medium text-white border-2 rounded-lg transition-colors duration-300 ease-in-out ${
              !canGenerate || generating || !inputText.trim()
                ? 'bg-gray-400 border-gray-400 cursor-not-allowed'
                : 'border-gray-300'
            }`}
            style={{
              backgroundColor: (!canGenerate || generating || !inputText.trim()) ? '#9CA3AF' : "#1073FF",
            }}
            onMouseEnter={(e) => {
              if (canGenerate && !generating && inputText.trim()) {
                e.currentTarget.style.backgroundColor = "#1DB6FD";
              }
            }}
            onMouseLeave={(e) => {
              if (canGenerate && !generating && inputText.trim()) {
                e.currentTarget.style.backgroundColor = "#1073FF";
              }
            }}
            onClick={handleGenerate}
            disabled={!canGenerate || generating || !inputText.trim()}
          >
            {generating ? "Generating..." : 
             !canGenerate ? "Limit Reached" :
             !inputText.trim() ? "Enter Text" :
             "Generate"}
          </button>
        </div>

        {/* Usage Limit Warning */}
        {!canGenerate && userUsage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-red-700 font-medium">
                  Generation limit reached ({userUsage.current_usage}/{userUsage.custom_limit || userUsage.max_usage})
                </p>
                <p className="text-xs text-red-600">
                  Contact support for additional generations or upgrade your plan
                </p>
              </div>
            </div>
          </div>
        )}
        
        {audioUrl && (
          <div className="mt-6 flex justify-center">
            <div className="w-full" style={{ maxWidth: "450px" }}>
              <CustomAudioPlayer src={audioUrl} userEmail={userUsage?.email} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 