import type { StructuredTable } from '../../types';

interface Props {
  result: StructuredTable;
}

export default function TableWidget({ result }: Props) {
  return (
    <div>
      {result.title && <h3 className="text-sm font-semibold text-stone-700 mb-3">{result.title}</h3>}
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="border-collapse w-full text-sm">
          <thead>
            <tr>
              {result.data.headers.map((h, i) => (
                <th key={i} className="border-b border-stone-200 px-3 py-2 bg-stone-50 text-left font-medium text-stone-600 text-xs">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.data.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-stone-50/50 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="border-b border-stone-100 px-3 py-2 text-stone-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
