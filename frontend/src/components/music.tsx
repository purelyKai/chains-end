import React, { useState, useEffect, useRef } from 'react';

const BackgroundMusic: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.log("Auto-play was prevented. Please interact with the page to enable audio.");
        });
      }
    };

    playAudio();
    document.addEventListener('click', playAudio, { once: true });

    return () => {
      document.removeEventListener('click', playAudio);
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed top-1 left-3 text-gray-700 z-50">
      <button 
        onClick={toggleMute}
        className="bg-transparent border-none cursor-pointer text-xl"
      >
        {isMuted ? '▶︎' : '⏸︎'}
      </button>
      <audio ref={audioRef} loop>
        <source src="/soundtrack.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default BackgroundMusic;