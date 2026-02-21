import { useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { Card } from '../../types';
import CardHeader from './CardHeader';
import Notebook from '../Notebook/Notebook';

interface Props {
  card: Card;
}

export default function CardDetail({ card }: Props) {
  const expandCard = useCanvasStore((s) => s.expandCard);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') expandCard(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [expandCard]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader card={card} />
        <div className="flex-1 overflow-y-auto">
          <Notebook card={card} />
        </div>
      </div>
    </div>
  );
}
