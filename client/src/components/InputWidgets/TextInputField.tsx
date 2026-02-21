import type { InputFieldText } from '../../types';

interface Props {
  field: InputFieldText;
  value: string;
  onChange: (value: string) => void;
}

export default function TextInputField({ field, value, onChange }: Props) {
  const className =
    'w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-200/50 focus:border-sky-300 placeholder:text-stone-400 transition-shadow';

  if (field.multiline) {
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">{field.label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`${className} h-20 resize-none`}
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{field.label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={className}
      />
    </div>
  );
}
