import { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import CanvasCard from './CanvasCard';
import CardCreator from './CardCreator';
import CardDetail from '../Card/CardDetail';

export default function Canvas() {
  const cards = useCanvasStore((s) => s.cards);
  const expandedCardId = useCanvasStore((s) => s.expandedCardId);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only pan on middle click or when clicking the canvas background
      if (e.button === 1 || (e.button === 0 && e.target === e.currentTarget)) {
        setIsPanning(true);
        panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        e.preventDefault();
      }
    },
    [pan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
    },
    [isPanning],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setZoom((z) => Math.min(Math.max(z * delta, 0.1), 3));
  }, []);

  // Attach non-passive wheel listener
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.95 : 1.05;
      setZoom((z) => Math.min(Math.max(z * delta, 0.1), 3));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const cardList = Object.values(cards).sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-stone-100"
      style={{
        backgroundImage:
          'radial-gradient(circle, #d6d3d1 1px, transparent 1px)',
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        cursor: isPanning ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {cardList.map((card) => (
          <CanvasCard key={card.id} card={card} />
        ))}
      </div>

      <CardCreator pan={pan} zoom={zoom} />

      {expandedCardId && cards[expandedCardId] && (
        <CardDetail card={cards[expandedCardId]} />
      )}
    </div>
  );
}
