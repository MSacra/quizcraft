exports.handler = async function(event, context) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = 'https://quizcraft.hommehonorable.co.uk/api/auth/callback';
  const scope = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.students',
    'https://www.googleapis.com/auth/classroom.rosters.readonly'
  ].join(' ');

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scope);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');

  return {
    statusCode: 302,
    headers: { Location: url.toString() }
  };
};
