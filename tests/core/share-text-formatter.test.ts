import { describe, it, expect } from 'vitest';
import { formatShareText } from '../../src/core/share-text-formatter.ts';
import type { TrackInfo } from '../../src/core/types.ts';
import { DEFAULT_TEMPLATE } from '../../src/core/types.ts';

const fullInfo: TrackInfo = {
  title: 'Shape of You',
  artist: 'Ed Sheeran',
  spotifyUrl: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
};

const noArtistInfo: TrackInfo = {
  title: 'Shape of You',
  artist: null,
  spotifyUrl: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
};

describe('formatShareText', () => {
  describe('default template with full data', () => {
    it('formats correctly', () => {
      const result = formatShareText(fullInfo, DEFAULT_TEMPLATE);
      expect(result).toBe(
        'Shape of You / Ed Sheeran #NowPlaying\nhttps://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
      );
    });
  });

  describe('artist is null', () => {
    it('omits artist and surrounding connector', () => {
      const result = formatShareText(noArtistInfo, DEFAULT_TEMPLATE);
      expect(result).toBe(
        'Shape of You #NowPlaying\nhttps://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
      );
    });
  });

  describe('comment', () => {
    it('prepends comment with newline', () => {
      const result = formatShareText(fullInfo, DEFAULT_TEMPLATE, 'Great song!');
      expect(result).toBe(
        'Great song!\nShape of You / Ed Sheeran #NowPlaying\nhttps://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
      );
    });

    it('ignores empty comment', () => {
      const result = formatShareText(fullInfo, DEFAULT_TEMPLATE, '');
      expect(result).toBe(
        'Shape of You / Ed Sheeran #NowPlaying\nhttps://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
      );
    });

    it('ignores undefined comment', () => {
      const result = formatShareText(fullInfo, DEFAULT_TEMPLATE, undefined);
      expect(result).toBe(
        'Shape of You / Ed Sheeran #NowPlaying\nhttps://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
      );
    });

    it('prepends comment when artist is null', () => {
      const result = formatShareText(noArtistInfo, DEFAULT_TEMPLATE, 'Nice!');
      expect(result).toBe(
        'Nice!\nShape of You #NowPlaying\nhttps://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
      );
    });
  });

  describe('special characters', () => {
    it('preserves ampersand and emoji in title', () => {
      const info: TrackInfo = {
        title: 'Rock & Roll 🎸',
        artist: 'Artist',
        spotifyUrl: 'https://open.spotify.com/track/abc',
      };
      const result = formatShareText(info, DEFAULT_TEMPLATE);
      expect(result).toContain('Rock & Roll 🎸');
    });
  });

  describe('custom templates', () => {
    it('formats with custom template', () => {
      const result = formatShareText(fullInfo, '{title} by {artist}\n{url}');
      expect(result).toBe(
        'Shape of You by Ed Sheeran\nhttps://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
      );
    });

    it('formats template without artist placeholder', () => {
      const result = formatShareText(fullInfo, 'Now playing: {title}\n{url}');
      expect(result).toBe(
        'Now playing: Shape of You\nhttps://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
      );
    });

    it('formats url-only template', () => {
      const result = formatShareText(fullInfo, '{url}');
      expect(result).toBe('https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3');
    });
  });
});
