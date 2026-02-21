import { useState, useCallback } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { useNotebook } from '../../hooks/useNotebook';
import type { Card } from '../../types';
import Step from './Step';
import FinalResults from './FinalResults';

interface Props {
  card: Card;
}

export default function Notebook({ card }: Props) {
  const { runAgentStep, runSynthesis, runAll, stopAll } = useNotebook(card);
  const runAllAbortCardId = useCanvasStore((s) => s.runAllAbortCardId);
  const addStep = useCanvasStore((s) => s.addStep);
  const isRunningAll = runAllAbortCardId === card.id;
  const [pausedAtIndex, setPausedAtIndex] = useState<number | null>(null);

  const handleRunAll = useCallback(async () => {
    const result = await runAll();
    if (result !== undefined && result >= 0) {
      setPausedAtIndex(result);
    } else {
      setPausedAtIndex(null);
    }
  }, [runAll]);

  const handleResumeAfterUser = useCallback(
    async (fromIndex: number) => {
      const store = useCanvasStore.getState();
      store.setRunAllAbortCardId(card.id);
      setPausedAtIndex(null);

      for (let i = fromIndex + 1; i < card.steps.length; i++) {
        const currentState = useCanvasStore.getState();
        if (currentState.runAllAbortCardId !== card.id) break;

        const currentCard = currentState.cards[card.id];
        if (!currentCard) break;
        const step = currentCard.steps[i];

        if (step.assignment === 'agent') {
          await runAgentStep(i);
        } else {
          store.setRunAllAbortCardId(null);
          setPausedAtIndex(i);
          return;
        }
      }

      const finalCard = useCanvasStore.getState().cards[card.id];
      if (finalCard && finalCard.steps.every((s) => s.result !== null)) {
        await runSynthesis();
      }
      store.setRunAllAbortCardId(null);
    },
    [card.id, card.steps.length, runAgentStep, runSynthesis],
  );

  if (card.isGeneratingPlan) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500">
          <span className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          <span>Generating plan...</span>
        </div>
      </div>
    );
  }

  if (card.steps.length === 0) {
    return (
      <div className="p-6 text-center text-stone-400 text-sm">
        No steps yet. This card may still be loading.
      </div>
    );
  }

  const allStepsComplete = card.steps.every((s) => s.result !== null);
  const anyStepRunning = card.steps.some((s) => s.isRunning);

  return (
    <div className="p-6">
      {/* Controls */}
      <div className="flex items-center gap-2 mb-4">
        {isRunningAll ? (
          <button
            onClick={stopAll}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleRunAll}
            disabled={anyStepRunning}
            className="px-4 py-2 text-sm bg-cocoa-600 hover:bg-cocoa-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Run All
          </button>
        )}
        {pausedAtIndex !== null && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Paused at step {pausedAtIndex + 1} (awaiting your input)
          </span>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {card.steps.map((step, index) => (
          <Step
            key={step.id}
            card={card}
            step={step}
            index={index}
            onRunAgent={() => runAgentStep(index)}
            isPausedHere={pausedAtIndex === index}
            onUserSubmit={() => {
              if (pausedAtIndex === index) {
                handleResumeAfterUser(index);
              }
            }}
          />
        ))}
      </div>

      {/* Add step button */}
      <button
        onClick={() => addStep(card.id, card.steps.length - 1)}
        className="mt-3 w-full py-2 text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg border border-dashed border-stone-200 transition-colors"
      >
        + Add step
      </button>

      {/* Final Results */}
      {(allStepsComplete || card.finalResult !== null) && (
        <FinalResults card={card} onRunSynthesis={runSynthesis} />
      )}
    </div>
  );
}
