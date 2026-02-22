import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';

export const ydoc = new Y.Doc();
export const yCards = ydoc.getMap<string>('cards');

const roomName = window.location.hash.slice(1) || 'cocoa-canvas-default';

// Persist Y.Doc to IndexedDB so cards survive page reloads
export const indexeddbProvider = new IndexeddbPersistence(roomName, ydoc);

// Sync with peers via WebRTC
// Local signaling server (started via `npm run signaling`) + remote fallbacks
export const provider = new WebrtcProvider(roomName, ydoc, {
  signaling: [
    'ws://localhost:3333',
    'wss://y-webrtc-eu.fly.dev',
  ],
});

export const awareness = provider.awareness;
