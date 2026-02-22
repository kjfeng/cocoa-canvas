import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { notebooksRouter } from './routes/notebooks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try multiple possible .env locations (works for both tsx dev and compiled dist/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/notebooks', notebooksRouter);

// Create HTTP server so we can attach WebSocket to the same port
const server = http.createServer(app);

// --- y-webrtc signaling server ---
const wss = new WebSocketServer({ noServer: true });
const topics = new Map<string, Set<import('ws').WebSocket>>();

const send = (conn: import('ws').WebSocket, message: object) => {
  if (conn.readyState === 0 || conn.readyState === 1) {
    try {
      conn.send(JSON.stringify(message));
    } catch {
      conn.close();
    }
  }
};

wss.on('connection', (conn) => {
  const subscribedTopics = new Set<string>();
  let closed = false;
  let pongReceived = true;

  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      conn.close();
      clearInterval(pingInterval);
    } else {
      pongReceived = false;
      try { conn.ping(); } catch { conn.close(); }
    }
  }, 30000);

  conn.on('pong', () => { pongReceived = true; });

  conn.on('close', () => {
    subscribedTopics.forEach((topicName) => {
      const subs = topics.get(topicName);
      if (subs) {
        subs.delete(conn);
        if (subs.size === 0) topics.delete(topicName);
      }
    });
    subscribedTopics.clear();
    closed = true;
    clearInterval(pingInterval);
  });

  conn.on('message', (data) => {
    let message: any;
    try {
      message = JSON.parse(typeof data === 'string' ? data : data.toString());
    } catch { return; }
    if (!message?.type || closed) return;

    switch (message.type) {
      case 'subscribe':
        (message.topics || []).forEach((topicName: string) => {
          if (typeof topicName === 'string') {
            if (!topics.has(topicName)) topics.set(topicName, new Set());
            topics.get(topicName)!.add(conn);
            subscribedTopics.add(topicName);
          }
        });
        break;
      case 'unsubscribe':
        (message.topics || []).forEach((topicName: string) => {
          const subs = topics.get(topicName);
          if (subs) subs.delete(conn);
        });
        break;
      case 'publish':
        if (message.topic) {
          const receivers = topics.get(message.topic);
          if (receivers) {
            message.clients = receivers.size;
            receivers.forEach((receiver) => send(receiver, message));
          }
        }
        break;
      case 'ping':
        send(conn, { type: 'pong' });
        break;
    }
  });
});

// Handle WebSocket upgrade on /ws-signaling path
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws-signaling') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (API + WebSocket signaling)`);
});
