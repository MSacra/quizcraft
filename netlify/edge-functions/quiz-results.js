export default async () => new Response(JSON.stringify({submissions:[]}), {headers:{'Content-Type':'application/json'}});
export const config = { path: '/api/quiz-results' };
