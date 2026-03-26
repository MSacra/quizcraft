export default async function handler(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return Response.redirect('https://quizcraft.hommehonorable.co.uk/?auth=error', 302);
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
    if (!tokens.access_token) throw new Error('No access token: ' + JSON.stringify(tokens));

    const tokenData = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000)
    });
    const encoded = btoa(tokenData);
    const cookie = 'gc_token=' + encoded + '; Path=/; Secure; SameSite=Lax; Max-Age=3600';

    return new Response(
      '<script>window.location="/?auth=success"</script>',
      { status: 200, headers: { 'Content-Type': 'text/html', 'Set-Cookie': cookie } }
    );
  } catch(e) {
    return Response.redirect('https://quizcraft.hommehonorable.co.uk/?auth=error&msg=' + encodeURIComponent(e.message), 302);
  }
}
export const config = { path: '/api/auth/callback' };
