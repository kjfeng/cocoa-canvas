import { useEffect } from 'react';
import Xarrow, { useXarrow } from 'react-xarrows';
import { useCanvasStore } from '../../store/canvasStore';

/** Triggers Xarrow recalculation when pan/zoom changes. */
export function XarrowPanZoomUpdater({ pan, zoom }: { pan: { x: number; y: number }; zoom: number }) {
  const updateXarrow = useXarrow();
  useEffect(() => {
    updateXarrow();
  }, [pan.x, pan.y, zoom, updateXarrow]);
  return null;
}

export default function ForkConnections() {
  const cards = useCanvasStore((s) => s.cards);

  const connections: { parentId: string; childId: string }[] = [];
  for (const card of Object.values(cards)) {
    if (card.forkedFromId && cards[card.forkedFromId]) {
      connections.push({ parentId: card.forkedFromId, childId: card.id });
    }
  }

  if (connections.length === 0) return null;

  return (
    <>
      {connections.map((c) => (
        <Xarrow
          key={`${c.parentId}-${c.childId}`}
          start={`card-${c.parentId}`}
          end={`card-${c.childId}`}
          color="#aaaaaa"
          strokeWidth={1.5}
          // dashness={{ strokeLen: 6, nonStrokeLen: 4 }}
          headSize={5}
          curveness={0.4}
          startAnchor="auto"
          endAnchor="auto"
          divContainerStyle={{ pointerEvents: 'none' }}
          SVGcanvasStyle={{ pointerEvents: 'none' }}
        />
      ))}
    </>
  );
}
