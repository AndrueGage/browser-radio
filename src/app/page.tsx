// app/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

const AudioStreamer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferQueueRef = useRef<AudioBuffer[]>([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000/api/socket');

    socket.binaryType = 'arraybuffer';

    socket.onopen = () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
    };

    socket.onmessage = (event) => {
      const audioData = event.data;
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      audioContextRef.current.decodeAudioData(audioData, (buffer) => {
        audioBufferQueueRef.current.push(buffer);
        playAudio();
      });
    };

    const playAudio = () => {
      if (audioBufferQueueRef.current.length > 0) {
        const buffer = audioBufferQueueRef.current.shift();
        if (audioContextRef.current && buffer) {
          const sourceNode = audioContextRef.current.createBufferSource();
          sourceNode.buffer = buffer;
          sourceNode.connect(audioContextRef.current.destination);
          sourceNode.start(0);
          sourceNode.onended = () => {
            playAudio(); // Play the next chunk in the queue
          };
        }
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket connection closed');
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <h1>Audio Streaming {isConnected ? 'Connected' : 'Disconnected'}</h1>
    </div>
  );
};

export default AudioStreamer;
