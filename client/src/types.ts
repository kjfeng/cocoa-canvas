export interface Attachment {
  id: string;
  name: string;
  type: string; // MIME type
  data: string; // base64
}

export type StepAssignment = 'agent' | 'user';

export interface Step {
  id: string;
  description: string;
  assignment: StepAssignment;
  result: string | null;
  isStale: boolean;
  isRunning: boolean;
  userAttachments: Attachment[];
}

export interface Card {
  id: string;
  title: string;
  taskDescription: string;
  attachments: Attachment[];
  steps: Step[];
  finalResult: string | null;
  isFinalResultRunning: boolean;
  isGeneratingPlan: boolean;
  copiedFromId: string | null;
  position: { x: number; y: number };
  createdAt: number;
}

// API types
export interface PlanRequest {
  taskDescription: string;
  attachments: Attachment[];
}

export interface PlanResponse {
  title: string;
  steps: { description: string; assignment: StepAssignment }[];
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
