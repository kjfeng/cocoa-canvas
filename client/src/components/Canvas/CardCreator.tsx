import { useState, useRef, useCallback } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { generatePlan } from '../../api/client';
import type { Attachment } from '../../types';
import { nanoid } from 'nanoid';

interface Props {
  pan: { x: number; y: number };
  zoom: number;
}

export default function CardCreator({ pan, zoom }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addCard = useCanvasStore((s) => s.addCard);
  const setCardPlan = useCanvasStore((s) => s.setCardPlan);
  const setCardGeneratingPlan = useCanvasStore((s) => s.setCardGeneratingPlan);
  const expandCard = useCanvasStore((s) => s.expandCard);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setAttachments((prev) => [
          ...prev,
          { id: nanoid(), name: file.name, type: file.type, data: base64 },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, []);

  const handleCreate = async () => {
    if (!taskDescription.trim()) return;
    setIsCreating(true);

    // Place card near center of viewport
    const x = (window.innerWidth / 2 - pan.x) / zoom - 144;
    const y = (window.innerHeight / 2 - pan.y) / zoom - 100;
    const cardId = addCard(taskDescription, attachments, { x, y });
    setCardGeneratingPlan(cardId, true);
    expandCard(cardId);

    setIsOpen(false);
    setTaskDescription('');
    setAttachments([]);
    setIsCreating(false);

    try {
      const plan = await generatePlan({ taskDescription, attachments });
      setCardPlan(cardId, plan.title, plan.steps);
    } catch (err) {
      console.error('Failed to generate plan:', err);
      setCardGeneratingPlan(cardId, false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-cocoa-600 hover:bg-cocoa-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-colors"
        title="Create new card"
      >
        +
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">New Task</h2>

            <textarea
              autoFocus
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe your task..."
              className="w-full h-32 px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-cocoa-400 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) handleCreate();
              }}
            />

            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {attachments.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 rounded text-xs text-stone-600"
                  >
                    {a.name}
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((p) => p.id !== a.id))}
                      className="text-stone-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                  + Attach files
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setTaskDescription('');
                    setAttachments([]);
                  }}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!taskDescription.trim() || isCreating}
                  className="px-4 py-2 text-sm bg-cocoa-600 hover:bg-cocoa-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
