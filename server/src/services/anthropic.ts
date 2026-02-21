import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';
const FAST_MODEL = 'claude-haiku-4-5-20241022';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export async function generateJSON(prompt: string, opts?: { fast?: boolean }): Promise<string> {
  const response = await getClient().messages.create({
    model: opts?.fast ? FAST_MODEL : MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = response.content[0];
  if (block.type === 'text') return block.text;
  throw new Error('Unexpected response type');
}

export async function streamText(
  prompt: string,
  onChunk: (text: string) => void,
): Promise<void> {
  const stream = getClient().messages.stream({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      onChunk(event.delta.text);
    }
  }
}
