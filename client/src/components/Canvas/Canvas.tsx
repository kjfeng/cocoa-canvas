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
  // Keep refs in sync for the wheel handler
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  panRef.current = pan;
  zoomRef.current = zoom;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
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

  // Zoom toward cursor position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const oldZoom = zoomRef.current;
      const factor = e.deltaY > 0 ? 0.93 : 1.07;
      const newZoom = Math.min(Math.max(oldZoom * factor, 0.1), 3);

      // Cursor position relative to the container
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      // Adjust pan so the world-point under the cursor stays fixed
      const oldPan = panRef.current;
      const newPanX = cx - (cx - oldPan.x) * (newZoom / oldZoom);
      const newPanY = cy - (cy - oldPan.y) * (newZoom / oldZoom);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const cardList = Object.values(cards).sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-stone-50"
      style={{
        backgroundImage:
          'radial-gradient(circle, #d4d0cc 1px, transparent 1px)',
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
