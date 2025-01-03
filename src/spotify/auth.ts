const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID; // your clientId
const redirectUrl = import.meta.env.VITE_SPOTIFY_REDIRECT_URL;        // your redirect URL - must be localhost URL and/or HTTPS

const authorizationEndpoint = import.meta.env.VITE_SPOTIFY_AUTH_URL;
const tokenEndpoint = import.meta.env.VITE_SPOTIFY_TOKEN_URL;
const scope = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state';

export async function tokenAuth() {
  // On page load, try to fetch auth code from current browser search URL
  const args = new URLSearchParams(window.location.search);
  const code = args.get('code');

  // If we find a code, we're in a callback, do a token exchange
  if (code) {
    const token = await getToken(code);

    // Remove code from URL so we can refresh correctly.
    const url = new URL(window.location.href);
    url.searchParams.delete("code");

    const updatedUrl = url.search ? url.href : url.href.replace('?', '');
    window.history.replaceState({}, document.title, updatedUrl);
    return token
  }
  else {
    redirectToSpotifyAuthorize()
  }
}

async function redirectToSpotifyAuthorize() {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

  const code_verifier = randomString;
  const data = new TextEncoder().encode(code_verifier);
  const hashed = await crypto.subtle.digest('SHA-256', data);

  const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  window.localStorage.setItem('code_verifier', code_verifier);

  const authUrl = new URL(authorizationEndpoint)
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: code_challenge_base64,
    redirect_uri: redirectUrl,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
}

// Soptify API Calls
async function getToken(code:string) {
  const code_verifier = localStorage.getItem('code_verifier') || '';

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUrl,
      code_verifier: code_verifier,
    }),
  });
  
  return await response.json();
}

export async function refreshToken(refresh_token:string) {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }),
  });

  return await response.json();
}
