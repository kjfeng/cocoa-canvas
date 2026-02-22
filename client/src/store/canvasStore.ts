import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Card, Step, Attachment, StepAssignment } from '../types';
import { useUserStore } from './userStore';
import { isCardOwner } from '../utils/ownership';

interface CanvasState {
  cards: Record<string, Card>;
  expandedCardId: string | null;
  runAllAbortCardId: string | null; // card currently running "Run All"

  // Card CRUD
  addCard: (taskDescription: string, attachments: Attachment[], position: { x: number; y: number }) => string;
  removeCard: (cardId: string) => void;
  updateCardPosition: (cardId: string, position: { x: number; y: number }) => void;
  setCardTitle: (cardId: string, title: string) => void;
  setCardPlan: (cardId: string, title: string, steps: { description: string; assignment: StepAssignment }[]) => void;
  setCardGeneratingPlan: (cardId: string, generating: boolean) => void;
  forkCard: (cardId: string, selectedStepIndices: number[]) => string;
  expandCard: (cardId: string | null) => void;

  // Step CRUD
  addStep: (cardId: string, afterIndex: number) => void;
  removeStep: (cardId: string, stepId: string) => void;
  updateStepDescription: (cardId: string, stepId: string, description: string) => void;
  toggleStepAssignment: (cardId: string, stepId: string) => void;
  setStepResult: (cardId: string, stepId: string, result: string | null) => void;
  appendStepResult: (cardId: string, stepId: string, chunk: string) => void;
  setStepRunning: (cardId: string, stepId: string, running: boolean) => void;
  setStepStale: (cardId: string, stepId: string, stale: boolean) => void;
  markDownstreamStale: (cardId: string, stepIndex: number) => void;
  setStepUserAttachments: (cardId: string, stepId: string, attachments: Attachment[]) => void;

  // Final result
  setFinalResult: (cardId: string, result: string | null) => void;
  appendFinalResult: (cardId: string, chunk: string) => void;
  setFinalResultRunning: (cardId: string, running: boolean) => void;

  // Run All
  setRunAllAbortCardId: (cardId: string | null) => void;
}

export const useCanvasStore = create<CanvasState>()(
    (set, get) => ({
      cards: {},
      expandedCardId: null,
      runAllAbortCardId: null,

      addCard: (taskDescription, attachments, position) => {
        const id = nanoid();
        set((state) => ({
          cards: {
            ...state.cards,
            [id]: {
              id,
              title: 'New Task',
              taskDescription,
              attachments,
              steps: [],
              finalResult: null,
              isFinalResultRunning: false,
              isGeneratingPlan: false,
              forkedFromId: null,
              createdBy: useUserStore.getState().userId,
              createdByName: useUserStore.getState().userName,
              createdByColor: useUserStore.getState().userColor,
              position,
              createdAt: Date.now(),
            },
          },
        }));
        return id;
      },

      removeCard: (cardId) => {
        const card = get().cards[cardId];
        if (card && !isCardOwner(card)) return;
        set((state) => {
          const { [cardId]: _, ...rest } = state.cards;
          return {
            cards: rest,
            expandedCardId: state.expandedCardId === cardId ? null : state.expandedCardId,
          };
        });
      },

      updateCardPosition: (cardId, position) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: { ...state.cards[cardId], position },
          },
        }));
      },

      setCardTitle: (cardId, title) => {
        const card = get().cards[cardId];
        if (card && !isCardOwner(card)) return;
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: { ...state.cards[cardId], title },
          },
        }));
      },

      setCardPlan: (cardId, title, steps) => {
        const card = get().cards[cardId];
        if (card && !isCardOwner(card)) return;
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...state.cards[cardId],
              title,
              isGeneratingPlan: false,
              steps: steps.map((s) => ({
                id: nanoid(),
                description: s.description,
                assignment: s.assignment,
                result: null,
                isStale: false,
                isRunning: false,
                userAttachments: [],
              })),
            },
          },
        }));
      },

      setCardGeneratingPlan: (cardId, generating) => {
        const card = get().cards[cardId];
        if (card && !isCardOwner(card)) return;
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: { ...state.cards[cardId], isGeneratingPlan: generating },
          },
        }));
      },

      forkCard: (cardId, selectedStepIndices) => {
        const original = get().cards[cardId];
        if (!original) return '';
        const newId = nanoid();
        const selectedSteps = selectedStepIndices
          .sort((a, b) => a - b)
          .map((i) => original.steps[i])
          .filter(Boolean);
        const newCard: Card = {
          ...original,
          id: newId,
          forkedFromId: cardId,
          createdBy: useUserStore.getState().userId,
          createdByName: useUserStore.getState().userName,
          createdByColor: useUserStore.getState().userColor,
          position: { x: original.position.x + 40, y: original.position.y + 40 },
          createdAt: Date.now(),
          finalResult: null,
          isFinalResultRunning: false,
          isGeneratingPlan: false,
          steps: selectedSteps.map((s) => ({
            ...s,
            id: nanoid(),
            result: null,
            isStale: false,
            isRunning: false,
            userAttachments: [],
          })),
        };
        set((state) => ({
          cards: { ...state.cards, [newId]: newCard },
        }));
        return newId;
      },

      expandCard: (cardId) => {
        set({ expandedCardId: cardId });
      },

      addStep: (cardId, afterIndex) => {
        const existing = get().cards[cardId];
        if (existing && !isCardOwner(existing)) return;
        set((state) => {
          const card = state.cards[cardId];
          const newStep: Step = {
            id: nanoid(),
            description: '',
            assignment: 'agent',
            result: null,
            isStale: false,
            isRunning: false,
            userAttachments: [],
          };
          const steps = [...card.steps];
          steps.splice(afterIndex + 1, 0, newStep);
          return {
            cards: { ...state.cards, [cardId]: { ...card, steps } },
          };
        });
      },

      removeStep: (cardId, stepId) => {
        const existing = get().cards[cardId];
        if (existing && !isCardOwner(existing)) return;
        set((state) => {
          const card = state.cards[cardId];
          return {
            cards: {
              ...state.cards,
              [cardId]: { ...card, steps: card.steps.filter((s) => s.id !== stepId) },
            },
          };
        });
      },

      updateStepDescription: (cardId, stepId, description) => {
        const existing = get().cards[cardId];
        if (existing && !isCardOwner(existing)) return;
        set((state) => {
          const card = state.cards[cardId];
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                steps: card.steps.map((s) => (s.id === stepId ? { ...s, description } : s)),
              },
            },
          };
        });
      },

      toggleStepAssignment: (cardId, stepId) => {
        const existing = get().cards[cardId];
        if (existing && !isCardOwner(existing)) return;
        set((state) => {
          const card = state.cards[cardId];
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                steps: card.steps.map((s) =>
                  s.id === stepId
                    ? { ...s, assignment: s.assignment === 'agent' ? 'user' : 'agent' }
                    : s,
                ),
              },
            },
          };
        });
      },

      setStepResult: (cardId, stepId, result) => {
        const existing = get().cards[cardId];
        if (existing && !isCardOwner(existing)) return;
        set((state) => {
          const card = state.cards[cardId];
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                steps: card.steps.map((s) =>
                  s.id === stepId ? { ...s, result, isStale: false } : s,
                ),
              },
            },
          };
        });
      },

      appendStepResult: (cardId, stepId, chunk) => {
        const existing = get().cards[cardId];
        if (existing && !isCardOwner(existing)) return;
        set((state) => {
          const card = state.cards[cardId];
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                steps: card.steps.map((s) =>
                  s.id === stepId ? { ...s, result: (s.result || '') + chunk } : s,
                ),
              },
            },
          };
        });
      },

      setStepRunning: (cardId, stepId, running) => {
        const existing = get().cards[cardId];
        if (existing && !isCardOwner(existing)) return;
        set((state) => {
          const card = state.cards[cardId];
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                steps: card.steps.map((s) =>
                  s.id === stepId ? { ...s, isRunning: running } : s,
                ),
              },
            },
          };
        });
      },

      setStepStale: (cardId, stepId, stale) => {
        const existing = get().cards[cardId];
        if (existing && !isCardOwner(existing)) return;
        set((state) => {
          const card = state.cards[cardId];
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                steps: card.steps.map((s) =>
                  s.id === stepId ? { ...s, isStale: stale } : s,
                ),
              },
            },
          };
        });
      },

      markDownstreamStale: (cardId, stepIndex) => {
        const existing = get().cards[cardId];
        if (existing && !isCardOwner(existing)) return;
        set((state) => {
          const card = state.cards[cardId];
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                steps: card.steps.map((s, i) =>
                  i > stepIndex && s.result ? { ...s, isStale: true } : s,
                ),
              },
            },
          };
        });
      },

      setStepUserAttachments: (cardId, stepId, attachments) => {
        const existing = get().cards[cardId];
        if (existing && !isCardOwner(existing)) return;
        set((state) => {
          const card = state.cards[cardId];
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                steps: card.steps.map((s) =>
                  s.id === stepId ? { ...s, userAttachments: attachments } : s,
                ),
              },
            },
          };
        });
      },

      setFinalResult: (cardId, result) => {
        const card = get().cards[cardId];
        if (card && !isCardOwner(card)) return;
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: { ...state.cards[cardId], finalResult: result },
          },
        }));
      },

      appendFinalResult: (cardId, chunk) => {
        const existing = get().cards[cardId];
        if (existing && !isCardOwner(existing)) return;
        set((state) => {
          const card = state.cards[cardId];
          return {
            cards: {
              ...state.cards,
              [cardId]: { ...card, finalResult: (card.finalResult || '') + chunk },
            },
          };
        });
      },

      setFinalResultRunning: (cardId, running) => {
        const card = get().cards[cardId];
        if (card && !isCardOwner(card)) return;
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: { ...state.cards[cardId], isFinalResultRunning: running },
          },
        }));
      },

      setRunAllAbortCardId: (cardId) => {
        set({ runAllAbortCardId: cardId });
      },
    }),
);
