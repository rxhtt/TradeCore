import { AppSettings } from '../types';
import { MODEL_FLASH, MODEL_PRO, DEFAULT_SYSTEM_PROMPT } from '../constants';

export const analyzeMarketData = async (
  prompt: string,
  imagesBase64: string[] | undefined,
  settings: AppSettings
): Promise<string> => {
  
  // Map settings to Perplexity Models
  const modelName = settings.useProModel ? MODEL_PRO : MODEL_FLASH;

  const messages = [
    { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ];

  // Note: Perplexity API does not support image uploads.
  // We strictly follow the text/search protocol here.
  if (imagesBase64 && imagesBase64.length > 0) {
    const imageNote = "\n\n[SYSTEM NOTE]: The user uploaded an image reference locally, but I cannot see it. I must use my online search capabilities to find the live chart/data for the asset mentioned in the text instead.";
    messages[1].content += imageNote;
  }

  try {
    // We call our own Vercel API route
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages,
        temperature: 0.2,
        top_p: 0.9,
        search_domain_filter: ["tradingview.com", "bloomberg.com", "reuters.com", "coindesk.com"],
        return_images: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No analysis generated.";
  } catch (error) {
    console.error("Perplexity Service Error:", error);
    throw new Error("Failed to connect to Analysis Engine. Please check your network.");
  }
};