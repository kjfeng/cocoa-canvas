import { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { Card } from '../../types';
import MarkdownRenderer from '../Markdown/MarkdownRenderer';

interface Props {
  card: Card;
  onRunSynthesis: () => void;
}

export default function FinalResults({ card, onRunSynthesis }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const setFinalResult = useCanvasStore((s) => s.setFinalResult);

  const handleEdit = () => {
    setEditValue(card.finalResult || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    setFinalResult(card.id, editValue);
    setIsEditing(false);
  };

  return (
    <div className="mt-6 border-t-2 border-cocoa-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-700">Final Results</h3>
        <div className="flex gap-2">
          {card.finalResult && !isEditing && (
            <button
              onClick={handleEdit}
              className="text-xs text-stone-500 hover:text-stone-700"
            >
              Edit
            </button>
          )}
          <button
            onClick={onRunSynthesis}
            disabled={card.isFinalResultRunning}
            className="text-xs text-cocoa-600 hover:text-cocoa-800 disabled:opacity-50"
          >
            {card.finalResult ? 'Re-synthesize' : 'Synthesize'}
          </button>
        </div>
      </div>

      {card.isFinalResultRunning && !card.finalResult && (
        <div className="flex items-center gap-2 text-sm text-stone-400">
          <span className="w-3 h-3 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin" />
          Synthesizing...
        </div>
      )}

      {isEditing ? (
        <div>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full h-48 px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 resize-y focus:outline-none focus:ring-2 focus:ring-cocoa-300"
          />
          <div className="mt-2 flex gap-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs text-stone-500 hover:bg-stone-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-cocoa-600 text-white rounded hover:bg-cocoa-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : card.finalResult ? (
        <div className="prose prose-sm prose-stone max-w-none bg-white p-4 rounded-lg border border-stone-200">
          <MarkdownRenderer content={card.finalResult} />
          {card.isFinalResultRunning && (
            <span className="inline-block w-1.5 h-4 bg-cocoa-400 animate-pulse ml-0.5" />
          )}
        </div>
      ) : null}
    </div>
  );
}
