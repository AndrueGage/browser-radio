'use client';

import { useEffect, useRef } from 'react';

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const socket = new WebSocket('wss://localhost:3000/api/socket');
    
    socket.binaryType = 'arraybuffer';

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      if (audioRef.current) {
        const blob = new Blob([event.data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        audioRef.current.src = url;
        audioRef.current.play();
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (socket.readyState === 1) { // <-- This is important
          socket.close();
      }
  }
}, []);

  return <audio ref={audioRef} controls />;
};

export default AudioPlayer;
