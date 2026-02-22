import type { PeerCursor } from '../../collaboration/useAwareness';

interface Props {
  peers: PeerCursor[];
  pan: { x: number; y: number };
  zoom: number;
}

export default function CursorOverlay({ peers, pan, zoom }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {peers.map((peer) => {
        if (!peer.cursor) return null;
        const screenX = peer.cursor.x * zoom + pan.x;
        const screenY = peer.cursor.y * zoom + pan.y;
        return (
          <div
            key={peer.userId}
            className="absolute"
            style={{
              transform: `translate(${screenX}px, ${screenY}px)`,
              transition: 'transform 80ms linear',
            }}
          >
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill={peer.userColor}
              className="drop-shadow-sm"
            >
              <path d="M0 0L14 10.5L7.5 10.5L5 18Z" />
            </svg>
            <span
              className="absolute left-4 top-3 text-[11px] text-white px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-sm"
              style={{ backgroundColor: peer.userColor }}
            >
              {peer.userName}
            </span>
          </div>
        );
      })}
    </div>
  );
}
