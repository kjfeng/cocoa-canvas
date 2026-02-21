import type { PlanRequest, PlanResponse, StepRequest, HelpRequest, SynthesisRequest, InputFormRequest, InputFormSpec } from '../types';

const BASE = '/api/notebooks';

export async function generatePlan(req: PlanRequest): Promise<PlanResponse> {
  const res = await fetch(`${BASE}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Plan failed: ${res.statusText}`);
  return res.json();
}

export async function streamSSE(
  url: string,
  body: object,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) throw new Error(`Request failed: ${res.statusText}`);
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (!json) continue;
      try {
        const data = JSON.parse(json);
        if (data.error) throw new Error(data.error);
        if (data.text) onChunk(data.text);
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
}

export function streamStep(req: StepRequest, onChunk: (text: string) => void, signal?: AbortSignal) {
  return streamSSE(`${BASE}/step`, req, onChunk, signal);
}

export function streamHelp(req: HelpRequest, onChunk: (text: string) => void, signal?: AbortSignal) {
  return streamSSE(`${BASE}/help`, req, onChunk, signal);
}

export function streamSynthesis(req: SynthesisRequest, onChunk: (text: string) => void, signal?: AbortSignal) {
  return streamSSE(`${BASE}/synthesize`, req, onChunk, signal);
}

export async function generateInputForm(req: InputFormRequest): Promise<InputFormSpec> {
  const res = await fetch(`${BASE}/input-form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Input form generation failed: ${res.statusText}`);
  return res.json();
}
