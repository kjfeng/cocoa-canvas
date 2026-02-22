import { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { Card } from '../../types';
import { Expand, GitFork, Trash2, Check, Loader2, Link, Sparkles } from 'lucide-react';
import ForkDialog from './ForkDialog';
import { isCardOwner } from '../../utils/ownership';

interface Props {
  card: Card;
}

export default function CardSummary({ card }: Props) {
  const expandCard = useCanvasStore((s) => s.expandCard);
  const removeCard = useCanvasStore((s) => s.removeCard);
  const cards = useCanvasStore((s) => s.cards);
  const [showForkDialog, setShowForkDialog] = useState(false);
  const isOwner = isCardOwner(card);

  const completedSteps = card.steps.filter((s) => s.result !== null).length;
  const totalSteps = card.steps.length;

  return (
    <>
    <div className="w-72 bg-white rounded-xl shadow-sm border border-stone-200/80 overflow-hidden hover:shadow-md transition-all group">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-medium text-stone-800 text-sm leading-snug line-clamp-2 flex-1">
            {card.title}
          </h3>
          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeCard(card.id);
              }}
              className="text-stone-300 hover:text-red-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all"
              title="Delete card"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {card.createdByName && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium text-white flex-shrink-0"
              style={{ backgroundColor: card.createdByColor || '#94a3b8' }}
            >
              {card.createdByName.charAt(0).toUpperCase()}
            </span>
            <span className="text-[11px] text-stone-400 truncate">{card.createdByName}</span>
          </div>
        )}

        {card.forkedFromId && cards[card.forkedFromId] && (
          <div className="flex items-center gap-1 text-[11px] text-stone-400 mb-2">
            <Link size={10} />
            <span className="truncate">{cards[card.forkedFromId].title}</span>
          </div>
        )}

        {card.isGeneratingPlan && (
          <div className="text-xs text-stone-500 flex items-center gap-1.5 mb-2">
            <Loader2 size={12} className="animate-spin" />
            Generating plan...
          </div>
        )}

        {totalSteps > 0 && (
          <>
            <div className="mb-2.5">
              <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                <span>{completedSteps} of {totalSteps} steps</span>
                {card.finalResult && (
                  <span className="text-emerald-500 font-medium flex items-center gap-0.5">
                    <Check size={11} />
                    Done
                  </span>
                )}
              </div>
              <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-stone-700 rounded-full transition-all duration-500"
                  style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              {card.steps.slice(0, 3).map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 text-xs text-stone-500">
                  <span className={`w-[18px] h-[18px] rounded-md flex items-center justify-center text-[10px] flex-shrink-0 font-medium ${
                    step.result !== null
                      ? 'bg-emerald-50 text-emerald-600'
                      : step.isRunning
                        ? 'bg-blue-50 text-blue-500'
                        : 'bg-stone-50 text-stone-400'
                  }`}>
                    {step.result !== null ? <Check size={10} /> : i + 1}
                  </span>
                  <span className="truncate">{step.description || 'Untitled step'}</span>
                </div>
              ))}
              {card.steps.length > 3 && (
                <p className="text-[11px] text-stone-400 pl-[26px]">
                  +{card.steps.length - 3} more
                </p>
              )}
            </div>
          </>
        )}

        {card.finalResult && (
          <div className="mt-3 p-2.5 bg-amber-50/60 border border-amber-100 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={11} className="text-amber-500 flex-shrink-0" />
              <span className="text-[11px] font-medium text-amber-600">Final Result</span>
            </div>
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {card.finalResult
                .replace(/^#{1,6}\s+/gm, '')
                .replace(/\*\*|__/g, '')
                .replace(/\*|_/g, '')
                .replace(/`{1,3}[^`]*`{1,3}/g, '')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/\n+/g, ' ')
                .trim()
                .slice(0, 200)}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-stone-100 flex divide-x divide-stone-100">
        <button
          onClick={() => expandCard(card.id)}
          className="flex-1 py-2 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 font-medium"
        >
          <Expand size={12} />
          Open
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowForkDialog(true);
          }}
          className="flex-1 py-2 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <GitFork size={12} />
          Fork
        </button>
      </div>
    </div>
    {showForkDialog && (
      <ForkDialog card={card} onClose={() => setShowForkDialog(false)} />
    )}
    </>
  );
}
