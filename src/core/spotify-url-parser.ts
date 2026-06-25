import type { SpotifyContentType, SpotifyUrl } from './types.ts';

const VALID_CONTENT_TYPES = new Set<string>(['track', 'album', 'playlist', 'artist']);

export function parseSpotifyUrl(input: string): SpotifyUrl | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('spotify:')) {
    return parseSpotifyUri(trimmed);
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.hostname === 'spotify.link') {
    return parseShortUrl(trimmed, url);
  }

  if (url.hostname !== 'open.spotify.com') {
    return null;
  }

  return parseStandardUrl(trimmed, url);
}

function parseSpotifyUri(input: string): SpotifyUrl | null {
  const parts = input.split(':');
  if (parts.length < 3) return null;

  const contentType = parts[1]!;
  const id = parts[2]!;

  if (!VALID_CONTENT_TYPES.has(contentType) || !id) return null;

  return {
    originalUrl: input,
    contentType: contentType as SpotifyContentType,
    spotifyId: id,
  };
}

function parseShortUrl(input: string, url: URL): SpotifyUrl | null {
  const id = url.pathname.replace(/^\//, '');
  if (!id) return null;

  return {
    originalUrl: input,
    contentType: 'unknown',
    spotifyId: id,
  };
}

function parseStandardUrl(input: string, url: URL): SpotifyUrl | null {
  let pathname = url.pathname;

  // Strip locale prefix: /intl-XX/
  pathname = pathname.replace(/^\/intl-[a-z]{2}\//, '/');

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  const contentType = segments[0]!;
  const id = segments[1]!;

  if (!VALID_CONTENT_TYPES.has(contentType) || !id) return null;

  return {
    originalUrl: input,
    contentType: contentType as SpotifyContentType,
    spotifyId: id,
  };
}
