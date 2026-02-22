import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCanvasStore } from '../../store/canvasStore';
import type { Card } from '../../types';
import { GitFork, Bot, User, X, Check } from 'lucide-react';

interface Props {
  card: Card;
  onClose: () => void;
}

export default function ForkDialog({ card, onClose }: Props) {
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(card.steps.map((_, i) => i)),
  );
  const forkCard = useCanvasStore((s) => s.forkCard);

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === card.steps.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(card.steps.map((_, i) => i)));
    }
  };

  const handleFork = () => {
    if (selected.size === 0) return;
    forkCard(card.id, Array.from(selected));
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <GitFork size={16} className="text-stone-600" />
            <h3 className="text-sm font-semibold text-stone-800">Fork card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Description */}
        <div className="px-5 pt-3 pb-2">
          <p className="text-xs text-stone-500">
            Select which steps to include in the new card. Outputs will not carry over.
          </p>
        </div>

        {/* Select all */}
        <div className="px-5 py-2">
          <button
            onClick={toggleAll}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors"
          >
            {selected.size === card.steps.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        {/* Steps list */}
        <div className="px-5 pb-3 max-h-72 overflow-y-auto">
          <div className="space-y-1">
            {card.steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => toggle(index)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                  selected.has(index)
                    ? 'bg-sky-50 ring-1 ring-sky-200'
                    : 'bg-stone-50 hover:bg-stone-100 ring-1 ring-stone-200/60'
                }`}
              >
                {/* Checkbox */}
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected.has(index)
                      ? 'bg-sky-500 text-white'
                      : 'bg-white border border-stone-300'
                  }`}
                >
                  {selected.has(index) && <Check size={12} strokeWidth={2.5} />}
                </span>

                {/* Step info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-stone-400 font-medium">{index + 1}.</span>
                    <span className="text-sm text-stone-700 truncate">
                      {step.description || 'Untitled step'}
                    </span>
                  </div>
                </div>

                {/* Assignment badge */}
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded font-medium flex-shrink-0 ${
                    step.assignment === 'agent'
                      ? 'bg-violet-50 text-violet-600'
                      : 'bg-sky-50 text-sky-600'
                  }`}
                >
                  {step.assignment === 'agent' ? <Bot size={9} /> : <User size={9} />}
                  {step.assignment === 'agent' ? 'Agent' : 'User'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-stone-100 bg-stone-50/50">
          <span className="text-xs text-stone-400">
            {selected.size} of {card.steps.length} steps selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-sm text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFork}
              disabled={selected.size === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-stone-800 hover:bg-stone-900 text-white rounded-lg transition-all disabled:opacity-40 active:scale-95"
            >
              <GitFork size={13} />
              Fork
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
