import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebApiProvider } from '../../../src/core/providers/web-api-provider.ts';
import type { SpotifyUrl } from '../../../src/core/types.ts';

const mockSpotifyUrl: SpotifyUrl = {
  originalUrl: 'https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6',
  contentType: 'track',
  spotifyId: '6rqhFgbbKwnb9MLmUQDhG6',
};

const mockAlbumUrl: SpotifyUrl = {
  originalUrl: 'https://open.spotify.com/album/2noRn2Aes5aoNVsU6iWThc',
  contentType: 'album',
  spotifyId: '2noRn2Aes5aoNVsU6iWThc',
};

const mockPlaylistUrl: SpotifyUrl = {
  originalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
  contentType: 'playlist',
  spotifyId: '37i9dQZF1DXcBWIGoYBM5M',
};

const validWorkerResponse = {
  title: 'Shape of You',
  artist: 'Ed Sheeran',
  thumbnailUrl: 'https://i.scdn.co/image/abc123',
};

const validAlbumResponse = {
  title: 'Discovery',
  artist: 'Daft Punk',
  thumbnailUrl: 'https://i.scdn.co/image/album123',
};

const validPlaylistResponse = {
  title: "Today's Top Hits",
  artist: 'Spotify',
  thumbnailUrl: 'https://i.scdn.co/image/playlist123',
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

  describe('album fetch', () => {
    it('returns TrackInfo for album URL', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(validAlbumResponse),
        }),
      );

      const result = await provider.fetchTrackInfo(mockAlbumUrl);
      expect(result.title).toBe('Discovery');
      expect(result.artist).toBe('Daft Punk');
      expect(result.spotifyUrl).toBe(mockAlbumUrl.originalUrl);
      expect(result.thumbnailUrl).toBe('https://i.scdn.co/image/album123');
    });

    it('constructs correct worker URL for album', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(validAlbumResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      await provider.fetchTrackInfo(mockAlbumUrl);

      const calledUrl = mockFetch.mock.calls[0]![0] as string;
      expect(calledUrl).toBe(
        `${WORKER_URL}/album?id=2noRn2Aes5aoNVsU6iWThc`,
      );
    });
  });

  describe('playlist fetch', () => {
    it('returns TrackInfo for playlist URL', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(validPlaylistResponse),
        }),
      );

      const result = await provider.fetchTrackInfo(mockPlaylistUrl);
      expect(result.title).toBe("Today's Top Hits");
      expect(result.artist).toBe('Spotify');
      expect(result.spotifyUrl).toBe(mockPlaylistUrl.originalUrl);
      expect(result.thumbnailUrl).toBe('https://i.scdn.co/image/playlist123');
    });

    it('handles null artist for playlist', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ ...validPlaylistResponse, artist: null }),
        }),
      );

      const result = await provider.fetchTrackInfo(mockPlaylistUrl);
      expect(result.artist).toBeNull();
    });

    it('constructs correct worker URL for playlist', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(validPlaylistResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      await provider.fetchTrackInfo(mockPlaylistUrl);

      const calledUrl = mockFetch.mock.calls[0]![0] as string;
      expect(calledUrl).toBe(
        `${WORKER_URL}/playlist?id=37i9dQZF1DXcBWIGoYBM5M`,
      );
    });
  });

  describe('unsupported content types', () => {
    it('throws for artist content type', async () => {
      const artistUrl: SpotifyUrl = {
        originalUrl: 'https://open.spotify.com/artist/abc123',
        contentType: 'artist',
        spotifyId: 'abc123',
      };

      await expect(provider.fetchTrackInfo(artistUrl)).rejects.toThrow();
    });

    it('throws for unknown content type', async () => {
      const unknownUrl: SpotifyUrl = {
        originalUrl: 'https://spotify.link/abc123',
        contentType: 'unknown',
        spotifyId: 'abc123',
      };

      await expect(provider.fetchTrackInfo(unknownUrl)).rejects.toThrow();
    });
  });

  describe('provider without workerUrl', () => {
    it('throws immediately when workerUrl is empty', async () => {
      const emptyProvider = new WebApiProvider('');

      await expect(emptyProvider.fetchTrackInfo(mockSpotifyUrl)).rejects.toThrow();
    });
  });
});
