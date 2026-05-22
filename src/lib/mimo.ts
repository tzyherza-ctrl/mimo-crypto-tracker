const MIMO_BASE = 'https://api.xiaomimimo.com/v1';
const MIMO_KEY = process.env.MIMO_API_KEY || '';

interface MiMoMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Text reasoning with MiMo
export async function mimoReason(messages: MiMoMessage[]): Promise<string> {
  const res = await fetch(`${MIMO_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MIMO_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiMo-V2.5',
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Analysis unavailable.';
}

// Web search via MiMo tool calling
export async function mimoWebSearch(query: string): Promise<string> {
  const res = await fetch(`${MIMO_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MIMO_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiMo-V2.5',
      messages: [
        { role: 'user', content: `Search the web for: ${query}. Summarize the key findings.` }
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'web_search',
          description: 'Search the web for information',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' }
            },
            required: ['query']
          }
        }
      }],
      tool_choice: 'auto',
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Search results unavailable.';
}

// Image analysis via MiMo vision
export async function mimoVision(imageBase64: string, prompt: string): Promise<string> {
  const res = await fetch(`${MIMO_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MIMO_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiMo-V2.5-VL',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
        ]
      }],
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Vision analysis unavailable.';
}

// TTS via MiMo
export async function mimoTTS(text: string): Promise<ArrayBuffer> {
  const res = await fetch(`${MIMO_BASE}/audio/speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MIMO_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiMo-V2.5-TTS',
      input: text,
      voice: 'alloy',
    }),
  });
  return res.arrayBuffer();
}
