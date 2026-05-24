const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.5-flash-image-preview';

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

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'https://github.com/geniok1980/ai-photostudio',
      'X-Title': 'AI PhotoStudio',
    },
    body: JSON.stringify({
      model: MODEL,
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
  // OpenRouter returns content parts, one of which may be an image
  let imageUrl: string | null = null;

  if (data.choices?.[0]?.message?.content) {
    const content = data.choices[0].message.content;
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          imageUrl = part.image_url.url;
          break;
        }
      }
    }
  }

  if (!imageUrl) {
    throw new Error('No image URL found in OpenRouter response');
  }

  return { imageUrl, durationMs };
}
