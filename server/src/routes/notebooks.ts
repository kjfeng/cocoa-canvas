import { Router } from 'express';
import type { Request, Response } from 'express';
import { generateJSON, streamText } from '../services/api.js';
import { buildPlanPrompt } from '../prompts/planPrompt.js';
import { buildStepPrompt } from '../prompts/stepPrompt.js';
import { buildHelpPrompt } from '../prompts/helpPrompt.js';
import { buildSynthesisPrompt } from '../prompts/synthesisPrompt.js';
import type { PlanRequest, StepRequest, HelpRequest, SynthesisRequest, InputFormRequest } from '../types.js';
import { buildInputFormPrompt } from '../prompts/inputFormPrompt.js';

export const notebooksRouter = Router();

// Generate a notebook plan
notebooksRouter.post('/plan', async (req: Request, res: Response) => {
  try {
    const body = req.body as PlanRequest;
    const prompt = buildPlanPrompt(body.taskDescription, body.attachments);
    const raw = await generateJSON(prompt);

    // Extract JSON from response (handle markdown code fences)
    let jsonStr = raw;
    const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (fenceMatch) jsonStr = fenceMatch[1];

    const plan = JSON.parse(jsonStr.trim());
    res.json(plan);
  } catch (err: any) {
    console.error('Plan generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Execute a step (SSE streaming)
notebooksRouter.post('/step', async (req: Request, res: Response) => {
  try {
    const body = req.body as StepRequest;
    const prompt = buildStepPrompt(body);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    await streamText(prompt, (chunk) => {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error('Step execution error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// Help with a user step (SSE streaming)
notebooksRouter.post('/help', async (req: Request, res: Response) => {
  try {
    const body = req.body as HelpRequest;
    const prompt = buildHelpPrompt(body);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    await streamText(prompt, (chunk) => {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error('Help generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// Generate input form JSX code for a user step
notebooksRouter.post('/input-form', async (req: Request, res: Response) => {
  try {
    const body = req.body as InputFormRequest;
    const prompt = buildInputFormPrompt(body);
    const raw = await generateJSON(prompt, { fast: true });

    // Extract JSX code from markdown fences
    const fenceMatch = raw.match(/```(?:jsx|tsx)?\s*\n?([\s\S]*?)\n?```/);
    const code = fenceMatch ? fenceMatch[1].trim() : raw.trim();

    res.json({ code });
  } catch (err: any) {
    console.error('Input form generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Synthesize final results (SSE streaming)
notebooksRouter.post('/synthesize', async (req: Request, res: Response) => {
  try {
    const body = req.body as SynthesisRequest;
    const prompt = buildSynthesisPrompt(body);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    await streamText(prompt, (chunk) => {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error('Synthesis error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});
