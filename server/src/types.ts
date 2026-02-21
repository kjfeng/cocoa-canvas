export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string;
}

export type StepAssignment = 'agent' | 'user';

export interface PlanRequest {
  taskDescription: string;
  attachments: Attachment[];
}

export interface StepRequest {
  taskDescription: string;
  attachments: Attachment[];
  steps: { description: string; assignment: StepAssignment; result: string | null }[];
  currentStepIndex: number;
}

export interface HelpRequest {
  taskDescription: string;
  stepDescription: string;
  stepIndex: number;
}

export interface SynthesisRequest {
  taskDescription: string;
  steps: { description: string; assignment: StepAssignment; result: string | null }[];
}

export interface InputFormRequest {
  taskDescription: string;
  stepDescription: string;
  stepIndex: number;
  previousSteps: { description: string; assignment: StepAssignment; result: string | null }[];
}
