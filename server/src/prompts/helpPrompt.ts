import type { HelpRequest } from '../types.js';

export function buildHelpPrompt(req: HelpRequest): string {
  return `You are a supportive assistant helping a user complete a step in their task plan.

<task>
${req.taskDescription}
</task>

The user needs help with step ${req.stepIndex + 1}:
<step>
${req.stepDescription}
</step>

Ask 3-5 thoughtful guiding questions that will help the user think through this step and provide a good result. Be encouraging and specific. Do NOT complete the step for them — your job is to help them think through it themselves.

Format your response in markdown with numbered questions.`;
}
