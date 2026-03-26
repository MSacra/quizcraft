export default async function handler(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers });
  try {
    const { quizId, submission } = await request.json();
    if (!quizId || !submission) return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400, headers });
    const key = quizId + '/' + Date.now() + '-' + Math.random().toString(36).slice(2);
    await Netlify.blobs.set(key, JSON.stringify(submission), { namespace: 'quiz-submissions' });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
export const config = { path: '/api/quiz-submit' };
