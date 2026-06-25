import { describe, it, expect } from 'vitest';
import { parseSpotifyUrl } from '../../src/core/spotify-url-parser.ts';

describe('parseSpotifyUrl', () => {
  describe('valid standard URLs', () => {
    it('parses a track URL', () => {
      const result = parseSpotifyUrl('https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6');
      expect(result).toEqual({
        originalUrl: 'https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6',
        contentType: 'track',
        spotifyId: '6rqhFgbbKwnb9MLmUQDhG6',
      });
    });

    it('parses a track URL with query parameters', () => {
      const result = parseSpotifyUrl(
        'https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6?si=abcdef123',
      );
      expect(result).not.toBeNull();
      expect(result!.contentType).toBe('track');
      expect(result!.spotifyId).toBe('6rqhFgbbKwnb9MLmUQDhG6');
    });

    it('parses an album URL', () => {
      const result = parseSpotifyUrl('https://open.spotify.com/album/2noRn2Aes5aoNVsU6iWThc');
      expect(result).toEqual({
        originalUrl: 'https://open.spotify.com/album/2noRn2Aes5aoNVsU6iWThc',
        contentType: 'album',
        spotifyId: '2noRn2Aes5aoNVsU6iWThc',
      });
    });

    it('parses a playlist URL', () => {
      const result = parseSpotifyUrl(
        'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
      );
      expect(result).not.toBeNull();
      expect(result!.contentType).toBe('playlist');
      expect(result!.spotifyId).toBe('37i9dQZF1DXcBWIGoYBM5M');
    });

    it('parses an artist URL', () => {
      const result = parseSpotifyUrl('https://open.spotify.com/artist/6eUKZXaKkcviH0Ku9w2n3V');
      expect(result).not.toBeNull();
      expect(result!.contentType).toBe('artist');
      expect(result!.spotifyId).toBe('6eUKZXaKkcviH0Ku9w2n3V');
    });
  });

  describe('locale-prefixed URLs', () => {
    it('parses a URL with intl-ja prefix', () => {
      const result = parseSpotifyUrl(
        'https://open.spotify.com/intl-ja/track/6rqhFgbbKwnb9MLmUQDhG6',
      );
      expect(result).not.toBeNull();
      expect(result!.contentType).toBe('track');
      expect(result!.spotifyId).toBe('6rqhFgbbKwnb9MLmUQDhG6');
    });

    it('parses a URL with intl-de prefix', () => {
      const result = parseSpotifyUrl(
        'https://open.spotify.com/intl-de/album/2noRn2Aes5aoNVsU6iWThc',
      );
      expect(result).not.toBeNull();
      expect(result!.contentType).toBe('album');
      expect(result!.spotifyId).toBe('2noRn2Aes5aoNVsU6iWThc');
    });
  });

  describe('Spotify URIs', () => {
    it('parses a track URI', () => {
      const result = parseSpotifyUrl('spotify:track:6rqhFgbbKwnb9MLmUQDhG6');
      expect(result).not.toBeNull();
      expect(result!.contentType).toBe('track');
      expect(result!.spotifyId).toBe('6rqhFgbbKwnb9MLmUQDhG6');
    });

    it('parses an album URI', () => {
      const result = parseSpotifyUrl('spotify:album:2noRn2Aes5aoNVsU6iWThc');
      expect(result).not.toBeNull();
      expect(result!.contentType).toBe('album');
      expect(result!.spotifyId).toBe('2noRn2Aes5aoNVsU6iWThc');
    });
  });

  describe('short URLs', () => {
    it('parses a spotify.link short URL', () => {
      const result = parseSpotifyUrl('https://spotify.link/abc123XYZ');
      expect(result).not.toBeNull();
      expect(result!.contentType).toBe('unknown');
      expect(result!.spotifyId).toBe('abc123XYZ');
      expect(result!.originalUrl).toBe('https://spotify.link/abc123XYZ');
    });
  });

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseSpotifyUrl('')).toBeNull();
    });

    it('returns null for non-URL text', () => {
      expect(parseSpotifyUrl('not a url')).toBeNull();
    });

    it('returns null for non-Spotify URL', () => {
      expect(parseSpotifyUrl('https://example.com/track/123')).toBeNull();
    });

    it('returns null for Spotify URL without content type', () => {
      expect(parseSpotifyUrl('https://open.spotify.com/')).toBeNull();
    });

    it('returns null for Spotify URL without ID', () => {
      expect(parseSpotifyUrl('https://open.spotify.com/track/')).toBeNull();
    });

    it('returns null for Spotify URL with only domain', () => {
      expect(parseSpotifyUrl('https://open.spotify.com')).toBeNull();
    });
  });

  describe('originalUrl preservation', () => {
    it('preserves the full original URL including query params', () => {
      const input = 'https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6?si=abc&nd=1';
      const result = parseSpotifyUrl(input);
      expect(result!.originalUrl).toBe(input);
    });
  });
});
