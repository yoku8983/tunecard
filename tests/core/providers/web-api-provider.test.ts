import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebApiProvider } from '../../../src/core/providers/web-api-provider.ts';
import type { SpotifyUrl } from '../../../src/core/types.ts';

const mockSpotifyUrl: SpotifyUrl = {
  originalUrl: 'https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6',
  contentType: 'track',
  spotifyId: '6rqhFgbbKwnb9MLmUQDhG6',
};

const validWorkerResponse = {
  title: 'Shape of You',
  artist: 'Ed Sheeran',
  thumbnailUrl: 'https://i.scdn.co/image/abc123',
};

const WORKER_URL = 'https://tunecard-api.example.workers.dev';

describe('WebApiProvider', () => {
  let provider: WebApiProvider;

  beforeEach(() => {
    provider = new WebApiProvider(WORKER_URL);
    vi.restoreAllMocks();
  });

  describe('successful fetch', () => {
    it('returns TrackInfo with title and artist', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(validWorkerResponse),
        }),
      );

      const result = await provider.fetchTrackInfo(mockSpotifyUrl);
      expect(result.title).toBe('Shape of You');
      expect(result.artist).toBe('Ed Sheeran');
      expect(result.spotifyUrl).toBe(mockSpotifyUrl.originalUrl);
      expect(result.thumbnailUrl).toBe('https://i.scdn.co/image/abc123');
    });

    it('handles null thumbnailUrl', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ ...validWorkerResponse, thumbnailUrl: null }),
        }),
      );

      const result = await provider.fetchTrackInfo(mockSpotifyUrl);
      expect(result.thumbnailUrl).toBeUndefined();
    });
  });

  describe('URL construction', () => {
    it('constructs the correct worker URL with track id', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(validWorkerResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      await provider.fetchTrackInfo(mockSpotifyUrl);

      const calledUrl = mockFetch.mock.calls[0]![0] as string;
      expect(calledUrl).toBe(
        `${WORKER_URL}/track?id=6rqhFgbbKwnb9MLmUQDhG6`,
      );
    });
  });

  describe('HTTP errors', () => {
    it('throws on 404', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 404 }),
      );

      await expect(provider.fetchTrackInfo(mockSpotifyUrl)).rejects.toThrow();
    });

    it('throws on 502', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 502 }),
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
          json: () => Promise.resolve({ artist: 'Ed Sheeran' }),
        }),
      );

      await expect(provider.fetchTrackInfo(mockSpotifyUrl)).rejects.toThrow();
    });
  });

  describe('provider without workerUrl', () => {
    it('throws immediately when workerUrl is empty', async () => {
      const emptyProvider = new WebApiProvider('');

      await expect(emptyProvider.fetchTrackInfo(mockSpotifyUrl)).rejects.toThrow();
    });
  });
});
