// pages/api/socket.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'ws';
import { createReadStream } from 'fs';
import { join } from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (res.socket.server.wss) {
    console.log('WebSocket server already running');
    res.end();
    return;
  }

  // Initialize the WebSocket server
  const wss = new Server({ noServer: true });

  // Attach the WebSocket server to the Next.js HTTP server
  res.socket.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    // Stream audio file in chunks
    const audioFilePath = join(process.cwd(), 'public', 'large-audio-file.mp3');
    const audioStream = createReadStream(audioFilePath, { highWaterMark: 64 * 1024 });

    audioStream.on('data', (chunk) => {
      ws.send(chunk);
    });

    audioStream.on('end', () => {
      ws.close();
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      audioStream.destroy(); // Clean up the stream when client disconnects
    });
  });

  // Mark the WebSocket server as already initialized
  res.socket.server.wss = wss;
  res.end();
}
