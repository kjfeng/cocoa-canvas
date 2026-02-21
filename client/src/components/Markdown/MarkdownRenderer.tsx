import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useCallback, useState, useRef, useEffect, type ReactNode } from 'react';
import { Clipboard, Check, ChevronRight, ChevronsUpDown } from 'lucide-react';

interface Props {
  content: string;
  collapsible?: boolean;
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

// Split markdown into sections by h2/h3 headings.
interface Section {
  level: number;
  heading: string;
  body: string;
}

function splitIntoSections(md: string): Section[] {
  const lines = md.split('\n');
  const sections: Section[] = [];
  let current: Section = { level: 0, heading: '', body: '' };

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      if (current.body.trim() || current.heading) {
        sections.push({ ...current, body: current.body.trimEnd() });
      }
      current = { level: match[1].length, heading: match[2], body: '' };
    } else {
      current.body += line + '\n';
    }
  }
  if (current.body.trim() || current.heading) {
    sections.push({ ...current, body: current.body.trimEnd() });
  }

  return sections;
}

function CollapsibleSection({ level, heading, open, onToggle, children }: { level: number; heading: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const textSize = level === 2 ? 'text-base font-semibold' : 'text-sm font-semibold';

  // Sync the DOM open attribute with the controlled prop
  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.open = open;
    }
  }, [open]);

  return (
    <details
      ref={detailsRef}
      onToggle={(e) => {
        const isOpen = (e.target as HTMLDetailsElement).open;
        if (isOpen !== open) onToggle();
      }}
      className="mb-3"
    >
      <summary
        className={`flex items-center gap-1.5 cursor-pointer select-none list-none ${textSize} text-stone-800 hover:text-stone-600 transition-colors py-1`}
        style={{ WebkitAppearance: 'none' }}
      >
        <ChevronRight
          size={14}
          className={`text-stone-400 transition-transform flex-shrink-0 ${open ? 'rotate-90' : ''}`}
        />
        {heading}
      </summary>
      <div className="pl-5 mt-1">
        {children}
      </div>
    </details>
  );
}

function MarkdownBlock({ content }: { content: string }) {
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

export default function MarkdownRenderer({ content, collapsible = true }: Props) {
  const sections = collapsible ? splitIntoSections(content) : null;
  const headingCount = sections ? sections.filter((s) => s.level > 0).length : 0;
  const hasCollapsible = sections && headingCount > 0;

  // Track open/closed state per section index
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});

  const toggleSection = useCallback((idx: number) => {
    setOpenMap((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const allOpen = hasCollapsible && sections!.every((s, i) => s.level === 0 || openMap[i]);

  const toggleAll = useCallback(() => {
    if (!sections) return;
    const newOpen = !allOpen;
    const next: Record<number, boolean> = {};
    sections.forEach((s, i) => {
      if (s.level > 0) next[i] = newOpen;
    });
    setOpenMap(next);
  }, [sections, allOpen]);

  if (!hasCollapsible || !sections || sections.length <= 1) {
    return <MarkdownBlock content={content} />;
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-end mb-1">
        <button
          onClick={toggleAll}
          className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
        >
          <ChevronsUpDown size={12} />
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>
      {sections.map((section, i) => {
        if (section.level === 0) {
          return section.body ? (
            <div key={i}>
              <MarkdownBlock content={section.body} />
            </div>
          ) : null;
        }

        return (
          <CollapsibleSection
            key={i}
            level={section.level}
            heading={section.heading}
            open={!!openMap[i]}
            onToggle={() => toggleSection(i)}
          >
            {section.body && <MarkdownBlock content={section.body} />}
          </CollapsibleSection>
        );
      })}
    </div>
  );
}
