// Netlify Edge Function — quiz data storage using Netlify Blobs
import { getStore } from "https://esm.sh/@netlify/blobs@8";

export default async function handler(request, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  const store = getStore({ name: 'quiz-data', consistency: 'strong' });
  const url = new URL(request.url);
  const quizId = url.searchParams.get('id');

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      if (!body.id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers });
      const quizToSave = Object.assign({}, body, { submissions: [] });
      quizToSave.questions = (body.questions || []).map(function(q) {
        const clean = Object.assign({}, q);
        delete clean._svg;
        // Sanitise markScheme — replace literal newlines with \n escape
        if (clean.markScheme) {
          clean.markScheme = clean.markScheme.replace(/\r\n/g, '\\n').replace(/\n/g, '\\n').replace(/\r/g, '\\n');
        }
        return clean;
      });
      await store.setJSON('quiz-' + body.id, quizToSave);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  if (request.method === 'GET') {
    if (!quizId) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers });
    try {
      const data = await store.get('quiz-' + quizId, { type: 'json' });
      if (!data) return new Response(JSON.stringify({ error: 'Quiz not found' }), { status: 404, headers });
      return new Response(JSON.stringify(data), { status: 200, headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  return new Response('Method not allowed', { status: 405, headers });
}
export const config = { path: '/api/quiz-data' };
