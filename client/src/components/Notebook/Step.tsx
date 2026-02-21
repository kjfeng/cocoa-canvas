import { useState, useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { Card, Step as StepType } from '../../types';
import { tryParseStructuredResult, getStructuredSummary } from '../../utils/parseStructuredResult';
import StepEditor from './StepEditor';
import UserStepInput from './UserStepInput';
import { Play, Check, Loader2, X, Bot, User, AlertTriangle, ChevronRight } from 'lucide-react';

interface Props {
  card: Card;
  step: StepType;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRunAgent: () => void;
  isPausedHere: boolean;
  onUserSubmit: () => void;
}

export default function Step({ card, step, index, isSelected, onSelect, onRunAgent, isPausedHere, onUserSubmit }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUserStepActive, setIsUserStepActive] = useState(false);
  const toggleAssignment = useCanvasStore((s) => s.toggleStepAssignment);
  const updateDescription = useCanvasStore((s) => s.updateStepDescription);
  const markDownstreamStale = useCanvasStore((s) => s.markDownstreamStale);
  const removeStep = useCanvasStore((s) => s.removeStep);
  const setStepResult = useCanvasStore((s) => s.setStepResult);

  const handleDescriptionChange = (newDesc: string) => {
    if (newDesc !== step.description) {
      updateDescription(card.id, step.id, newDesc);
      if (step.result !== null) {
        markDownstreamStale(card.id, index);
      }
    }
    setIsEditing(false);
  };

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (step.assignment === 'agent') {
      onRunAgent();
    } else {
      // Clear existing result so the form re-opens (form code is cached for instant load)
      if (step.result !== null) {
        setStepResult(card.id, step.id, null);
      }
      setIsUserStepActive(true);
    }
  };

  // Auto-activate when Run All pauses here
  useEffect(() => {
    if (isPausedHere) setIsUserStepActive(true);
  }, [isPausedHere]);

  const showUserInput = step.assignment === 'user' && isUserStepActive && !step.result;

  // Generate a brief plain-text preview from the result
  const preview = (() => {
    if (!step.result) return null;
    // Try structured parse first
    const structured = tryParseStructuredResult(step.result);
    if (structured) {
      return getStructuredSummary(structured);
    }
    // Fallback: strip markdown
    return step.result
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*|__/g, '')
      .replace(/\*|_/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 120);
  })();

  return (
    <div>
      <div
        onClick={step.result !== null || step.isRunning ? onSelect : undefined}
        className={`rounded-xl transition-all ${
          isSelected
            ? 'bg-stone-100 ring-1 ring-stone-300'
            : step.isRunning ? 'ring-1 ring-blue-200 bg-blue-50/20' :
              step.isStale ? 'ring-1 ring-amber-200 bg-amber-50/20' :
              step.result !== null ? 'ring-1 ring-stone-200/80 bg-white hover:bg-stone-50' :
              'ring-1 ring-stone-200/80 bg-white'
        } ${(step.result !== null || step.isRunning) ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={step.isRunning}
            className={`group/btn w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
              step.isRunning
                ? 'bg-blue-100 text-blue-500'
                : step.result !== null
                  ? 'bg-emerald-100 text-emerald-500 hover:bg-stone-100 hover:text-stone-500'
                  : 'bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600'
            } disabled:opacity-40`}
            title={step.result !== null && !step.isRunning ? 'Re-run step' : step.assignment === 'agent' ? 'Run step' : 'User step'}
          >
            {step.isRunning ? (
              <Loader2 size={13} className="animate-spin" />
            ) : step.result !== null ? (
              <>
                <Check size={13} strokeWidth={2.5} className="group-hover/btn:hidden" />
                <Play size={12} fill="currentColor" className="hidden group-hover/btn:block" />
              </>
            ) : (
              <Play size={12} fill="currentColor" />
            )}
          </button>

          {/* Step description */}
          <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
              <StepEditor
                description={step.description}
                onSave={handleDescriptionChange}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div
                className="text-sm text-stone-700 cursor-text leading-snug"
                onClick={() => setIsEditing(true)}
                title="Click to edit"
              >
                <span className="text-stone-400 mr-1.5 text-xs font-medium">{index + 1}.</span>
                {step.description || <span className="italic text-stone-400">Click to add description</span>}
              </div>
            )}
          </div>

          {/* Stale badge */}
          {step.isStale && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-600 rounded-md font-medium flex-shrink-0">
              <AlertTriangle size={9} />
              Stale
            </span>
          )}

          {/* Assignment toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleAssignment(card.id, step.id); }}
            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md font-medium flex-shrink-0 transition-colors ${
              step.assignment === 'agent'
                ? 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
            }`}
          >
            {step.assignment === 'agent' ? <Bot size={11} /> : <User size={11} />}
            {step.assignment === 'agent' ? 'Agent' : 'User'}
          </button>

          {/* Delete step */}
          <button
            onClick={(e) => { e.stopPropagation(); removeStep(card.id, step.id); }}
            className="text-stone-300 hover:text-red-400 flex-shrink-0 transition-colors"
            title="Remove step"
          >
            <X size={14} />
          </button>

          {/* Expand indicator */}
          {step.result !== null && (
            <ChevronRight size={14} className={`text-stone-400 flex-shrink-0 transition-transform ${isSelected ? 'rotate-0' : ''}`} />
          )}
        </div>

        {/* Brief inline preview */}
        {preview && !isSelected && (
          <div className="px-3 pb-2.5 -mt-0.5">
            <p className="text-xs text-stone-400 line-clamp-2 pl-9">{preview}{step.result && step.result.length > 120 ? '...' : ''}</p>
          </div>
        )}

        {/* Running indicator */}
        {step.isRunning && !step.result && (
          <div className="px-3 pb-2.5 -mt-0.5">
            <p className="text-xs text-blue-400 pl-9 flex items-center gap-1.5">
              <Loader2 size={10} className="animate-spin" />
              Generating...
            </p>
          </div>
        )}
        {step.isRunning && step.result && !isSelected && (
          <div className="px-3 pb-2.5 -mt-0.5">
            <p className="text-xs text-blue-400 pl-9 flex items-center gap-1.5">
              <Loader2 size={10} className="animate-spin" />
              Still generating...
            </p>
          </div>
        )}
      </div>

      {/* User input area — rendered outside the clickable card */}
      {showUserInput && (
        <div className="mt-1 rounded-xl ring-1 ring-stone-200/80 overflow-hidden">
          <UserStepInput
            card={card}
            step={step}
            index={index}
            onSubmit={onUserSubmit}
          />
        </div>
      )}
    </div>
  );
}
