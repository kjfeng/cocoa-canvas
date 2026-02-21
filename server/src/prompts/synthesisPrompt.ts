import type { SynthesisRequest } from '../types.js';

export function buildSynthesisPrompt(req: SynthesisRequest): string {
  const stepResults = req.steps
    .map((s, i) => `### Step ${i + 1}: ${s.description}\n**Completed by:** ${s.assignment}\n**Result:**\n${s.result || '(no result)'}`)
    .join('\n\n');

  return `You are an expert assistant synthesizing the results of a completed task.

<task>
${req.taskDescription}
</task>

<step_results>
${stepResults}
</step_results>

Synthesize all step results into a polished, cohesive final deliverable. This should read as a complete, standalone document — not just a summary of steps. Use rich markdown formatting including headers, code blocks, tables, and lists as appropriate.`;
}
