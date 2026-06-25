import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OEmbedProvider } from '../../../src/core/providers/oembed-provider.ts';
import type { SpotifyUrl } from '../../../src/core/types.ts';

const mockSpotifyUrl: SpotifyUrl = {
  originalUrl: 'https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6',
  contentType: 'track',
  spotifyId: '6rqhFgbbKwnb9MLmUQDhG6',
};

const validOEmbedResponse = {
  title: 'Shape of You',
  thumbnail_url: 'https://i.scdn.co/image/abc123',
  thumbnail_width: 300,
  thumbnail_height: 300,
  html: '<iframe>...</iframe>',
  type: 'rich',
  version: '1.0',
  provider_name: 'Spotify',
  provider_url: 'https://spotify.com',
};

describe('OEmbedProvider', () => {
  let provider: OEmbedProvider;

  beforeEach(() => {
    provider = new OEmbedProvider();
    vi.restoreAllMocks();
  });

  describe('successful fetch', () => {
    it('returns TrackInfo with title and null artist', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(validOEmbedResponse),
        }),
      );

      const result = await provider.fetchTrackInfo(mockSpotifyUrl);
      expect(result.title).toBe('Shape of You');
      expect(result.artist).toBeNull();
      expect(result.spotifyUrl).toBe(mockSpotifyUrl.originalUrl);
      expect(result.thumbnailUrl).toBe('https://i.scdn.co/image/abc123');
    });
  });

  describe('URL construction', () => {
    it('constructs the correct oEmbed URL', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(validOEmbedResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      await provider.fetchTrackInfo(mockSpotifyUrl);

      const calledUrl = mockFetch.mock.calls[0]![0] as string;
      expect(calledUrl).toBe(
        'https://open.spotify.com/oembed?url=https%3A%2F%2Fopen.spotify.com%2Ftrack%2F6rqhFgbbKwnb9MLmUQDhG6',
      );
    });
  });

  describe('HTTP errors', () => {
    it('throws on 404', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
        }),
      );

      await expect(provider.fetchTrackInfo(mockSpotifyUrl)).rejects.toThrow();
    });

    it('throws on 500', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
        }),
      );

      await expect(provider.fetchTrackInfo(mockSpotifyUrl)).rejects.toThrow();
    });
  });

  describe('network errors', () => {
    it('throws on fetch failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

      await expect(provider.fetchTrackInfo(mockSpotifyUrl)).rejects.toThrow();
    });
  });

  describe('malformed response', () => {
    it('throws when title field is missing', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ type: 'rich' }),
        }),
      );

      await expect(provider.fetchTrackInfo(mockSpotifyUrl)).rejects.toThrow();
    });
  });
});
