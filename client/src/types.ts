export interface Attachment {
  id: string;
  name: string;
  type: string; // MIME type
  data: string; // base64
}

export type StepAssignment = 'agent' | 'user';

// --- Structured result types ---

export interface StructuredMarkdown {
  type: 'markdown';
  title?: string;
  data: { content: string };
}

export interface StructuredChecklist {
  type: 'checklist';
  title?: string;
  data: { items: { label: string; checked: boolean; detail?: string }[] };
}

export interface StructuredTable {
  type: 'table';
  title?: string;
  data: { headers: string[]; rows: string[][] };
}

export interface StructuredCode {
  type: 'code';
  title?: string;
  data: { language: string; filename?: string; code: string; explanation?: string };
}

export interface StructuredComparison {
  type: 'comparison';
  title?: string;
  data: { columns: { title: string; items: string[] }[] };
}

export interface StructuredKeyValue {
  type: 'key_value';
  title?: string;
  data: { pairs: { key: string; value: string }[] };
}

export type StructuredResult =
  | StructuredMarkdown
  | StructuredChecklist
  | StructuredTable
  | StructuredCode
  | StructuredComparison
  | StructuredKeyValue;

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
  forkedFromId: string | null;
  createdBy?: string;
  createdByName?: string;
  createdByColor?: string;
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

export interface InputFormRequest {
  taskDescription: string;
  stepDescription: string;
  stepIndex: number;
  previousSteps: { description: string; assignment: StepAssignment; result: string | null }[];
}
