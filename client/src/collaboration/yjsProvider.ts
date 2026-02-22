import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';

export const ydoc = new Y.Doc();
export const yCards = ydoc.getMap<string>('cards');

const roomName = window.location.hash.slice(1) || 'cocoa-canvas-default';

// Persist Y.Doc to IndexedDB so cards survive page reloads
export const indexeddbProvider = new IndexeddbPersistence(roomName, ydoc);

// Build signaling URL:
// - In production, VITE_SERVER_URL points to the Railway server (e.g. https://foo.railway.app)
// - In dev, Vite proxies /ws-signaling to the Express server on port 3001
const serverUrl = import.meta.env.VITE_SERVER_URL;
let signalingUrl: string;
if (serverUrl) {
  // Convert http(s) URL to ws(s) URL
  signalingUrl = serverUrl.replace(/^http/, 'ws') + '/ws-signaling';
} else {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  signalingUrl = `${wsProtocol}//${window.location.host}/ws-signaling`;
}

export const provider = new WebrtcProvider(roomName, ydoc, {
  signaling: [signalingUrl],
});

export const awareness = provider.awareness;
