import { useState, useRef, useCallback } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { generatePlan } from '../../api/client';
import type { Attachment } from '../../types';
import { nanoid } from 'nanoid';
import { Plus, Paperclip, X } from 'lucide-react';

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

  const handleClose = () => {
    setIsOpen(false);
    setTaskDescription('');
    setAttachments([]);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-stone-800 hover:bg-stone-900 text-white rounded-full shadow-lg shadow-stone-300/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Create new card"
      >
        <Plus size={20} strokeWidth={2} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={handleClose}>
          <div className="bg-white rounded-2xl shadow-2xl shadow-stone-200/50 w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-5 pb-4">
              <h2 className="text-base font-semibold text-stone-800 mb-3">New Task</h2>

              <textarea
                autoFocus
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="What would you like to work on?"
                className="w-full h-28 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-stone-400/50 focus:border-stone-300 placeholder:text-stone-400 transition-shadow"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) handleCreate();
                }}
              />

              {attachments.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {attachments.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 rounded-lg text-xs text-stone-600"
                    >
                      <Paperclip size={11} />
                      {a.name}
                      <button
                        onClick={() => setAttachments((prev) => prev.filter((p) => p.id !== a.id))}
                        className="text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between">
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
                  className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <Paperclip size={13} />
                  Attach files
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!taskDescription.trim() || isCreating}
                  className="px-4 py-1.5 text-sm bg-stone-800 hover:bg-stone-900 text-white rounded-lg transition-all disabled:opacity-40 active:scale-95"
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
