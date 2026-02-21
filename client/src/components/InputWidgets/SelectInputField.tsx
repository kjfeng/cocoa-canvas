import type { InputFieldSelect } from '../../types';

interface Props {
  field: InputFieldSelect;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

export default function SelectInputField({ field, value, onChange }: Props) {
  if (field.multiple) {
    const selected = (value as string[]) || [];
    const toggle = (opt: string) => {
      if (selected.includes(opt)) {
        onChange(selected.filter((s) => s !== opt));
      } else {
        onChange([...selected, opt]);
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">{field.label}</label>
        <div className="flex flex-wrap gap-1.5">
          {field.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                selected.includes(opt)
                  ? 'bg-sky-100 border-sky-300 text-sky-700'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{field.label}</label>
      <select
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-200/50 focus:border-sky-300 transition-shadow"
      >
        <option value="">Select...</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
