export default async function handler(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers });
  try {
    const url = new URL(request.url);
    const quizId = url.searchParams.get('quizId');
    if (!quizId) return new Response(JSON.stringify({ error: 'Missing quizId' }), { status: 400, headers });
    const { blobs } = await Netlify.blobs.list({ namespace: 'quiz-submissions', prefix: quizId + '/' });
    const submissions = await Promise.all(
      blobs.map(async (blob) => {
        const data = await Netlify.blobs.get(blob.key, { namespace: 'quiz-submissions' });
        return JSON.parse(data);
      })
    );
    return new Response(JSON.stringify({ submissions }), { status: 200, headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message, submissions: [] }), { status: 500, headers });
  }
}
export const config = { path: '/api/quiz-results' };
