import type { InputFieldScale } from '../../types';

interface Props {
  field: InputFieldScale;
  value: number | null;
  onChange: (value: number) => void;
}

export default function ScaleInputField({ field, value, onChange }: Props) {
  const current = value ?? Math.round((field.min + field.max) / 2);

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">
        {field.label}
        <span className="ml-2 text-sky-600 font-semibold">{current}</span>
      </label>
      <input
        type="range"
        min={field.min}
        max={field.max}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-sky-500"
      />
      <div className="flex justify-between text-xs text-stone-400 mt-0.5">
        <span>{field.minLabel ?? field.min}</span>
        <span>{field.maxLabel ?? field.max}</span>
      </div>
    </div>
  );
}
