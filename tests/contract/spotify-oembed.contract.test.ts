import { describe, it, expect } from 'vitest';
import { parseSpotifyTitle } from '../../src/core/oembed-title-parser.ts';

describe('Spotify oEmbed API contract', () => {
  it('returns 200 and expected fields for a known track URL', async () => {
    const url =
      'https://open.spotify.com/oembed?url=https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh';
    const res = await fetch(url);

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('title');
    expect(typeof json.title).toBe('string');
    expect(json.title.length).toBeGreaterThan(0);
    expect(json).toHaveProperty('thumbnail_url');
    expect(json).toHaveProperty('provider_name');
    expect(json.provider_name).toBe('Spotify');
  });

  it('title can be parsed (at minimum as raw title)', async () => {
    const url =
      'https://open.spotify.com/oembed?url=https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh';
    const res = await fetch(url);
    const json = await res.json();

    const parsed = parseSpotifyTitle(json.title);
    expect(parsed.title.length).toBeGreaterThan(0);

    if (parsed.artist === null) {
      console.warn('WARNING: artist could not be parsed from oEmbed title:', json.title);
    }
  });

  it('returns 200 and expected fields for a known album URL', async () => {
    const url =
      'https://open.spotify.com/oembed?url=https://open.spotify.com/album/2noRn2Aes5aoNVsU6iWThc';
    const res = await fetch(url);

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('title');
    expect(typeof json.title).toBe('string');
    expect(json.title.length).toBeGreaterThan(0);
    expect(json).toHaveProperty('thumbnail_url');
    expect(json.provider_name).toBe('Spotify');
  });

  it('returns 200 and expected fields for a known playlist URL', async () => {
    const url =
      'https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M';
    const res = await fetch(url);

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('title');
    expect(typeof json.title).toBe('string');
    expect(json.title.length).toBeGreaterThan(0);
    expect(json).toHaveProperty('thumbnail_url');
    expect(json.provider_name).toBe('Spotify');
  });
});
