import type { StructuredChecklist } from '../../types';

interface Props {
  result: StructuredChecklist;
  onToggleItem: (index: number, checked: boolean) => void;
}

export default function ChecklistWidget({ result, onToggleItem }: Props) {
  return (
    <div>
      {result.title && <h3 className="text-sm font-semibold text-stone-700 mb-3">{result.title}</h3>}
      <div className="space-y-1.5">
        {result.data.items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 py-1.5 px-2 -mx-2 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => onToggleItem(i, e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-700 focus:ring-stone-500 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${item.checked ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                {item.label}
              </span>
              {item.detail && (
                <p className="text-xs text-stone-400 mt-0.5">{item.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
