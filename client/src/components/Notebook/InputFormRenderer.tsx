import { useState } from 'react';
import type { InputFormSpec } from '../../types';
import TextInputField from '../InputWidgets/TextInputField';
import SelectInputField from '../InputWidgets/SelectInputField';
import ChecklistInputField from '../InputWidgets/ChecklistInputField';
import RankingInputField from '../InputWidgets/RankingInputField';
import ScaleInputField from '../InputWidgets/ScaleInputField';
import { serializeFormResult } from '../../utils/serializeFormResult';
import { Send } from 'lucide-react';

interface Props {
  spec: InputFormSpec;
  onSubmit: (markdown: string) => void;
}

export default function InputFormRenderer({ spec, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    for (const field of spec.fields) {
      switch (field.type) {
        case 'text':
          init[field.id] = '';
          break;
        case 'select':
          init[field.id] = field.multiple ? [] : '';
          break;
        case 'checklist':
          init[field.id] = [];
          break;
        case 'ranking':
          init[field.id] = [...field.items];
          break;
        case 'scale':
          init[field.id] = null;
          break;
      }
    }
    return init;
  });

  const setValue = (id: string, value: any) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const hasAnyValue = Object.entries(values).some(([, v]) => {
    if (v === null || v === undefined) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  });

  const handleSubmit = () => {
    const markdown = serializeFormResult(spec, values);
    if (markdown.trim()) {
      onSubmit(markdown);
    }
  };

  return (
    <div className="space-y-3">
      {spec.fields.map((field) => {
        switch (field.type) {
          case 'text':
            return (
              <TextInputField
                key={field.id}
                field={field}
                value={values[field.id] || ''}
                onChange={(v) => setValue(field.id, v)}
              />
            );
          case 'select':
            return (
              <SelectInputField
                key={field.id}
                field={field}
                value={values[field.id]}
                onChange={(v) => setValue(field.id, v)}
              />
            );
          case 'checklist':
            return (
              <ChecklistInputField
                key={field.id}
                field={field}
                value={values[field.id] || []}
                onChange={(v) => setValue(field.id, v)}
              />
            );
          case 'ranking':
            return (
              <RankingInputField
                key={field.id}
                field={field}
                value={values[field.id] || field.items}
                onChange={(v) => setValue(field.id, v)}
              />
            );
          case 'scale':
            return (
              <ScaleInputField
                key={field.id}
                field={field}
                value={values[field.id]}
                onChange={(v) => setValue(field.id, v)}
              />
            );
          default:
            return null;
        }
      })}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleSubmit}
          disabled={!hasAnyValue}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all disabled:opacity-40 active:scale-95"
        >
          <Send size={12} />
          Submit
        </button>
      </div>
    </div>
  );
}
