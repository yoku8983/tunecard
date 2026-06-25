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

interface SpotifyAlbumResponse {
  name: string;
  artists: { name: string }[];
  images: { url: string; width: number; height: number }[];
}

interface SpotifyPlaylistResponse {
  name: string;
  owner: { display_name: string | null };
  images: { url: string; width: number; height: number }[];
}

interface TrackResponse {
  title: string;
  artist: string | null;
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

function selectLargestImage(
  images: { url: string; width: number; height: number }[],
): string | null {
  const best = images.reduce<{ url: string; width: number } | null>(
    (acc, img) => (!acc || img.width > acc.width ? img : acc),
    null,
  );
  return best?.url ?? null;
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

  return {
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    thumbnailUrl: selectLargestImage(track.album.images),
  };
}

async function fetchAlbum(albumId: string, env: Env): Promise<TrackResponse> {
  const token = await getAccessToken(env);

  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Spotify API returned ${response.status}`);
  }

  const album = (await response.json()) as SpotifyAlbumResponse;

  return {
    title: album.name,
    artist: album.artists.map((a) => a.name).join(', '),
    thumbnailUrl: selectLargestImage(album.images),
  };
}

async function fetchPlaylist(playlistId: string, env: Env): Promise<TrackResponse> {
  const token = await getAccessToken(env);

  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Spotify API returned ${response.status}`);
  }

  const playlist = (await response.json()) as SpotifyPlaylistResponse;

  return {
    title: playlist.name,
    artist: playlist.owner.display_name ?? null,
    thumbnailUrl: selectLargestImage(playlist.images),
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
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ error: 'Missing id parameter' }, 400);
    }

    try {
      let result: TrackResponse;

      switch (url.pathname) {
        case '/track':
          result = await fetchTrack(id, env);
          break;
        case '/album':
          result = await fetchAlbum(id, env);
          break;
        case '/playlist':
          result = await fetchPlaylist(id, env);
          break;
        default:
          return jsonResponse({ error: 'Not found' }, 404);
      }

      return jsonResponse(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal error';
      return jsonResponse({ error: message }, 502);
    }
  },
} satisfies ExportedHandler<Env>;
