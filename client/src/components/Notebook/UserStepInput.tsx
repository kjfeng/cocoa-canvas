import { useState, useRef, useCallback } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { streamHelp } from '../../api/client';
import type { Card, Step, Attachment } from '../../types';
import { nanoid } from 'nanoid';
import MarkdownRenderer from '../Markdown/MarkdownRenderer';

interface Props {
  card: Card;
  step: Step;
  index: number;
  onSubmit: () => void;
}

export default function UserStepInput({ card, step, index, onSubmit }: Props) {
  const [userText, setUserText] = useState('');
  const [helpText, setHelpText] = useState('');
  const [isHelpLoading, setIsHelpLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setStepResult = useCanvasStore((s) => s.setStepResult);
  const setStepUserAttachments = useCanvasStore((s) => s.setStepUserAttachments);

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

  const handleSubmit = () => {
    if (!userText.trim()) return;
    setStepResult(card.id, step.id, userText);
    setStepUserAttachments(card.id, step.id, attachments);
    onSubmit();
  };

  const handleHelp = async () => {
    setIsHelpLoading(true);
    setHelpText('');
    try {
      await streamHelp(
        {
          taskDescription: card.taskDescription,
          stepDescription: step.description,
          stepIndex: index,
        },
        (chunk) => {
          setHelpText((prev) => prev + chunk);
        },
      );
    } catch (err: any) {
      setHelpText(`Error getting help: ${err.message}`);
    } finally {
      setIsHelpLoading(false);
    }
  };

  return (
    <div className="border-t border-stone-100 p-4 bg-sky-50/30">
      <p className="text-xs text-sky-700 mb-2 font-medium">
        This step is assigned to you. Please provide your input below.
      </p>

      {helpText && (
        <div className="mb-3 p-3 bg-white rounded-lg border border-sky-200 text-sm">
          <div className="prose prose-sm prose-stone max-w-none">
            <MarkdownRenderer content={helpText} />
          </div>
          {isHelpLoading && (
            <span className="inline-block w-1.5 h-4 bg-sky-400 animate-pulse ml-0.5" />
          )}
        </div>
      )}

      <textarea
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
        placeholder="Type your response here..."
        className="w-full h-24 px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent bg-white"
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

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-stone-500 hover:text-stone-700"
          >
            + Attach
          </button>
          <button
            onClick={handleHelp}
            disabled={isHelpLoading}
            className="text-xs text-sky-600 hover:text-sky-800 disabled:opacity-50"
          >
            {isHelpLoading ? 'Getting help...' : 'Help me'}
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!userText.trim()}
          className="px-4 py-1.5 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
