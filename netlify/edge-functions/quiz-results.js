const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: 'Method Not Allowed' };

  try {
    const quizId = event.queryStringParameters?.quizId;
    const store = getStore('quiz-submissions');
    const { blobs } = await store.list({ prefix: quizId ? quizId + '/' : '' });

    const submissions = await Promise.all(
      blobs.map(async (blob) => {
        const data = await store.get(blob.key);
        return JSON.parse(data);
      })
    );

    return { statusCode: 200, headers, body: JSON.stringify({ submissions }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
