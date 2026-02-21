import { useCallback, useRef } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { streamStep, streamHelp, streamSynthesis, prefetchInputForm } from '../api/client';
import type { Card } from '../types';

export function useNotebook(card: Card) {
  const store = useCanvasStore.getState;
  const abortRef = useRef<AbortController | null>(null);

  const runAgentStep = useCallback(
    async (stepIndex: number) => {
      const currentCard = store().cards[card.id];
      if (!currentCard) return;
      const step = currentCard.steps[stepIndex];
      if (!step) return;

      const {
        setStepRunning,
        setStepResult,
        appendStepResult,
      } = store();

      setStepRunning(card.id, step.id, true);
      setStepResult(card.id, step.id, '');

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamStep(
          {
            taskDescription: currentCard.taskDescription,
            attachments: currentCard.attachments,
            steps: currentCard.steps.map((s) => ({
              description: s.description,
              assignment: s.assignment,
              result: s.result,
            })),
            currentStepIndex: stepIndex,
          },
          (chunk) => {
            store().appendStepResult(card.id, step.id, chunk);
          },
          controller.signal,
        );
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          store().appendStepResult(card.id, step.id, `\n\n**Error:** ${err.message}`);
        }
      } finally {
        store().setStepRunning(card.id, step.id, false);
        abortRef.current = null;
      }
    },
    [card.id],
  );

  const runSynthesis = useCallback(async () => {
    const currentCard = store().cards[card.id];
    if (!currentCard) return;

    const { setFinalResult, appendFinalResult, setFinalResultRunning } = store();
    setFinalResultRunning(card.id, true);
    setFinalResult(card.id, '');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamSynthesis(
        {
          taskDescription: currentCard.taskDescription,
          steps: currentCard.steps.map((s) => ({
            description: s.description,
            assignment: s.assignment,
            result: s.result,
          })),
        },
        (chunk) => {
          store().appendFinalResult(card.id, chunk);
        },
        controller.signal,
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        store().appendFinalResult(card.id, `\n\n**Error:** ${err.message}`);
      }
    } finally {
      store().setFinalResultRunning(card.id, false);
      abortRef.current = null;
    }
  }, [card.id]);

  const runAll = useCallback(async () => {
    const { setRunAllAbortCardId } = store();
    setRunAllAbortCardId(card.id);

    for (let i = 0; i < card.steps.length; i++) {
      // Check if aborted
      const currentState = store();
      if (currentState.runAllAbortCardId !== card.id) break;

      const currentCard = currentState.cards[card.id];
      if (!currentCard) break;
      const step = currentCard.steps[i];

      if (step.assignment === 'agent') {
        // Look ahead: if the next step is a user step, prefetch its form while the agent runs
        const nextStep = currentCard.steps[i + 1];
        if (nextStep && nextStep.assignment === 'user' && !nextStep.result) {
          prefetchInputForm(card.id, {
            taskDescription: currentCard.taskDescription,
            stepDescription: nextStep.description,
            stepIndex: i + 1,
            previousSteps: currentCard.steps.slice(0, i + 1).map((s) => ({
              description: s.description,
              assignment: s.assignment,
              result: s.result,
            })),
          });
        }
        await runAgentStep(i);
      } else {
        // User step — pause and wait. The user will submit, then we continue.
        // We do this by returning and letting the component re-invoke runAll
        // Actually, we just stop here. The Notebook component handles resuming.
        store().setRunAllAbortCardId(null);
        return i; // Return the index where we paused (user step)
      }
    }

    // All steps done — run synthesis
    const finalCard = store().cards[card.id];
    if (finalCard && finalCard.steps.every((s) => s.result !== null)) {
      await runSynthesis();
    }

    store().setRunAllAbortCardId(null);
    return -1; // completed
  }, [card.id, card.steps.length, runAgentStep, runSynthesis]);

  const stopAll = useCallback(() => {
    store().setRunAllAbortCardId(null);
    abortRef.current?.abort();
  }, []);

  return { runAgentStep, runSynthesis, runAll, stopAll };
}
