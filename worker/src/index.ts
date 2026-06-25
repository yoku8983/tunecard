interface Env {
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

interface SpotifyTrackResponse {
  name: string;
  artists: { name: string }[];
  album: {
    images: { url: string; width: number; height: number }[];
  };
}

interface TrackResponse {
  title: string;
  artist: string;
  thumbnailUrl: string | null;
}

let tokenCache: TokenCache | null = null;

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function getAccessToken(env: Env): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  const credentials = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

async function fetchTrack(trackId: string, env: Env): Promise<TrackResponse> {
  const token = await getAccessToken(env);

  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Spotify API returned ${response.status}`);
  }

  const track = (await response.json()) as SpotifyTrackResponse;
  const largestImage = track.album.images.reduce<{ url: string; width: number } | null>(
    (best, img) => (!best || img.width > best.width ? img : best),
    null,
  );

  return {
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    thumbnailUrl: largestImage?.url ?? null,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const url = new URL(request.url);

    if (url.pathname !== '/track') {
      return jsonResponse({ error: 'Not found' }, 404);
    }

    const trackId = url.searchParams.get('id');
    if (!trackId) {
      return jsonResponse({ error: 'Missing id parameter' }, 400);
    }

    try {
      const result = await fetchTrack(trackId, env);
      return jsonResponse(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal error';
      return jsonResponse({ error: message }, 502);
    }
  },
} satisfies ExportedHandler<Env>;
