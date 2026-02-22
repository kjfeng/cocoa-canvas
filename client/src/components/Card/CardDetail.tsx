import { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { Card } from '../../types';
import CardHeader from './CardHeader';
import Notebook from '../Notebook/Notebook';
import SidebarPanel from '../Notebook/SidebarPanel';
import { isCardOwner } from '../../utils/ownership';

interface Props {
  card: Card;
}

export default function CardDetail({ card }: Props) {
  const expandCard = useCanvasStore((s) => s.expandCard);
  const rootRef = useRef<HTMLDivElement>(null);
  // null = nothing selected, 'final' = final results, string = step id
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Prevent all wheel/mouse events from reaching the canvas underneath
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const stopWheel = (e: WheelEvent) => e.stopPropagation();
    const stopMouse = (e: MouseEvent) => e.stopPropagation();
    el.addEventListener('wheel', stopWheel, { passive: false });
    el.addEventListener('mousedown', stopMouse);
    el.addEventListener('mousemove', stopMouse);
    el.addEventListener('mouseup', stopMouse);
    return () => {
      el.removeEventListener('wheel', stopWheel);
      el.removeEventListener('mousedown', stopMouse);
      el.removeEventListener('mousemove', stopMouse);
      el.removeEventListener('mouseup', stopMouse);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedId) {
          setSelectedId(null);
        } else {
          expandCard(null);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [expandCard, selectedId]);

  // Auto-select a step when it starts running
  useEffect(() => {
    const runningStep = card.steps.find((s) => s.isRunning);
    if (runningStep) {
      setSelectedId(runningStep.id);
    }
  }, [card.steps]);

  // Auto-select final results when synthesizing
  useEffect(() => {
    if (card.isFinalResultRunning) {
      setSelectedId('final');
    }
  }, [card.isFinalResultRunning]);

  const selectedStep = selectedId && selectedId !== 'final'
    ? card.steps.find((s) => s.id === selectedId) ?? null
    : null;
  const selectedIndex = selectedStep
    ? card.steps.findIndex((s) => s.id === selectedStep.id)
    : -1;
  const showFinal = selectedId === 'final';

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 bg-white flex flex-col">
      <CardHeader card={card} />

      <div className="flex-1 flex min-h-0">
        {/* Left panel — step list */}
        <div className={`flex-shrink-0 border-r border-stone-100 overflow-y-auto transition-all ${
          selectedId ? 'w-1/2' : 'w-full max-w-2xl mx-auto'
        }`}>
          <Notebook
            card={card}
            selectedStepId={selectedId}
            onSelectStep={setSelectedId}
            isOwner={isCardOwner(card)}
          />
        </div>

        {/* Right panel — selected step result */}
        {selectedId && (
          <div className="flex-1 min-w-0 overflow-y-auto bg-stone-50/50">
            <SidebarPanel
              card={card}
              selectedStep={selectedStep}
              selectedIndex={selectedIndex}
              showFinal={showFinal}
              onClose={() => setSelectedId(null)}
              isOwner={isCardOwner(card)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
