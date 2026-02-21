import { useState, useCallback } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { Card, Step } from '../../types';
import MarkdownRenderer from '../Markdown/MarkdownRenderer';
import WidgetRenderer from '../Widgets/WidgetRenderer';
import DynamicFormRenderer from './DynamicFormRenderer';
import FormErrorBoundary from './FormErrorBoundary';
import { X, Loader2, Pencil, RefreshCw, Sparkles, Bot, User } from 'lucide-react';
import { useNotebook } from '../../hooks/useNotebook';
import { getStoredFormCode } from '../../api/client';

interface Props {
  card: Card;
  selectedStep: Step | null;
  selectedIndex: number;
  showFinal: boolean;
  onClose: () => void;
}

export default function SidebarPanel({ card, selectedStep, selectedIndex, showFinal, onClose }: Props) {
  const { runSynthesis } = useNotebook(card);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const setFinalResult = useCanvasStore((s) => s.setFinalResult);

  if (showFinal) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 flex-shrink-0">
          <h3 className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            Final Results
          </h3>
          <div className="flex items-center gap-1">
            {card.finalResult && !isEditing && (
              <button
                onClick={() => { setEditValue(card.finalResult || ''); setIsEditing(true); }}
                className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
              >
                <Pencil size={13} />
              </button>
            )}
            <button
              onClick={runSynthesis}
              disabled={card.isFinalResultRunning}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors disabled:opacity-40"
            >
              {card.isFinalResultRunning ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              {card.finalResult ? 'Re-synthesize' : 'Synthesize'}
            </button>
            <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {card.isFinalResultRunning && !card.finalResult && (
            <div className="flex items-center gap-2 text-sm text-stone-400 py-8 justify-center">
              <Loader2 size={14} className="animate-spin" />
              Synthesizing...
            </div>
          )}
          {isEditing ? (
            <div>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-64 px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 resize-y focus:outline-none focus:ring-2 focus:ring-stone-300/50"
              />
              <div className="mt-2 flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-lg">Cancel</button>
                <button onClick={() => { setFinalResult(card.id, editValue); setIsEditing(false); }} className="px-3 py-1.5 text-xs bg-stone-800 text-white rounded-lg hover:bg-stone-900">Save</button>
              </div>
            </div>
          ) : card.finalResult ? (
            <div className="prose prose-sm prose-stone max-w-none">
              <MarkdownRenderer content={card.finalResult} />
              {card.isFinalResultRunning && (
                <span className="inline-block w-0.5 h-4 bg-stone-400 animate-pulse ml-0.5 rounded-full" />
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!selectedStep) return null;

  const hasResult = selectedStep.result !== null;
  const isUserStep = selectedStep.assignment === 'user';

  return (
    <div className="h-full flex flex-col">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-stone-400 font-medium flex-shrink-0">Step {selectedIndex + 1}</span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded font-medium flex-shrink-0 ${
            selectedStep.assignment === 'agent'
              ? 'bg-violet-50 text-violet-600'
              : 'bg-sky-50 text-sky-600'
          }`}>
            {selectedStep.assignment === 'agent' ? <Bot size={9} /> : <User size={9} />}
            {selectedStep.assignment === 'agent' ? 'Agent' : 'User'}
          </span>
          {selectedStep.isStale && (
            <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-600 rounded font-medium">Stale</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isUserStep && hasResult && !isEditing && (
            <button
              onClick={() => { setEditValue(selectedStep.result || ''); setIsEditing(true); }}
              className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
              title="Edit response"
            >
              <Pencil size={13} />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Step description */}
      <div className="px-5 py-3 border-b border-stone-100 flex-shrink-0">
        <p className="text-sm text-stone-700 leading-relaxed">{selectedStep.description}</p>
      </div>

      {/* Result content */}
      <div className="flex-1 overflow-y-auto p-5">
        {selectedStep.isRunning && !selectedStep.result && (
          <div className="flex items-center gap-2 text-sm text-stone-400 py-8 justify-center">
            <Loader2 size={14} className="animate-spin" />
            Generating...
          </div>
        )}
        {isUserStep && hasResult && isEditing ? (
          <UserStepEditor
            card={card}
            step={selectedStep}
            onDone={() => setIsEditing(false)}
          />
        ) : hasResult ? (
          <WidgetRenderer
            cardId={card.id}
            stepId={selectedStep.id}
            result={selectedStep.result!}
            isStreaming={selectedStep.isRunning}
          />
        ) : null}
        {!hasResult && !selectedStep.isRunning && (
          <p className="text-sm text-stone-400 text-center py-8">No result yet. Run this step to see output here.</p>
        )}
      </div>
    </div>
  );
}

function UserStepEditor({ card, step, onDone }: { card: Card; step: Step; onDone: () => void }) {
  const setStepResult = useCanvasStore((s) => s.setStepResult);
  const [editValue, setEditValue] = useState(step.result || '');
  const cachedCode = getStoredFormCode(step.id);
  const [useFormView, setUseFormView] = useState(!!cachedCode);
  const [formErrored, setFormErrored] = useState(false);

  const handleFormSubmit = useCallback((markdown: string) => {
    setStepResult(card.id, step.id, markdown);
    onDone();
  }, [card.id, step.id, setStepResult, onDone]);

  const handleFormError = useCallback(() => {
    setFormErrored(true);
    setUseFormView(false);
  }, []);

  const handleSaveMarkdown = () => {
    if (editValue.trim()) {
      setStepResult(card.id, step.id, editValue);
    }
    onDone();
  };

  if (useFormView && cachedCode && !formErrored) {
    return (
      <div>
        <FormErrorBoundary onError={handleFormError}>
          <DynamicFormRenderer
            code={cachedCode}
            onSubmit={handleFormSubmit}
            onError={handleFormError}
          />
        </FormErrorBoundary>
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setUseFormView(false)}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Edit as text instead
          </button>
          <button
            onClick={onDone}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <textarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="w-full h-48 px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 resize-y focus:outline-none focus:ring-2 focus:ring-sky-200/50 focus:border-sky-300"
      />
      <div className="mt-2 flex items-center justify-between">
        <div>
          {cachedCode && !formErrored && (
            <button
              onClick={() => setUseFormView(true)}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Edit with form instead
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDone}
            className="px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveMarkdown}
            className="px-3 py-1.5 text-xs bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
