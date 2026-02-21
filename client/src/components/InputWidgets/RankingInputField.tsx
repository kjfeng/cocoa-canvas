import { ChevronUp, ChevronDown } from 'lucide-react';
import type { InputFieldRanking } from '../../types';

interface Props {
  field: InputFieldRanking;
  value: string[];
  onChange: (value: string[]) => void;
}

export default function RankingInputField({ field, value, onChange }: Props) {
  const items = value && value.length ? value : field.items;

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{field.label}</label>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div
            key={item}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-700"
          >
            <span className="text-xs text-stone-400 w-5 text-center font-medium">{i + 1}</span>
            <span className="flex-1">{item}</span>
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="p-0.5 text-stone-400 hover:text-stone-600 disabled:opacity-20 transition-colors"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => moveDown(i)}
                disabled={i === items.length - 1}
                className="p-0.5 text-stone-400 hover:text-stone-600 disabled:opacity-20 transition-colors"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
