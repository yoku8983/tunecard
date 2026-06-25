import type { ShareSettings } from './types.ts';

export function buildTemplate(settings: ShareSettings): string {
  const tags: string[] = [];

  if (settings.includeNowPlaying) {
    tags.push('#NowPlaying');
  }

  const trimmed = settings.customHashtag.trim();
  if (trimmed) {
    const normalized = trimmed.startsWith('#') ? trimmed.replace(/^#+/, '#') : `#${trimmed}`;
    tags.push(normalized);
  }

  const tagSuffix = tags.length > 0 ? ` ${tags.join(' ')}` : '';
  return `{title} / {artist}${tagSuffix}\n{url}`;
}
