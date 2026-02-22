import { useRef, useCallback, useState } from 'react';
import { useXarrow } from 'react-xarrows';
import { useCanvasStore } from '../../store/canvasStore';
import type { Card } from '../../types';
import CardSummary from '../Card/CardSummary';

interface Props {
  card: Card;
}

export default function CanvasCard({ card }: Props) {
  const updateCardPosition = useCanvasStore((s) => s.updateCardPosition);
  const updateXarrow = useXarrow();
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      // Don't drag if clicking interactive elements
      if ((e.target as HTMLElement).closest('button, input, textarea, [data-no-drag]')) return;
      isDragging.current = true;
      setDragging(true);
      dragOffset.current = {
        x: e.clientX - card.position.x,
        y: e.clientY - card.position.y,
      };

      const handleMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        // Account for canvas zoom by getting the transform
        const canvas = document.querySelector('[style*="transformOrigin"]') as HTMLElement;
        const zoom = canvas ? parseFloat(canvas.style.transform.match(/scale\(([^)]+)\)/)?.[1] || '1') : 1;
        updateCardPosition(card.id, {
          x: (ev.clientX - dragOffset.current.x),
          y: (ev.clientY - dragOffset.current.y),
        });
        updateXarrow();
      };

      const handleUp = () => {
        isDragging.current = false;
        setDragging(false);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      e.stopPropagation();
    },
    [card.id, card.position, updateCardPosition],
  );

  return (
    <div
      id={`card-${card.id}`}
      data-card-id={card.id}
      className={`absolute select-none ${dragging ? 'z-50' : 'z-10'}`}
      style={{
        left: card.position.x,
        top: card.position.y,
        transition: dragging ? 'none' : 'box-shadow 0.2s',
      }}
      onMouseDown={handleMouseDown}
    >
      <CardSummary card={card} />
    </div>
  );
}
