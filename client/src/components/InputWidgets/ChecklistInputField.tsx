import type { InputFieldChecklist } from '../../types';

interface Props {
  field: InputFieldChecklist;
  value: string[];
  onChange: (value: string[]) => void;
}

export default function ChecklistInputField({ field, value, onChange }: Props) {
  const checked = value || [];

  const toggle = (opt: string) => {
    if (checked.includes(opt)) {
      onChange(checked.filter((c) => c !== opt));
    } else {
      onChange([...checked, opt]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{field.label}</label>
      <div className="space-y-1">
        {field.options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={checked.includes(opt)}
              onChange={() => toggle(opt)}
              className="rounded border-stone-300 text-sky-500 focus:ring-sky-200"
            />
            <span className="text-sm text-stone-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
