const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const PRIMARY_MODEL = 'google/gemini-2.5-flash-image-preview';
const FALLBACK_MODEL = 'anthropic/claude-3-opus:beta'; // Just an example, maybe better a vision model like 'google/gemini-pro-vision'

export interface GeneratePhotoResponse {
  imageUrl: string;
  durationMs: number;
}

export async function generatePhoto(
  photoBase64: string,
  prompt: string
): Promise<GeneratePhotoResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const startTime = Date.now();
  
  try {
    return await callOpenRouter(PRIMARY_MODEL, photoBase64, prompt, apiKey, startTime);
  } catch (err) {
    console.error(`Primary model (${PRIMARY_MODEL}) failed, trying fallback:`, err);
    return await callOpenRouter(FALLBACK_MODEL, photoBase64, prompt, apiKey, startTime);
  }
}

async function callOpenRouter(
  model: string,
  photoBase64: string,
  prompt: string,
  apiKey: string,
  startTime: number
): Promise<GeneratePhotoResponse> {
  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3001',
      'X-Title': 'AI PhotoStudio',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${photoBase64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  const durationMs = Date.now() - startTime;

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json() as any;

  // Extract the image URL from the response
  let imageUrl: string | null = null;

  if (data.choices?.[0]?.message?.content) {
    const content = data.choices[0].message.content;
    
    // Some models return a string with Markdown image or just URL
    // Some models return content parts
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          imageUrl = part.image_url.url;
          break;
        }
      }
    } else if (typeof content === 'string') {
      // Basic regex to find URL in string
      const urlMatch = content.match(/https?:\/\/[^\s)]+/);
      if (urlMatch) {
        imageUrl = urlMatch[0];
      }
    }
  }

  if (!imageUrl) {
    throw new Error(`No image URL found in OpenRouter response from model ${model}`);
  }

  return { imageUrl, durationMs };
}
