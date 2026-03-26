// Handles OAuth callback, exchanges code for tokens, stores in cookie
export default async function handler(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return new Response('<script>window.location="/?auth=error"</script>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const redirectUri = 'https://quizcraft.hommehonorable.co.uk/api/auth/callback';

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: redirectUri, grant_type: 'authorization_code'
      })
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error('No access token');

    // Store tokens in a secure cookie (expires in 1 hour)
    const tokenData = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000)
    });
    const encoded = btoa(tokenData);

    return new Response('<script>window.location="/?auth=success"</script>', {
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': `gc_token=${encoded}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`
      }
    });
  } catch(e) {
    return new Response('<script>window.location="/?auth=error&msg=' + encodeURIComponent(e.message) + '"</script>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
export const config = { path: '/api/auth/callback' };
