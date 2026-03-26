export default async function handler(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/gc_token=([^;]+)/);
  if (!match) return new Response(JSON.stringify({ error: 'Not authenticated. Please connect Google Classroom first.' }), { status: 401, headers });

  let tokenData;
  try { tokenData = JSON.parse(atob(match[1])); }
  catch(e) { return new Response(JSON.stringify({ error: 'Invalid token.' }), { status: 401, headers }); }

  let accessToken = tokenData.access_token;
  if (Date.now() > tokenData.expires_at - 60000 && tokenData.refresh_token) {
    try {
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token'
        })
      });
      const refreshed = await refreshRes.json();
      if (refreshed.access_token) accessToken = refreshed.access_token;
    } catch(e) {}
  }

  try {
    const { courseId, courseWorkId, studentEmail, comment, grade, maxGrade } = await request.json();

    const subsRes = await fetch(
      'https://classroom.googleapis.com/v1/courses/' + courseId + '/courseWork/' + courseWorkId + '/studentSubmissions?userId=' + encodeURIComponent(studentEmail),
      { headers: { Authorization: 'Bearer ' + accessToken } }
    );
    const subsData = await subsRes.json();
    const submission = subsData.studentSubmissions && subsData.studentSubmissions[0];

    if (!submission) {
      return new Response(JSON.stringify({ error: 'Student not found. Make sure they have opened the assignment in Classroom.' }), { status: 404, headers });
    }

    await fetch(
      'https://classroom.googleapis.com/v1/courses/' + courseId + '/courseWork/' + courseWorkId + '/studentSubmissions/' + submission.id + '?updateMask=assignedGrade,draftGrade',
      {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedGrade: grade, draftGrade: grade })
      }
    );

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
export const config = { path: '/api/classroom-post' };
