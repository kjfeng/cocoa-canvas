import { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { Card, Step as StepType } from '../../types';
import StepResult from './StepResult';
import StepEditor from './StepEditor';
import UserStepInput from './UserStepInput';

interface Props {
  card: Card;
  step: StepType;
  index: number;
  onRunAgent: () => void;
  isPausedHere: boolean;
  onUserSubmit: () => void;
}

export default function Step({ card, step, index, onRunAgent, isPausedHere, onUserSubmit }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const toggleAssignment = useCanvasStore((s) => s.toggleStepAssignment);
  const updateDescription = useCanvasStore((s) => s.updateStepDescription);
  const markDownstreamStale = useCanvasStore((s) => s.markDownstreamStale);
  const removeStep = useCanvasStore((s) => s.removeStep);
  const setStepResult = useCanvasStore((s) => s.setStepResult);

  const handleDescriptionChange = (newDesc: string) => {
    updateDescription(card.id, step.id, newDesc);
    if (step.result !== null) {
      markDownstreamStale(card.id, index);
    }
    setIsEditing(false);
  };

  const handleRun = () => {
    if (step.assignment === 'agent') {
      onRunAgent();
    }
    // User steps: the input area is shown inline
  };

  const showUserInput = step.assignment === 'user' && (isPausedHere || (!step.result && !step.isRunning));

  return (
    <div className={`border rounded-lg overflow-hidden ${
      step.isRunning ? 'border-blue-300 bg-blue-50/30' :
      step.isStale ? 'border-amber-300 bg-amber-50/30' :
      step.result !== null ? 'border-green-200 bg-green-50/20' :
      'border-stone-200 bg-white'
    }`}>
      <div className="flex items-center gap-2 p-3">
        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={step.isRunning || (step.assignment === 'user' && !isPausedHere && step.result === null)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-colors ${
            step.isRunning
              ? 'bg-blue-100 text-blue-600'
              : step.result !== null
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-stone-100 text-stone-500 hover:bg-cocoa-100 hover:text-cocoa-700'
          } disabled:opacity-50`}
          title={step.assignment === 'agent' ? 'Run step' : 'User step'}
        >
          {step.isRunning ? (
            <span className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          ) : step.result !== null ? (
            '✓'
          ) : (
            '▶'
          )}
        </button>

        {/* Step description */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <StepEditor
              description={step.description}
              onSave={handleDescriptionChange}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div
              className="text-sm text-stone-700 cursor-text"
              onClick={() => setIsEditing(true)}
              title="Click to edit"
            >
              <span className="text-stone-400 mr-1.5 text-xs">{index + 1}.</span>
              {step.description || <span className="italic text-stone-400">Click to add description</span>}
            </div>
          )}
        </div>

        {/* Stale badge */}
        {step.isStale && (
          <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded font-medium flex-shrink-0">
            Stale
          </span>
        )}

        {/* Assignment toggle */}
        <button
          onClick={() => toggleAssignment(card.id, step.id)}
          className={`px-2 py-1 text-[11px] rounded font-medium flex-shrink-0 transition-colors ${
            step.assignment === 'agent'
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
          }`}
        >
          {step.assignment === 'agent' ? 'Agent' : 'User'}
        </button>

        {/* Delete step */}
        <button
          onClick={() => removeStep(card.id, step.id)}
          className="text-stone-300 hover:text-red-500 text-xs flex-shrink-0"
          title="Remove step"
        >
          ✕
        </button>

        {/* Collapse toggle for results */}
        {step.result !== null && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-stone-400 hover:text-stone-600 text-xs flex-shrink-0"
          >
            {collapsed ? '▼' : '▲'}
          </button>
        )}
      </div>

      {/* Result area */}
      {step.result !== null && !collapsed && (
        <StepResult result={step.result} isRunning={step.isRunning} />
      )}

      {/* User input area */}
      {showUserInput && (
        <UserStepInput
          card={card}
          step={step}
          index={index}
          onSubmit={onUserSubmit}
        />
      )}
    </div>
  );
}
