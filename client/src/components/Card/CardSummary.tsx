import { useCanvasStore } from '../../store/canvasStore';
import type { Card } from '../../types';

interface Props {
  card: Card;
}

export default function CardSummary({ card }: Props) {
  const expandCard = useCanvasStore((s) => s.expandCard);
  const removeCard = useCanvasStore((s) => s.removeCard);
  const copyCard = useCanvasStore((s) => s.copyCard);
  const cards = useCanvasStore((s) => s.cards);

  const completedSteps = card.steps.filter((s) => s.result !== null).length;
  const totalSteps = card.steps.length;

  return (
    <div className="w-72 bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-stone-800 text-sm leading-tight truncate flex-1">
            {card.title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeCard(card.id);
            }}
            className="text-stone-400 hover:text-red-500 text-xs flex-shrink-0"
            title="Delete card"
          >
            ✕
          </button>
        </div>

        {card.isGeneratingPlan && (
          <div className="text-xs text-stone-500 flex items-center gap-1.5 mb-2">
            <span className="inline-block w-3 h-3 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            Generating plan...
          </div>
        )}

        {totalSteps > 0 && (
          <>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>{completedSteps} / {totalSteps} steps</span>
                {card.finalResult && <span className="text-green-600 font-medium">Complete</span>}
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cocoa-500 rounded-full transition-all"
                  style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              {card.steps.slice(0, 4).map((step, i) => (
                <div key={step.id} className="flex items-center gap-1.5 text-xs text-stone-600">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                    step.result !== null
                      ? 'bg-green-100 text-green-700'
                      : step.isRunning
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-stone-100 text-stone-500'
                  }`}>
                    {step.result !== null ? '✓' : i + 1}
                  </span>
                  <span className="truncate">{step.description || 'Untitled step'}</span>
                </div>
              ))}
              {card.steps.length > 4 && (
                <div className="text-xs text-stone-400 pl-5">
                  +{card.steps.length - 4} more steps
                </div>
              )}
            </div>
          </>
        )}

        {card.copiedFromId && cards[card.copiedFromId] && (
          <div className="mt-2 text-xs text-stone-400">
            Copied from: <span className="text-cocoa-600">{cards[card.copiedFromId].title}</span>
          </div>
        )}
      </div>

      <div className="border-t border-stone-100 flex">
        <button
          onClick={() => expandCard(card.id)}
          className="flex-1 py-2 text-xs text-stone-600 hover:bg-stone-50 transition-colors font-medium"
        >
          Open
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyCard(card.id);
          }}
          className="flex-1 py-2 text-xs text-stone-600 hover:bg-stone-50 transition-colors border-l border-stone-100"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
