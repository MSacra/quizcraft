exports.handler = async function(event, context) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  // Get token from cookie
  const cookie = event.headers.cookie || event.headers.Cookie || '';
  const match = cookie.match(/gc_token=([^;]+)/);
  if (!match) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Not authenticated. Please connect Google Classroom first.' }) };

  let tokenData;
  try { tokenData = JSON.parse(Buffer.from(match[1], 'base64').toString()); }
  catch(e) { return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid token.' }) }; }

  // Refresh token if expired
  let accessToken = tokenData.access_token;
  if (Date.now() > tokenData.expires_at - 60000 && tokenData.refresh_token) {
    try {
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token'
        }).toString()
      });
      const refreshed = await refreshRes.json();
      if (refreshed.access_token) accessToken = refreshed.access_token;
    } catch(e) {}
  }

  try {
    const { courseId, courseWorkId, studentEmail, comment, grade, maxGrade } = JSON.parse(event.body);

    // Find student submission
    const subsRes = await fetch(
      'https://classroom.googleapis.com/v1/courses/' + courseId + '/courseWork/' + courseWorkId + '/studentSubmissions?userId=' + encodeURIComponent(studentEmail),
      { headers: { Authorization: 'Bearer ' + accessToken } }
    );
    const subsData = await subsRes.json();
    const submission = subsData.studentSubmissions && subsData.studentSubmissions[0];

    if (!submission) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Student submission not found. Make sure the student has opened the assignment in Classroom.' }) };
    }

    // Patch grade
    await fetch(
      'https://classroom.googleapis.com/v1/courses/' + courseId + '/courseWork/' + courseWorkId + '/studentSubmissions/' + submission.id + '?updateMask=assignedGrade,draftGrade',
      {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedGrade: grade, draftGrade: grade })
      }
    );

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
