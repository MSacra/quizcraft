exports.handler = async function(event, context) {
  const code = event.queryStringParameters && event.queryStringParameters.code;
  const error = event.queryStringParameters && event.queryStringParameters.error;

  if (error || !code) {
    return { statusCode: 302, headers: { Location: '/?auth=error' } };
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = 'https://quizcraft.hommehonorable.co.uk/api/auth/callback';

  try {
    const params = new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: redirectUri, grant_type: 'authorization_code'
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error('No access token: ' + JSON.stringify(tokens));

    const tokenData = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000)
    });
    const encoded = Buffer.from(tokenData).toString('base64');
    const cookie = 'gc_token=' + encoded + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600';

    return {
      statusCode: 302,
      headers: { Location: '/?auth=success', 'Set-Cookie': cookie }
    };
  } catch(e) {
    return { statusCode: 302, headers: { Location: '/?auth=error&msg=' + encodeURIComponent(e.message) } };
  }
};
