import MarkdownRenderer from '../Markdown/MarkdownRenderer';

interface Props {
  result: string;
  isRunning: boolean;
}

export default function StepResult({ result, isRunning }: Props) {
  return (
    <div className="border-t border-stone-100 px-4 py-3 bg-white/50">
      {result ? (
        <div className="prose prose-sm prose-stone max-w-none">
          <MarkdownRenderer content={result} />
        </div>
      ) : isRunning ? (
        <div className="flex items-center gap-2 text-sm text-stone-400">
          <span className="w-3 h-3 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin" />
          Generating...
        </div>
      ) : null}
      {isRunning && result && (
        <span className="inline-block w-1.5 h-4 bg-stone-400 animate-pulse ml-0.5" />
      )}
    </div>
  );
}
