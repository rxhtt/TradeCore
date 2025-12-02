export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { messages, model, ...params } = await req.json();
    
    // Key is accessed securely on the server side
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server API Key configuration missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        ...params
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
       return new Response(JSON.stringify(data), { 
         status: response.status,
         headers: { 'Content-Type': 'application/json' }
       });
    }
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}