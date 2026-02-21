import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useCallback, useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface Props {
  content: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2.5 right-2.5 p-1.5 bg-stone-700/80 hover:bg-stone-600 text-stone-300 rounded-md transition-colors backdrop-blur-sm"
      title="Copy code"
    >
      {copied ? <Check size={12} /> : <Clipboard size={12} />}
    </button>
  );
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        pre({ children, ...props }) {
          const codeElement = (children as any)?.props;
          const text = codeElement?.children?.[0] || '';
          return (
            <div className="relative group">
              <pre {...props} className="bg-stone-900 text-stone-100 rounded-lg p-4 overflow-x-auto text-[13px] leading-relaxed">
                {children}
              </pre>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={typeof text === 'string' ? text : ''} />
              </div>
            </div>
          );
        },
        code({ className, children, ...props }) {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-md text-[13px] font-mono" {...props}>
                {children}
              </code>
            );
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        table({ children, ...props }) {
          return (
            <div className="overflow-x-auto rounded-lg border border-stone-200">
              <table className="border-collapse w-full text-sm" {...props}>
                {children}
              </table>
            </div>
          );
        },
        th({ children, ...props }) {
          return (
            <th className="border-b border-stone-200 px-3 py-2 bg-stone-50 text-left font-medium text-stone-600 text-xs" {...props}>
              {children}
            </th>
          );
        },
        td({ children, ...props }) {
          return (
            <td className="border-b border-stone-100 px-3 py-2 text-stone-700" {...props}>
              {children}
            </td>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
