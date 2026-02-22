import { useState, useRef, useCallback, useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { streamHelp, generateInputForm, getCachedInputForm, clearCachedInputForm, storeFormCode, getStoredFormCode, clearStoredFormCode } from '../../api/client';
import type { Card, Step, Attachment } from '../../types';
import { nanoid } from 'nanoid';
import MarkdownRenderer from '../Markdown/MarkdownRenderer';
import DynamicFormRenderer from './DynamicFormRenderer';
import FormErrorBoundary from './FormErrorBoundary';
import { Paperclip, HelpCircle, Send, X, Loader2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';

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
  const [formCode, setFormCode] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [useFreeform, setUseFreeform] = useState(false);
  const [formFailed, setFormFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setStepResult = useCanvasStore((s) => s.setStepResult);
  const setStepUserAttachments = useCanvasStore((s) => s.setStepUserAttachments);

  // Generate input form on mount — check persistent store, then prefetch cache, then generate
  useEffect(() => {
    // Check persistent store first (instant, no loading needed)
    const stored = getStoredFormCode(step.id);
    if (stored) {
      setFormCode(stored);
      setIsFormLoading(false);
      return;
    }

    let cancelled = false;
    setIsFormLoading(true);

    const previousSteps = card.steps.slice(0, index).map((s) => ({
      description: s.description,
      assignment: s.assignment,
      result: s.result,
    }));

    const req = {
      taskDescription: card.taskDescription,
      stepDescription: step.description,
      stepIndex: index,
      previousSteps,
    };

    // Check if form was already prefetched (in-flight or resolved)
    const cached = getCachedInputForm(card.id, index);
    const promise = cached ?? generateInputForm(req);

    promise
      .then((res) => {
        if (!cancelled && res.code) {
          setFormCode(res.code);
          setFormFailed(false);
          storeFormCode(step.id, res.code);
        } else if (!cancelled) {
          setFormFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFormFailed(true);
      })
      .finally(() => {
        if (!cancelled) setIsFormLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [card.taskDescription, step.id, step.description, index, card.steps]);

  const regenerateForm = useCallback(() => {
    clearCachedInputForm(card.id, index);
    clearStoredFormCode(step.id);
    setFormCode(null);
    setFormFailed(false);
    setUseFreeform(false);
    setIsFormLoading(true);

    const previousSteps = card.steps.slice(0, index).map((s) => ({
      description: s.description,
      assignment: s.assignment,
      result: s.result,
    }));

    generateInputForm({
      taskDescription: card.taskDescription,
      stepDescription: step.description,
      stepIndex: index,
      previousSteps,
    })
      .then((res) => {
        if (res.code) {
          setFormCode(res.code);
          setFormFailed(false);
          storeFormCode(step.id, res.code);
        } else {
          setFormFailed(true);
        }
      })
      .catch(() => {
        setFormFailed(true);
      })
      .finally(() => {
        setIsFormLoading(false);
      });
  }, [card.id, card.taskDescription, card.steps, step.id, step.description, index]);

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

  const handleFreeformSubmit = () => {
    if (!userText.trim()) return;
    setStepResult(card.id, step.id, userText);
    setStepUserAttachments(card.id, step.id, attachments);
    onSubmit();
  };

  const handleFormSubmit = useCallback((markdown: string) => {
    setStepResult(card.id, step.id, markdown);
    setStepUserAttachments(card.id, step.id, attachments);
    onSubmit();
  }, [card.id, step.id, attachments, setStepResult, setStepUserAttachments, onSubmit]);

  const handleFormError = useCallback(() => {
    setUseFreeform(true);
    setFormFailed(true);
  }, []);

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

  const showForm = formCode && !useFreeform;

  return (
    <div className="border-t border-stone-100 p-4 bg-sky-50/30">
      <p className="text-xs text-sky-600 mb-2.5 font-medium">
        Your turn — provide your input for this step.
      </p>

      {helpText && (
        <div className="mb-3 p-3 bg-white rounded-xl border border-sky-100 text-sm relative group">
          <button
            onClick={() => setHelpText('')}
            className="absolute top-2 right-2 p-1 text-stone-300 hover:text-stone-500 hover:bg-stone-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Dismiss"
          >
            <X size={12} />
          </button>
          <div className="prose prose-sm prose-stone max-w-none">
            <MarkdownRenderer content={helpText} />
          </div>
          {isHelpLoading && (
            <span className="inline-block w-0.5 h-4 bg-sky-400 animate-pulse ml-0.5 rounded-full" />
          )}
        </div>
      )}

      {isFormLoading && !formCode && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-stone-400">
          <Loader2 size={12} className="animate-spin" />
          Generating smart form... feel free to jot down freeform notes in the meantime!
        </div>
      )}

      {showForm ? (
        <FormErrorBoundary onError={handleFormError}>
          <DynamicFormRenderer
            code={formCode}
            onSubmit={handleFormSubmit}
            onError={handleFormError}
          />
        </FormErrorBoundary>
      ) : (
        <>
          <textarea
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="Type your response..."
            className="w-full h-24 px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200/50 focus:border-sky-300 placeholder:text-stone-400 transition-shadow"
          />

          <div className="flex justify-end mt-2">
            <button
              onClick={handleFreeformSubmit}
              disabled={!userText.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all disabled:opacity-40 active:scale-95"
            >
              <Send size={12} />
              Submit
            </button>
          </div>
        </>
      )}

      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {attachments.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-xs text-stone-600"
            >
              <Paperclip size={11} />
              {a.name}
              <button
                onClick={() => setAttachments((prev) => prev.filter((p) => p.id !== a.id))}
                className="text-stone-400 hover:text-red-400 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            <Paperclip size={12} />
            Attach
          </button>
          <button
            onClick={handleHelp}
            disabled={isHelpLoading}
            className="inline-flex items-center gap-1 text-xs text-sky-500 hover:text-sky-700 transition-colors disabled:opacity-50"
          >
            {isHelpLoading ? <Loader2 size={12} className="animate-spin" /> : <HelpCircle size={12} />}
            {isHelpLoading ? 'Loading...' : 'Help me'}
          </button>
          {formCode && !formFailed && (
            <button
              onClick={() => setUseFreeform((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              {useFreeform ? <ToggleLeft size={12} /> : <ToggleRight size={12} />}
              {useFreeform ? 'Switch to guided form' : 'Switch to freeform'}
            </button>
          )}
          {(formFailed || (useFreeform && formCode)) && !isFormLoading && (
            <button
              onClick={regenerateForm}
              className="inline-flex items-center gap-1 text-xs text-sky-500 hover:text-sky-700 transition-colors"
            >
              <RefreshCw size={12} />
              Regenerate form
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
