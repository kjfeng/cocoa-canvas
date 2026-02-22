import { useState, useCallback } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { useNotebook } from '../../hooks/useNotebook';
import { prefetchInputForm } from '../../api/client';
import type { Card } from '../../types';
import Step from './Step';
import { Play, Square, Plus, Loader2, Pause, Sparkles, Check } from 'lucide-react';

interface Props {
  card: Card;
  selectedStepId: string | null;
  onSelectStep: (id: string | null) => void;
  isOwner: boolean;
}

export default function Notebook({ card, selectedStepId, onSelectStep, isOwner }: Props) {
  const { runAgentStep, runSynthesis, runAll, stopAll } = useNotebook(card);
  const runAllAbortCardId = useCanvasStore((s) => s.runAllAbortCardId);
  const addStep = useCanvasStore((s) => s.addStep);
  const isRunningAll = runAllAbortCardId === card.id;
  const [pausedAtIndex, setPausedAtIndex] = useState<number | null>(null);

  const prefetchFormForStep = useCallback((stepIndex: number) => {
    const currentCard = useCanvasStore.getState().cards[card.id];
    if (!currentCard) return;
    const step = currentCard.steps[stepIndex];
    if (!step || step.assignment !== 'user') return;
    prefetchInputForm(card.id, {
      taskDescription: currentCard.taskDescription,
      stepDescription: step.description,
      stepIndex,
      previousSteps: currentCard.steps.slice(0, stepIndex).map((s) => ({
        description: s.description,
        assignment: s.assignment,
        result: s.result,
      })),
    });
  }, [card.id]);

  const handleRunAll = useCallback(async () => {
    const result = await runAll();
    if (result !== undefined && result >= 0) {
      setPausedAtIndex(result);
      prefetchFormForStep(result);
    } else {
      setPausedAtIndex(null);
    }
  }, [runAll, prefetchFormForStep]);

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
          prefetchFormForStep(i);
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
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <Loader2 size={16} className="animate-spin text-stone-400" />
          <span className="text-sm text-stone-500">Generating plan...</span>
        </div>
        <div className="space-y-2.5">
          {[0.92, 0.75, 0.85, 0.6].map((w, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-stone-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-stone-100 rounded animate-pulse" style={{ width: `${w * 100}%` }} />
                {i === 0 && <div className="h-2.5 bg-stone-50 rounded animate-pulse w-1/3" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (card.steps.length === 0) {
    return (
      <div className="p-8 text-center text-stone-400 text-sm">
        No steps yet. This card may still be loading.
      </div>
    );
  }

  const allStepsComplete = card.steps.every((s) => s.result !== null);
  const anyStepRunning = card.steps.some((s) => s.isRunning);

  return (
    <div className="p-5">
      {/* Controls */}
      {isOwner && (
        <div className="flex items-center gap-2.5 mb-4">
          {isRunningAll ? (
            <button
              onClick={stopAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors active:scale-95"
            >
              <Square size={13} fill="currentColor" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleRunAll}
              disabled={anyStepRunning}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-stone-800 hover:bg-stone-900 text-white rounded-lg transition-all disabled:opacity-40 active:scale-95"
            >
              <Play size={13} fill="currentColor" />
              Run All
            </button>
          )}
          {pausedAtIndex !== null && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
              <Pause size={11} />
              Waiting for input on step {pausedAtIndex + 1}
            </span>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="space-y-1.5">
        {card.steps.map((step, index) => (
          <Step
            key={step.id}
            card={card}
            step={step}
            index={index}
            isSelected={selectedStepId === step.id}
            onSelect={() => onSelectStep(selectedStepId === step.id ? null : step.id)}
            onRunAgent={() => runAgentStep(index)}
            isPausedHere={pausedAtIndex === index}
            onUserSubmit={() => {
              if (pausedAtIndex === index) {
                handleResumeAfterUser(index);
              }
            }}
            isOwner={isOwner}
          />
        ))}
      </div>

      {/* Add step */}
      {isOwner && (
        <button
          onClick={() => addStep(card.id, card.steps.length - 1)}
          className="mt-2 w-full py-1.5 text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg border border-dashed border-stone-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus size={13} />
          Add step
        </button>
      )}

      {/* Final Results entry */}
      {(allStepsComplete || card.finalResult !== null) && (
        <button
          onClick={() => onSelectStep(selectedStepId === 'final' ? null : 'final')}
          className={`mt-4 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
            selectedStepId === 'final'
              ? 'bg-amber-50 ring-1 ring-amber-200'
              : 'hover:bg-stone-50 ring-1 ring-stone-200/80'
          }`}
        >
          <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
            {card.isFinalResultRunning ? <Loader2 size={13} className="animate-spin" /> : card.finalResult ? <Check size={13} strokeWidth={2.5} /> : <Sparkles size={13} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-stone-700">Final Results</p>
            {card.finalResult && (
              <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{card.finalResult.slice(0, 100)}</p>
            )}
            {card.isFinalResultRunning && !card.finalResult && (
              <p className="text-xs text-stone-400 mt-0.5">Synthesizing...</p>
            )}
            {!card.finalResult && !card.isFinalResultRunning && (
              <p className="text-xs text-stone-400 mt-0.5">Click to synthesize all results</p>
            )}
          </div>
        </button>
      )}
    </div>
  );
}
