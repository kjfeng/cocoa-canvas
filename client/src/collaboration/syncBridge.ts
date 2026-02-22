import { useCanvasStore } from '../store/canvasStore';
import { yCards, ydoc, indexeddbProvider } from './yjsProvider';
import type { Card } from '../types';

let initialized = false;
let isSyncingFromYjs = false;

function syncYjsToZustand() {
  const yjsCards: Record<string, Card> = {};
  yCards.forEach((value, key) => {
    try {
      yjsCards[key] = JSON.parse(value);
    } catch {
      // skip malformed entries
    }
  });
  if (Object.keys(yjsCards).length > 0) {
    isSyncingFromYjs = true;
    useCanvasStore.setState({ cards: yjsCards });
    isSyncingFromYjs = false;
  }
}

export function initSync() {
  if (initialized) return;
  initialized = true;

  // When IndexedDB finishes loading, push persisted Yjs cards into Zustand
  indexeddbProvider.whenSynced.then(() => {
    syncYjsToZustand();
  });

  // Yjs → Zustand: observe remote changes (from peers or IndexedDB load)
  yCards.observe((event) => {
    isSyncingFromYjs = true;
    const currentCards = { ...useCanvasStore.getState().cards };

    event.changes.keys.forEach((change, key) => {
      if (change.action === 'add' || change.action === 'update') {
        const raw = yCards.get(key);
        if (raw) {
          try {
            currentCards[key] = JSON.parse(raw);
          } catch {
            // skip malformed
          }
        }
      } else if (change.action === 'delete') {
        delete currentCards[key];
      }
    });

    useCanvasStore.setState({ cards: currentCards });
    isSyncingFromYjs = false;
  });

  // Zustand → Yjs: subscribe to local changes
  useCanvasStore.subscribe((state, prevState) => {
    if (isSyncingFromYjs) return;

    const curr = state.cards;
    const prev = prevState.cards;
    if (curr === prev) return;

    ydoc.transact(() => {
      // Additions and updates
      for (const [id, card] of Object.entries(curr)) {
        if (!prev[id] || prev[id] !== card) {
          yCards.set(id, JSON.stringify(card));
        }
      }
      // Deletions
      for (const id of Object.keys(prev)) {
        if (!(id in curr)) {
          yCards.delete(id);
        }
      }
    });
  });
}
