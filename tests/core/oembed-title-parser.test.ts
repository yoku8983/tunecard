import { describe, it, expect } from 'vitest';
import { parseSpotifyTitle } from '../../src/core/oembed-title-parser.ts';

describe('parseSpotifyTitle', () => {
  describe('HTML page title format - tracks', () => {
    it('parses standard track title', () => {
      const result = parseSpotifyTitle(
        'Shape of You - song and lyrics by Ed Sheeran | Spotify',
      );
      expect(result).toEqual({ title: 'Shape of You', artist: 'Ed Sheeran' });
    });

    it('parses track with multiple artists', () => {
      const result = parseSpotifyTitle(
        'Rich Flex - song and lyrics by Drake, 21 Savage | Spotify',
      );
      expect(result).toEqual({ title: 'Rich Flex', artist: 'Drake, 21 Savage' });
    });

    it('parses Japanese title', () => {
      const result = parseSpotifyTitle(
        '夜に駆ける - song and lyrics by YOASOBI | Spotify',
      );
      expect(result).toEqual({ title: '夜に駆ける', artist: 'YOASOBI' });
    });
  });

  describe('HTML page title format - albums', () => {
    it('parses album title', () => {
      const result = parseSpotifyTitle('Discovery - Album by Daft Punk | Spotify');
      expect(result).toEqual({ title: 'Discovery', artist: 'Daft Punk' });
    });
  });

  describe('HTML page title format - playlists', () => {
    it('parses playlist title', () => {
      const result = parseSpotifyTitle('Chill Vibes - playlist by Spotify | Spotify');
      expect(result).toEqual({ title: 'Chill Vibes', artist: 'Spotify' });
    });
  });

  describe('plain title (oEmbed format)', () => {
    it('returns plain title with artist null', () => {
      const result = parseSpotifyTitle('Shape of You');
      expect(result).toEqual({ title: 'Shape of You', artist: null });
    });

    it('returns plain Japanese title with artist null', () => {
      const result = parseSpotifyTitle('夜に駆ける');
      expect(result).toEqual({ title: '夜に駆ける', artist: null });
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      const result = parseSpotifyTitle('');
      expect(result).toEqual({ title: '', artist: null });
    });

    it('handles title with hyphens in song name', () => {
      const result = parseSpotifyTitle(
        'Re-Birth - song and lyrics by Some Artist | Spotify',
      );
      expect(result).toEqual({ title: 'Re-Birth', artist: 'Some Artist' });
    });

    it('handles unknown format gracefully', () => {
      const result = parseSpotifyTitle('Some Random Title Format');
      expect(result).toEqual({ title: 'Some Random Title Format', artist: null });
    });

    it('strips Spotify suffix from unknown format', () => {
      const result = parseSpotifyTitle('Some Title | Spotify');
      expect(result).toEqual({ title: 'Some Title', artist: null });
    });
  });
});
