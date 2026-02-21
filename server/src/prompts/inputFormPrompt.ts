import type { InputFormRequest } from '../types.js';

export function buildInputFormPrompt(req: InputFormRequest): string {
  const previousContext = req.previousSteps
    .map((s, i) => {
      const role = s.assignment === 'agent' ? 'Agent' : 'User';
      const result = s.result ? `Result: ${s.result.slice(0, 200)}` : 'Not yet completed';
      return `  Step ${i + 1} (${role}): ${s.description}\n  ${result}`;
    })
    .join('\n');

  return `You are a UX assistant that generates structured input forms. Given a task and a specific step that a human user needs to complete, create a JSON form specification with 2-5 input fields that help guide the user's response.

<task>
${req.taskDescription}
</task>

<current_step index="${req.stepIndex}">
${req.stepDescription}
</current_step>

${previousContext ? `<previous_steps>\n${previousContext}\n</previous_steps>` : ''}

Choose from these field types:
- "text": Single-line or multi-line text input. Use for names, descriptions, open-ended responses.
  Properties: id, label, placeholder (optional), multiline (optional boolean)
- "select": Dropdown for picking one or multiple options. Use for choosing from predefined choices.
  Properties: id, label, options (string array), multiple (optional boolean)
- "checklist": Checkboxes for "select all that apply". Use for feature lists, requirements, preferences.
  Properties: id, label, options (string array)
- "ranking": Ordered list the user can reorder. Use for prioritization.
  Properties: id, label, items (string array, in default order)
- "scale": Numeric slider with labels. Use for ratings, confidence levels.
  Properties: id, label, min (number), max (number), minLabel (optional), maxLabel (optional)

Rules:
- Pick 2-5 fields that best capture the information needed for this step
- Use descriptive labels and helpful placeholders
- Make field IDs lowercase_snake_case
- Options/items should be relevant to the task context
- Prefer specific field types over generic text when possible

Respond with ONLY valid JSON in this exact format:
{
  "fields": [
    { "type": "checklist", "id": "features", "label": "Select desired features", "options": ["Option A", "Option B"] },
    { "type": "text", "id": "notes", "label": "Additional notes", "placeholder": "Any other details...", "multiline": true }
  ]
}`;
}
