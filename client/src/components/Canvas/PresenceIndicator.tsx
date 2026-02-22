import { usePresence } from '../../collaboration/useAwareness';
import { useUserStore } from '../../store/userStore';

export default function PresenceIndicator() {
  const peers = usePresence();
  const myUserId = useUserStore((s) => s.userId);

  if (peers.length === 0) return null;

  // Put self first, then others
  const sorted = [...peers].sort((a, b) => {
    if (a.userId === myUserId) return -1;
    if (b.userId === myUserId) return 1;
    return a.userName.localeCompare(b.userName);
  });

  return (
    <div className="absolute top-3 right-3 z-40 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-stone-200/80 rounded-full px-2.5 py-1.5 shadow-sm">
      {sorted.map((peer, i) => (
        <div
          key={peer.userId + '-' + i}
          className="relative group"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white ring-2 ring-white"
            style={{ backgroundColor: peer.userColor }}
            title={peer.userId === myUserId ? `${peer.userName} (you)` : peer.userName}
          >
            {peer.userName.charAt(0).toUpperCase()}
          </div>
          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-stone-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {peer.userId === myUserId ? `${peer.userName} (you)` : peer.userName}
          </div>
        </div>
      ))}
    </div>
  );
}
