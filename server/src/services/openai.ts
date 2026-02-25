import OpenAI from 'openai';

const MODEL = 'gpt-4.1';
const FAST_MODEL = 'gpt-4.1-mini';

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export async function generateJSON(prompt: string, opts?: { fast?: boolean }): Promise<string> {
  const response = await getClient().responses.create({
    model: opts?.fast ? FAST_MODEL : MODEL,
    input: [{ role: 'user', content: prompt }],
  });
  if (response.output_text) return response.output_text;
  throw new Error('Unexpected response type');
}

export async function streamText(
  prompt: string,
  onChunk: (text: string) => void,
): Promise<void> {
  const stream = await getClient().responses.create({
    model: MODEL,
    input: [{ role: 'user', content: prompt }],
    stream: true,
  });

  for await (const event of stream) {
    if (event.type === 'response.output_text.delta') {
      onChunk(event.delta);
    }
  }
}
