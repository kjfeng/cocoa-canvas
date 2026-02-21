import type { StepRequest } from '../types.js';

function summarizeResult(result: string): string {
  // Try to extract readable summary from JSON structured results
  try {
    const parsed = JSON.parse(result.trim());
    if (parsed && typeof parsed === 'object' && parsed.type && parsed.data) {
      const title = parsed.title ? `[${parsed.title}] ` : '';
      switch (parsed.type) {
        case 'markdown':
          return title + (parsed.data.content || '');
        case 'checklist':
          return title + (parsed.data.items || []).map((i: any) => `- [${i.checked ? 'x' : ' '}] ${i.label}${i.detail ? ': ' + i.detail : ''}`).join('\n');
        case 'table': {
          const headers = (parsed.data.headers || []).join(' | ');
          const rows = (parsed.data.rows || []).map((r: string[]) => r.join(' | ')).join('\n');
          return `${title}${headers}\n${rows}`;
        }
        case 'code':
          return `${title}${parsed.data.filename ? parsed.data.filename + ': ' : ''}${parsed.data.explanation || ''}\n\`\`\`${parsed.data.language}\n${parsed.data.code}\n\`\`\``;
        case 'comparison':
          return title + (parsed.data.columns || []).map((c: any) => `${c.title}: ${(c.items || []).join(', ')}`).join('\n');
        case 'key_value':
          return title + (parsed.data.pairs || []).map((p: any) => `${p.key}: ${p.value}`).join('\n');
      }
    }
  } catch {
    // Not JSON — return as-is (plain markdown fallback)
  }
  return result;
}

export function buildStepPrompt(req: StepRequest): string {
  const { taskDescription, steps, currentStepIndex } = req;
  const currentStep = steps[currentStepIndex];

  // Sliding window: include all steps up to and including current, but limit context
  const windowSize = 6;
  const startIdx = Math.max(0, currentStepIndex - windowSize);
  const contextSteps = steps.slice(startIdx, currentStepIndex);

  let prompt = `You are an expert assistant helping the user complete the following task in a plan.

<task>
${taskDescription}
</task>

<plan>
${steps.map((s, i) => `${i + 1}. [${s.assignment}] ${s.description}`).join('\n')}
</plan>
`;

  if (contextSteps.length > 0) {
    prompt += `\n<previous_results>\n`;
    for (const step of contextSteps) {
      if (step.result) {
        prompt += `Step: ${step.description}\nResult: ${summarizeResult(step.result)}\n\n`;
      }
    }
    prompt += `</previous_results>\n`;
  }

  prompt += `
Now execute the following step and provide a succinct but helpful result.

<current_step>
Step ${currentStepIndex + 1}: ${currentStep.description}
</current_step>

<output_format>
You MUST respond with a single JSON object (no markdown fences, no extra text) using one of these structured types:

1. markdown — for general prose, explanations, guides:
   {"type": "markdown", "title": "optional title", "data": {"content": "your markdown content here"}}

2. checklist — for action items, todo lists, criteria:
   {"type": "checklist", "title": "optional title", "data": {"items": [{"label": "item text", "checked": false, "detail": "optional detail"}]}}

3. table — for comparisons, data, structured info:
   {"type": "table", "title": "optional title", "data": {"headers": ["col1", "col2"], "rows": [["val1", "val2"]]}}

4. code — for code snippets, scripts, configs:
   {"type": "code", "title": "optional title", "data": {"language": "python", "filename": "optional.py", "code": "print('hello')", "explanation": "optional explanation"}}

5. comparison — for comparing options side by side:
   {"type": "comparison", "title": "optional title", "data": {"columns": [{"title": "Option A", "items": ["pro1", "pro2"]}, {"title": "Option B", "items": ["pro1", "pro2"]}]}}

6. key_value — for summaries, configs, facts:
   {"type": "key_value", "title": "optional title", "data": {"pairs": [{"key": "Name", "value": "Value"}]}}

Choose the type that best fits the content. Be thorough but focused. Output ONLY the JSON object.
</output_format>`;

  return prompt;
}
