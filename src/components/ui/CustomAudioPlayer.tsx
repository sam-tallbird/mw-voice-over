'use client';

import { useState, useRef, useEffect } from 'react';

interface CustomAudioPlayerProps {
  src: string;
  className?: string;
  userEmail?: string;
}

export default function CustomAudioPlayer({ src, className = '', userEmail }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `voice-over-${new Date().getTime()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`bg-gray-50 p-4 rounded-lg w-full ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button 
          onClick={togglePlay}
          className="w-8 h-8 flex items-center justify-center"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#1073FF" viewBox="0 0 16 16">
              <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#1073FF" viewBox="0 0 16 16">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
          )}
        </button>
        
        {/* Current Time */}
        <span className="text-xs text-gray-600 w-8">{formatTime(currentTime)}</span>
        
        {/* Progress Bar */}
        <div className="flex-1 relative">
          <div className="h-2 bg-gray-300 rounded-full relative">
                          <div 
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ backgroundColor: '#1073FF', width: `${progressPercentage}%` }}
              />
            <div 
              className="absolute top-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm transform -translate-y-1/2"
              style={{ left: `calc(${progressPercentage}% - 8px)` }}
            />
          </div>
          <input 
            type="range" 
            min="0" 
            max={duration || 0} 
            step="0.01"
            value={currentTime} 
            onChange={handleSeek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
        
                 {/* Duration */}
         <span className="text-xs text-gray-600 w-8">{formatTime(duration)}</span>
         
         {/* Download button - only for demo1 user */}
         {userEmail === 'demo1@mw.com' && (
           <button 
             onClick={handleDownload}
             className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center"
             title="Download audio (Premium Feature)"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
               <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
               <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
             </svg>
           </button>
         )}
       </div>
     </div>
   );
 } 