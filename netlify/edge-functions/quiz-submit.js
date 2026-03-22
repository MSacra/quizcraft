export default async () => new Response(JSON.stringify({ok:true}), {headers:{'Content-Type':'application/json'}});
export const config = { path: '/api/quiz-submit' };
