import { describe, it, expect } from 'vitest';
import {
  isValidSpotifyId,
  isAllowedImageUrl,
  parseAllowedOrigins,
  resolveAllowedOrigin,
} from '../../worker/src/validation.ts';

describe('isValidSpotifyId', () => {
  it('accepts a 22-char base62 ID', () => {
    expect(isValidSpotifyId('6rqhFgbbKwnb9MLmUQDhG6')).toBe(true);
  });

  it.each([
    ['empty', ''],
    ['too short', '6rqhFgbbKwnb9MLmUQDhG'],
    ['too long', '6rqhFgbbKwnb9MLmUQDhG6x'],
    ['path traversal', '../artists/0TnOYISbd1XYRBk9myaseg'],
    ['slash', '6rqhFgbbKwnb9MLmUQ/hG6'],
    ['query injection', '6rqhFgbbKwnb9MLmUQ?a=1'],
    ['encoded chars', '6rqhFgbbKwnb9MLm%2F%2E%2E'],
  ])('rejects %s', (_label, id) => {
    expect(isValidSpotifyId(id)).toBe(false);
  });
});

describe('isAllowedImageUrl', () => {
  it('accepts https URLs on Spotify image CDNs', () => {
    expect(isAllowedImageUrl('https://i.scdn.co/image/ab67616d0000b273abc')).toBe(true);
    expect(isAllowedImageUrl('https://mosaic.scdn.co/640/abc')).toBe(true);
    expect(isAllowedImageUrl('https://image-cdn-ak.spotifycdn.com/image/abc')).toBe(true);
  });

  it.each([
    ['other host', 'https://example.com/image.png'],
    ['lookalike host', 'https://i.scdn.co.evil.example/image'],
    ['subdomain of allowed host', 'https://x.i.scdn.co/image'],
    ['http scheme', 'http://i.scdn.co/image/abc'],
    ['non-default port', 'https://i.scdn.co:8443/image/abc'],
    ['userinfo', 'https://user@i.scdn.co/image/abc'],
    ['not a URL', 'not a url'],
  ])('rejects %s', (_label, url) => {
    expect(isAllowedImageUrl(url)).toBe(false);
  });
});

describe('parseAllowedOrigins', () => {
  it('splits a comma-separated list and trims entries', () => {
    expect(parseAllowedOrigins(' https://a.example , http://localhost:5173,,')).toEqual([
      'https://a.example',
      'http://localhost:5173',
    ]);
  });

  it('returns an empty list for undefined', () => {
    expect(parseAllowedOrigins(undefined)).toEqual([]);
  });
});

describe('resolveAllowedOrigin', () => {
  const allowed = [
    'https://tunecard.pages.dev',
    'https://*.tunecard.pages.dev',
    'http://localhost:5173',
  ];

  it('returns the origin when it exactly matches', () => {
    expect(resolveAllowedOrigin('https://tunecard.pages.dev', allowed)).toBe(
      'https://tunecard.pages.dev',
    );
    expect(resolveAllowedOrigin('http://localhost:5173', allowed)).toBe('http://localhost:5173');
  });

  it('matches preview subdomains via a *. wildcard entry', () => {
    expect(resolveAllowedOrigin('https://abc123.tunecard.pages.dev', allowed)).toBe(
      'https://abc123.tunecard.pages.dev',
    );
  });

  it.each([
    ['null origin', null],
    ['other site', 'https://evil.example'],
    ['lookalike suffix', 'https://eviltunecard.pages.dev'],
    ['scheme mismatch', 'http://tunecard.pages.dev'],
    ['port mismatch', 'http://localhost:3000'],
    ['wildcard scheme mismatch', 'http://abc.tunecard.pages.dev'],
    ['malformed', 'not a url'],
  ])('returns null for %s', (_label, origin) => {
    expect(resolveAllowedOrigin(origin, allowed)).toBeNull();
  });
});
