import { useState, useEffect, useCallback } from 'react';
import { awareness } from './yjsProvider';
import { useUserStore } from '../store/userStore';

export interface PeerCursor {
  userId: string;
  userName: string;
  userColor: string;
  cursor: { x: number; y: number } | null;
}

export interface PeerState {
  userId: string;
  userName: string;
  userColor: string;
}

function readPeers(): PeerCursor[] {
  const states: PeerCursor[] = [];
  awareness.getStates().forEach((state, clientId) => {
    if (clientId === awareness.clientID) return;
    if (state.user) states.push(state.user as PeerCursor);
  });
  return states;
}

export function useAwareness() {
  const userId = useUserStore((s) => s.userId);
  const userName = useUserStore((s) => s.userName);
  const userColor = useUserStore((s) => s.userColor);
  const [peers, setPeers] = useState<PeerCursor[]>([]);

  const refresh = useCallback(() => {
    setPeers(readPeers());
  }, []);

  useEffect(() => {
    // Set local awareness state
    awareness.setLocalStateField('user', { userId, userName, userColor, cursor: null });

    // Read any pre-existing peers
    refresh();

    // Listen to both 'change' and 'update' for maximum reliability
    awareness.on('change', refresh);
    awareness.on('update', refresh);
    return () => {
      awareness.off('change', refresh);
      awareness.off('update', refresh);
    };
  }, [userId, userName, userColor, refresh]);

  return peers;
}

/** Returns all connected peers (including self) for the presence indicator. */
export function usePresence(): PeerState[] {
  const userId = useUserStore((s) => s.userId);
  const userName = useUserStore((s) => s.userName);
  const userColor = useUserStore((s) => s.userColor);
  const [allPeers, setAllPeers] = useState<PeerState[]>([]);

  const refresh = useCallback(() => {
    const states: PeerState[] = [];
    awareness.getStates().forEach((state) => {
      if (state.user) {
        states.push({
          userId: state.user.userId,
          userName: state.user.userName,
          userColor: state.user.userColor,
        });
      }
    });
    setAllPeers(states);
  }, []);

  useEffect(() => {
    awareness.setLocalStateField('user', { userId, userName, userColor, cursor: null });
    refresh();
    awareness.on('change', refresh);
    awareness.on('update', refresh);
    return () => {
      awareness.off('change', refresh);
      awareness.off('update', refresh);
    };
  }, [userId, userName, userColor, refresh]);

  return allPeers;
}
