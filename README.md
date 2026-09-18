# Cocoa Canvas

A collaborative canvas where users and AI work together through interactive agent notebooks. Create cards on a shared canvas, each containing a step-by-step notebook that interleaves agent and user tasks. Supports real-time multiplayer collaboration via Yjs + WebRTC.

## Prerequisites

- Node.js 18+
- An Anthropic or OpenAI API key. Note that Anthropic models are called through Amazon Bedrock (feel free to fork and change this).

## Setup

### Server

```bash
cd server
npm install
```

Create a `.env` file:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

Start the dev server:

```bash
npm run dev
```

The server runs on `http://localhost:3001`.

### Client

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and proxies API requests to the server.

## Multiplayer

Open the same URL in multiple browser tabs or share the URL with others on the same network. Each user picks a display name on first visit. Cards are synced in real time and cursors are visible across peers.

To create a separate room, add a hash to the URL (e.g. `http://localhost:5173#my-room`).
