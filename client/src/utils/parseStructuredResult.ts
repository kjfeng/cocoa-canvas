import type { StructuredResult } from '../types';

const VALID_TYPES = new Set(['markdown', 'checklist', 'table', 'code', 'comparison', 'key_value']);

/**
 * Attempt to parse a step result string as structured JSON.
 * Handles optional markdown code fences around JSON.
 * Returns null if parsing fails or the shape is invalid (fallback to markdown).
 */
export function tryParseStructuredResult(raw: string | null): StructuredResult | null {
  if (!raw) return null;

  let text = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Must look like JSON
  if (!text.startsWith('{')) return null;

  try {
    const parsed = JSON.parse(text);

    if (typeof parsed !== 'object' || parsed === null) return null;
    if (typeof parsed.type !== 'string') return null;
    if (!VALID_TYPES.has(parsed.type)) return null;
    if (typeof parsed.data !== 'object' || parsed.data === null) return null;

    // Basic shape validation per type
    switch (parsed.type) {
      case 'markdown':
        if (typeof parsed.data.content !== 'string') return null;
        break;
      case 'checklist':
        if (!Array.isArray(parsed.data.items)) return null;
        break;
      case 'table':
        if (!Array.isArray(parsed.data.headers) || !Array.isArray(parsed.data.rows)) return null;
        break;
      case 'code':
        if (typeof parsed.data.language !== 'string' || typeof parsed.data.code !== 'string') return null;
        break;
      case 'comparison':
        if (!Array.isArray(parsed.data.columns)) return null;
        break;
      case 'key_value':
        if (!Array.isArray(parsed.data.pairs)) return null;
        break;
      default:
        return null;
    }

    return parsed as StructuredResult;
  } catch {
    return null;
  }
}

/**
 * Extract a plain-text summary from a structured result for inline previews.
 */
export function getStructuredSummary(result: StructuredResult): string {
  const title = result.title ? `${result.title}: ` : '';
  switch (result.type) {
    case 'markdown':
      return title + result.data.content.slice(0, 120);
    case 'checklist': {
      const done = result.data.items.filter((i) => i.checked).length;
      return `${title}Checklist (${done}/${result.data.items.length} done)`;
    }
    case 'table':
      return `${title}Table with ${result.data.rows.length} rows`;
    case 'code':
      return `${title}${result.data.filename || result.data.language} code`;
    case 'comparison':
      return `${title}Comparing ${result.data.columns.map((c) => c.title).join(' vs ')}`;
    case 'key_value':
      return `${title}${result.data.pairs.length} key-value pairs`;
  }
}
