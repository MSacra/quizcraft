// Netlify Edge Function — secure proxy for Anthropic API
// Your API key lives here in Netlify's environment, never sent to the browser

export default async function handler(request) {
  // Only allow POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // CORS headers — allow your GitHub Pages domain
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key not configured on server.' }),
      { status: 500, headers }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status, headers });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Proxy error: ' + err.message }),
      { status: 500, headers }
    );
  }
}

export const config = { path: '/api/claude' };
