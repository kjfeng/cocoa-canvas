import { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { Card } from '../../types';
import { GitFork, Trash2, ArrowLeft, Link } from 'lucide-react';
import ForkDialog from './ForkDialog';
import { isCardOwner } from '../../utils/ownership';

interface Props {
  card: Card;
}

export default function CardHeader({ card }: Props) {
  const expandCard = useCanvasStore((s) => s.expandCard);
  const removeCard = useCanvasStore((s) => s.removeCard);
  const cards = useCanvasStore((s) => s.cards);
  const [showForkDialog, setShowForkDialog] = useState(false);
  const isOwner = isCardOwner(card);

  return (
    <>
      <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => expandCard(null)}
            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors flex-shrink-0"
            title="Back to canvas"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-stone-800 truncate">{card.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {card.createdByName && (
                <span className="inline-flex items-center gap-1 flex-shrink-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-medium text-white"
                    style={{ backgroundColor: card.createdByColor || '#94a3b8' }}
                  >
                    {card.createdByName.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-[11px] text-stone-400">{card.createdByName}</span>
                </span>
              )}
              <p className="text-xs text-stone-400 truncate">{card.taskDescription}</p>
              {card.forkedFromId && cards[card.forkedFromId] && (
                <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 flex-shrink-0">
                  <Link size={9} />
                  {cards[card.forkedFromId].title}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 ml-4">
          <button
            onClick={() => setShowForkDialog(true)}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            title="Fork card"
          >
            <GitFork size={14} />
          </button>
          <button
            onClick={() => {
              expandCard(null);
              removeCard(card.id);
            }}
            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete card"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {showForkDialog && (
        <ForkDialog card={card} onClose={() => setShowForkDialog(false)} />
      )}
    </>
  );
}
