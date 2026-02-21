import { useCallback } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { tryParseStructuredResult } from '../../utils/parseStructuredResult';
import MarkdownRenderer from '../Markdown/MarkdownRenderer';
import ChecklistWidget from './ChecklistWidget';
import TableWidget from './TableWidget';
import CodeWidget from './CodeWidget';
import ComparisonWidget from './ComparisonWidget';
import KeyValueWidget from './KeyValueWidget';

interface Props {
  cardId: string;
  stepId: string;
  result: string;
  isStreaming: boolean;
}

export default function WidgetRenderer({ cardId, stepId, result, isStreaming }: Props) {
  const setStepResult = useCanvasStore((s) => s.setStepResult);

  const handleToggleChecklist = useCallback(
    (index: number, checked: boolean) => {
      const parsed = tryParseStructuredResult(result);
      if (parsed && parsed.type === 'checklist') {
        const updated = {
          ...parsed,
          data: {
            ...parsed.data,
            items: parsed.data.items.map((item, i) =>
              i === index ? { ...item, checked } : item,
            ),
          },
        };
        setStepResult(cardId, stepId, JSON.stringify(updated));
      }
    },
    [cardId, stepId, result, setStepResult],
  );

  // During streaming, show skeleton loading state
  if (isStreaming) {
    return (
      <div className="space-y-4 py-2">
        <div className="flex items-center gap-2 text-sm text-stone-400">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Agent is working...
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-stone-200/60 rounded-md w-2/5" />
          <div className="space-y-2">
            <div className="h-3 bg-stone-100 rounded w-full" />
            <div className="h-3 bg-stone-100 rounded w-11/12" />
            <div className="h-3 bg-stone-100 rounded w-4/5" />
          </div>
          <div className="h-px bg-stone-100 w-full my-1" />
          <div className="h-4 bg-stone-200/60 rounded-md w-1/3" />
          <div className="space-y-2">
            <div className="h-3 bg-stone-100 rounded w-full" />
            <div className="h-3 bg-stone-100 rounded w-3/4" />
          </div>
          <div className="space-y-2 pl-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-stone-100 rounded" />
              <div className="h-3 bg-stone-100 rounded w-3/5" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-stone-100 rounded" />
              <div className="h-3 bg-stone-100 rounded w-2/5" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-stone-100 rounded" />
              <div className="h-3 bg-stone-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const structured = tryParseStructuredResult(result);

  // Fallback: render as markdown
  if (!structured) {
    return (
      <div className="prose prose-sm prose-stone max-w-none">
        <MarkdownRenderer content={result} />
      </div>
    );
  }

  // Dispatch to widget
  switch (structured.type) {
    case 'markdown':
      return (
        <div className="prose prose-sm prose-stone max-w-none">
          <MarkdownRenderer content={structured.data.content} />
        </div>
      );
    case 'checklist':
      return (
        <ChecklistWidget
          result={structured}
          onToggleItem={handleToggleChecklist}
        />
      );
    case 'table':
      return <TableWidget result={structured} />;
    case 'code':
      return <CodeWidget result={structured} />;
    case 'comparison':
      return <ComparisonWidget result={structured} />;
    case 'key_value':
      return <KeyValueWidget result={structured} />;
    default:
      return (
        <div className="prose prose-sm prose-stone max-w-none">
          <MarkdownRenderer content={result} />
        </div>
      );
  }
}
