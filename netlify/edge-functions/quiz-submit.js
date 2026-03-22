const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method Not Allowed' };

  try {
    const { quizId, submission } = JSON.parse(event.body);
    if (!quizId || !submission) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing quizId or submission' }) };

    const store = getStore('quiz-submissions');
    const key = quizId + '/' + Date.now() + '-' + Math.random().toString(36).slice(2);
    await store.set(key, JSON.stringify(submission));

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, key }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
