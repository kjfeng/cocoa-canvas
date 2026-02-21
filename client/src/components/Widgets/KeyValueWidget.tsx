import type { StructuredKeyValue } from '../../types';

interface Props {
  result: StructuredKeyValue;
}

export default function KeyValueWidget({ result }: Props) {
  return (
    <div>
      {result.title && <h3 className="text-sm font-semibold text-stone-700 mb-3">{result.title}</h3>}
      <div className="rounded-lg border border-stone-200 divide-y divide-stone-100">
        {result.data.pairs.map((pair, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-3 py-2.5 hover:bg-stone-50/50 transition-colors"
          >
            <span className="text-xs font-medium text-stone-500 min-w-[80px] pt-0.5">{pair.key}</span>
            <span className="text-sm text-stone-700 flex-1">{pair.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
