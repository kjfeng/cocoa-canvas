import type { StructuredComparison } from '../../types';

interface Props {
  result: StructuredComparison;
}

export default function ComparisonWidget({ result }: Props) {
  return (
    <div>
      {result.title && <h3 className="text-sm font-semibold text-stone-700 mb-3">{result.title}</h3>}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${result.data.columns.length}, 1fr)` }}>
        {result.data.columns.map((col, ci) => (
          <div key={ci} className="rounded-lg border border-stone-200 overflow-hidden">
            <div className="px-3 py-2 bg-stone-50 border-b border-stone-200">
              <h4 className="text-xs font-semibold text-stone-600">{col.title}</h4>
            </div>
            <ul className="p-2 space-y-1">
              {col.items.map((item, ii) => (
                <li
                  key={ii}
                  className="flex items-start gap-2 text-sm text-stone-700 py-1 px-1.5 -mx-1.5 rounded hover:bg-stone-50 transition-colors"
                >
                  <span className="text-stone-400 mt-0.5">•</span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
