import { useState, useCallback } from 'react';
import type { StructuredCode } from '../../types';
import { Clipboard, Check } from 'lucide-react';

interface Props {
  result: StructuredCode;
}

export default function CodeWidget({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(result.data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result.data.code]);

  return (
    <div>
      {result.title && <h3 className="text-sm font-semibold text-stone-700 mb-3">{result.title}</h3>}
      {result.data.explanation && (
        <p className="text-sm text-stone-600 mb-3">{result.data.explanation}</p>
      )}
      <div className="relative group">
        <div className="flex items-center justify-between px-4 py-1.5 bg-stone-800 rounded-t-lg border-b border-stone-700">
          <span className="text-xs text-stone-400">
            {result.data.filename || result.data.language}
          </span>
        </div>
        <pre className="bg-stone-900 text-stone-100 rounded-b-lg p-4 overflow-x-auto text-[13px] leading-relaxed">
          <code>{result.data.code}</code>
        </pre>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-10 right-2.5">
          <button
            onClick={handleCopy}
            className="p-1.5 bg-stone-700/80 hover:bg-stone-600 text-stone-300 rounded-md transition-colors backdrop-blur-sm"
            title="Copy code"
          >
            {copied ? <Check size={12} /> : <Clipboard size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
