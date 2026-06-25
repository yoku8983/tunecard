import { describe, it, expect, vi } from 'vitest';
import { FallbackTrackInfoProvider } from '../../../src/core/providers/fallback-provider.ts';
import type { SpotifyUrl, TrackInfo, TrackInfoProvider } from '../../../src/core/types.ts';

const mockSpotifyUrl: SpotifyUrl = {
  originalUrl: 'https://open.spotify.com/track/abc',
  contentType: 'track',
  spotifyId: 'abc',
};

const mockTrackInfo: TrackInfo = {
  title: 'Test Song',
  artist: null,
  spotifyUrl: 'https://open.spotify.com/track/abc',
};

function createMockProvider(
  name: string,
  result: TrackInfo | Error,
): TrackInfoProvider {
  return {
    name,
    fetchTrackInfo: vi.fn().mockImplementation(async () => {
      if (result instanceof Error) throw result;
      return result;
    }),
  };
}

describe('FallbackTrackInfoProvider', () => {
  describe('first provider succeeds', () => {
    it('returns result from first provider', async () => {
      const first = createMockProvider('first', mockTrackInfo);
      const second = createMockProvider('second', mockTrackInfo);
      const fallback = new FallbackTrackInfoProvider([first, second]);

      const result = await fallback.fetchTrackInfo(mockSpotifyUrl);
      expect(result).toEqual(mockTrackInfo);
      expect(first.fetchTrackInfo).toHaveBeenCalledOnce();
      expect(second.fetchTrackInfo).not.toHaveBeenCalled();
    });
  });

  describe('first fails, second succeeds', () => {
    it('returns result from second provider', async () => {
      const first = createMockProvider('first', new Error('first failed'));
      const second = createMockProvider('second', mockTrackInfo);
      const fallback = new FallbackTrackInfoProvider([first, second]);

      const result = await fallback.fetchTrackInfo(mockSpotifyUrl);
      expect(result).toEqual(mockTrackInfo);
      expect(first.fetchTrackInfo).toHaveBeenCalledOnce();
      expect(second.fetchTrackInfo).toHaveBeenCalledOnce();
    });
  });

  describe('all providers fail', () => {
    it('throws the last error', async () => {
      const first = createMockProvider('first', new Error('first failed'));
      const second = createMockProvider('second', new Error('second failed'));
      const fallback = new FallbackTrackInfoProvider([first, second]);

      await expect(fallback.fetchTrackInfo(mockSpotifyUrl)).rejects.toThrow('second failed');
    });
  });

  describe('empty provider list', () => {
    it('throws an error', async () => {
      const fallback = new FallbackTrackInfoProvider([]);

      await expect(fallback.fetchTrackInfo(mockSpotifyUrl)).rejects.toThrow();
    });
  });

  describe('logging', () => {
    it('logs warning when provider fails', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const first = createMockProvider('first', new Error('first failed'));
      const second = createMockProvider('second', mockTrackInfo);
      const fallback = new FallbackTrackInfoProvider([first, second]);

      await fallback.fetchTrackInfo(mockSpotifyUrl);
      expect(warnSpy).toHaveBeenCalledOnce();
      expect(warnSpy.mock.calls[0]![0]).toContain('first');

      warnSpy.mockRestore();
    });
  });
});
