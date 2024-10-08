import { NextResponse } from 'next/server';
import { Server } from 'ws';
import fs from 'fs';
import path from 'path';

const audioFilePath = path.join(process.cwd(), 'public', 'minecraft-audio.mp3'); // Adjust the path to your audio file

const wsServer = new Server({ noServer: true });

wsServer.on('connection', (socket: any) => {
  console.log('Client connected');

  const audioStream = fs.createReadStream(audioFilePath);
  
  audioStream.on('data', (chunk) => {
    if (socket.readyState === socket.OPEN) {
      socket.send(chunk);
    }
  });

  audioStream.on('end', () => {
    console.log('Audio stream ended');
    socket.close();
  });

  socket.on('close', () => {
    console.log('Client disconnected');
    audioStream.destroy();
  });
});

export function GET(req: Request) {
  return NextResponse.json({ message: 'WebSocket ready' });
}

export const config = {
  api: {
    bodyParser: false,
    // Enable streaming
    externalResolver: true,
  },
};
