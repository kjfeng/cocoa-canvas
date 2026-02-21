import { useCanvasStore } from '../../store/canvasStore';
import type { Card } from '../../types';

interface Props {
  card: Card;
}

export default function CardHeader({ card }: Props) {
  const expandCard = useCanvasStore((s) => s.expandCard);
  const copyCard = useCanvasStore((s) => s.copyCard);
  const removeCard = useCanvasStore((s) => s.removeCard);
  const cards = useCanvasStore((s) => s.cards);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white sticky top-0 z-10">
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-stone-800 truncate">{card.title}</h2>
        <p className="text-sm text-stone-500 mt-0.5 truncate">{card.taskDescription}</p>
        {card.copiedFromId && cards[card.copiedFromId] && (
          <p className="text-xs text-cocoa-600 mt-1">
            Copied from: {cards[card.copiedFromId].title}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => copyCard(card.id)}
          className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          Copy
        </button>
        <button
          onClick={() => {
            expandCard(null);
            removeCard(card.id);
          }}
          className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          Delete
        </button>
        <button
          onClick={() => expandCard(null)}
          className="px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
          title="Close (Esc)"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
