export default async function handler(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  const url = new URL(request.url);
  const quizId = url.searchParams.get('id');

  if (request.method === 'POST') {
    // Teacher publishes quiz — save definition
    try {
      const body = await request.json();
      if (!body.id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers });
      // Strip SVGs and submissions to keep size small
      const quizToSave = Object.assign({}, body, { submissions: [] });
      quizToSave.questions = (body.questions || []).map(function(q) {
        const clean = Object.assign({}, q);
        delete clean._svg;
        return clean;
      });
      await Netlify.blobs.set('quiz-' + body.id, JSON.stringify(quizToSave), { namespace: 'quiz-data' });
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  if (request.method === 'GET') {
    // Student fetches quiz definition
    if (!quizId) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers });
    try {
      const data = await Netlify.blobs.get('quiz-' + quizId, { namespace: 'quiz-data' });
      if (!data) return new Response(JSON.stringify({ error: 'Quiz not found' }), { status: 404, headers });
      return new Response(data, { status: 200, headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  return new Response('Method not allowed', { status: 405, headers });
}
export const config = { path: '/api/quiz-data' };
