const provider = process.env.LLM_PROVIDER ?? 'openai';

let _mod: typeof import('./anthropic.js');

if (provider === 'openai') {
  _mod = await import('./openai.js');
} else {
  _mod = await import('./anthropic.js');
}

export const generateJSON = _mod.generateJSON;
export const streamText = _mod.streamText;
