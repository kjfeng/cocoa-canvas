import type { InputFormSpec, InputField } from '../types';

export function serializeFormResult(
  spec: InputFormSpec,
  values: Record<string, any>,
): string {
  const sections: string[] = [];

  for (const field of spec.fields) {
    const val = values[field.id];
    if (val === undefined || val === null || val === '') continue;

    const section = serializeField(field, val);
    if (section) sections.push(section);
  }

  return sections.join('\n\n');
}

function serializeField(field: InputField, value: any): string | null {
  switch (field.type) {
    case 'text': {
      if (!value || !String(value).trim()) return null;
      return `## ${field.label}\n${String(value).trim()}`;
    }
    case 'select': {
      if (field.multiple) {
        const selected = value as string[];
        if (!selected.length) return null;
        return `## ${field.label}\n${selected.map((s) => `- ${s}`).join('\n')}`;
      }
      if (!value) return null;
      return `## ${field.label}\n${value}`;
    }
    case 'checklist': {
      const checked = value as string[];
      if (!checked.length && !field.options.length) return null;
      const lines = field.options.map(
        (opt) => `- [${checked.includes(opt) ? 'x' : ' '}] ${opt}`,
      );
      return `## ${field.label}\n${lines.join('\n')}`;
    }
    case 'ranking': {
      const items = value as string[];
      if (!items.length) return null;
      const lines = items.map((item, i) => `${i + 1}. ${item}`);
      return `## ${field.label}\n${lines.join('\n')}`;
    }
    case 'scale': {
      if (value === undefined || value === null) return null;
      const label = `${value} / ${field.max}`;
      return `## ${field.label}\n${label}`;
    }
    default:
      return null;
  }
}
