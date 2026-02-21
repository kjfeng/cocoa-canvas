import { useState, useRef, useEffect } from 'react';

interface Props {
  description: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export default function StepEditor({ description, onSave, onCancel }: Props) {
  const [value, setValue] = useState(description);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onSave(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSave(value);
        if (e.key === 'Escape') onCancel();
      }}
      className="w-full text-sm text-stone-700 bg-transparent border-b border-cocoa-300 outline-none py-0.5"
    />
  );
}
