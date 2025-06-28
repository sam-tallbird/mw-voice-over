'use client';

import { useState, useRef, useEffect } from 'react';

interface CustomAudioPlayerProps {
  src: string;
  className?: string;
  user?: any; // User object to check for download permissions
}

export default function CustomAudioPlayer({ src, className = '', user }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Check if the current user has download permission
  const canDownload = user?.email === 'demo1@mw.com'; // Only demo1 user can download

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle clicking directly on the progress bar
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    // Calculate the clicked position relative to the progress bar
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    
    // Set the new time based on the click position
    const newTime = clickPosition * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Volume control removed

  const changePlaybackRate = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Calculate thumb position to ensure it can reach the end
  const getThumbPosition = () => {
    if (progressPercentage <= 0) return '0%';
    if (progressPercentage >= 100) return 'calc(100% - 8px)';
    return `calc(${progressPercentage}% - 4px)`;
  };

  const handleDownload = () => {
    if (!canDownload) return;
    
    const link = document.createElement('a');
    link.href = src;
    link.download = `voice-over-${new Date().getTime()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`bg-gray-50 p-3 sm:p-4 rounded-lg w-full ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
        <button 
          onClick={togglePlay}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#660AF0" viewBox="0 0 16 16">
              <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#660AF0" viewBox="0 0 16 16">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
          )}
        </button>
        
        <span className="text-xs text-gray-600 w-7 sm:w-8">{formatTime(currentTime)}</span>
        
        <div className="flex-1 relative order-last sm:order-none w-full sm:w-auto mt-2 sm:mt-0">
          {/* Custom progress bar */}
          <div 
            ref={progressRef}
            className="h-1.5 bg-gray-300 rounded-full cursor-pointer relative"
            onClick={handleProgressBarClick}
          >
            {/* Progress fill */}
            <div 
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: '#660AF0' // Purple color matching the Generate button
              }}
            ></div>
            
            {/* Thumb/dot */}
            <div 
              className="absolute top-1/2 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm transform -translate-y-1/2"
              style={{ 
                left: getThumbPosition(),
                backgroundColor: '#1DB6FD' // Blue color matching the hover state
              }}
            ></div>
          </div>
          
          {/* Hidden range input for accessibility */}
          <input 
            type="range" 
            min="0" 
            max={duration || 0} 
            step="0.01"
            value={currentTime} 
            onChange={handleSeek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            aria-label="Seek"
          />
        </div>
        
        <span className="text-xs text-gray-600 w-7 sm:w-8">{formatTime(duration)}</span>
        
        <div className="relative">
          <button 
            className="text-xs px-2 py-1 bg-white border border-gray-300 rounded flex items-center"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          >
            <span>{playbackRate}x</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" className="ml-1" viewBox="0 0 16 16">
              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
            </svg>
          </button>
          
          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded shadow-lg z-10">
              {playbackRates.map(rate => (
                <button
                  key={rate}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${playbackRate === rate ? 'bg-purple-50 text-purple-700' : ''}`}
                  onClick={() => changePlaybackRate(rate)}
                >
                  {rate}x
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Download Button - Only visible for authorized user */}
        {canDownload && (
          <button 
            onClick={handleDownload}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-xs px-2 py-1 bg-green-100 border border-green-300 rounded hover:bg-green-200 transition-colors"
            title="Download Audio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#059669" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 