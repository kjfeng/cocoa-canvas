import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';

const MODEL = 'us.anthropic.claude-sonnet-4-6';
const FAST_MODEL = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';

let _client: AnthropicBedrock | null = null;
function getClient(): AnthropicBedrock {
  if (!_client) {
    _client = new AnthropicBedrock({
      awsRegion: process.env.AWS_REGION ?? 'us-west-2',
    });
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