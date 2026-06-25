import { describe, it, expect } from 'vitest';
import { buildTemplate } from '../../src/core/template-builder.ts';
import { DEFAULT_TEMPLATE } from '../../src/core/types.ts';
import type { ShareSettings } from '../../src/core/types.ts';

describe('buildTemplate', () => {
  it('NowPlaying ON + タグなし → DEFAULT_TEMPLATE と一致', () => {
    const settings: ShareSettings = { includeNowPlaying: true, customHashtag: '' };
    expect(buildTemplate(settings)).toBe(DEFAULT_TEMPLATE);
  });

  it('NowPlaying OFF + タグなし → ハッシュタグなし', () => {
    const settings: ShareSettings = { includeNowPlaying: false, customHashtag: '' };
    expect(buildTemplate(settings)).toBe('{title} / {artist}\n{url}');
  });

  it('NowPlaying ON + カスタムタグ → 両方含む', () => {
    const settings: ShareSettings = { includeNowPlaying: true, customHashtag: '#なうぷれ' };
    expect(buildTemplate(settings)).toBe('{title} / {artist} #NowPlaying #なうぷれ\n{url}');
  });

  it('NowPlaying OFF + カスタムタグ → カスタムタグのみ', () => {
    const settings: ShareSettings = { includeNowPlaying: false, customHashtag: '#なうぷれ' };
    expect(buildTemplate(settings)).toBe('{title} / {artist} #なうぷれ\n{url}');
  });

  it('前後空白をトリム', () => {
    const settings: ShareSettings = { includeNowPlaying: false, customHashtag: '  #tag  ' };
    expect(buildTemplate(settings)).toBe('{title} / {artist} #tag\n{url}');
  });

  it('# なし入力 → # を付与', () => {
    const settings: ShareSettings = { includeNowPlaying: false, customHashtag: 'tag' };
    expect(buildTemplate(settings)).toBe('{title} / {artist} #tag\n{url}');
  });

  it('重複 # → 正規化', () => {
    const settings: ShareSettings = { includeNowPlaying: false, customHashtag: '##tag' };
    expect(buildTemplate(settings)).toBe('{title} / {artist} #tag\n{url}');
  });

  it('空白のみのカスタムタグ → 無視', () => {
    const settings: ShareSettings = { includeNowPlaying: true, customHashtag: '   ' };
    expect(buildTemplate(settings)).toBe(DEFAULT_TEMPLATE);
  });
});
