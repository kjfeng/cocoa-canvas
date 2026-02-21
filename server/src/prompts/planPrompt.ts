import type { Attachment } from '../types.js';

export function buildPlanPrompt(taskDescription: string, attachments: Attachment[]): string {
  let prompt = `You are an expert planning assistant. A user wants help with the following task:

<task>
${taskDescription}
</task>
`;

  if (attachments.length > 0) {
    prompt += `\nThe user has attached ${attachments.length} file(s): ${attachments.map((a) => a.name).join(', ')}\n`;
  }

  prompt += `
Create a thoughtful, actionable notebook plan to complete this task. The plan should have 3-5 focused steps.

For each step, decide whether it should be completed by the AI agent or the human user:
- Assign steps to "agent" when they involve research, analysis, writing, coding, or synthesis
- Assign steps to "user" when they require personal input, decisions, access to private information, or hands-on actions the agent can't perform

Respond with ONLY valid JSON in this exact format:
{
  "title": "A concise, descriptive title for this task",
  "steps": [
    { "description": "Clear description of what this step involves", "assignment": "agent" },
    { "description": "Clear description of what this step involves", "assignment": "user" }
  ]
}`;

  return prompt;
}
