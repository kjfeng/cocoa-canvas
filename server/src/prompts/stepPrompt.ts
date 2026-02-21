import type { StepRequest } from '../types.js';

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
        prompt += `Step: ${step.description}\nResult: ${step.result}\n\n`;
      }
    }
    prompt += `</previous_results>\n`;
  }

  prompt += `
Now execute the following step thoroughly and provide a succinct, helpful result:

<current_step>
Step ${currentStepIndex + 1}: ${currentStep.description}
</current_step>

Provide your result in rich markdown. Include code blocks, tables, lists, and formatting as appropriate. Be thorough but focused.`;

  return prompt;
}
