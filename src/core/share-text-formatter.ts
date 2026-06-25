import type { TrackInfo } from './types.ts';

export function formatShareText(info: TrackInfo, template: string, comment?: string): string {
  let text = template;

  // When artist is null, remove {artist} and surrounding connector text
  if (info.artist === null) {
    text = text.replace(/\s*[/-]\s*\{artist\}/g, '');
    text = text.replace(/\{artist\}\s*[/-]\s*/g, '');
    text = text.replace(/\{artist\}/g, '');
  } else {
    text = text.replace(/\{artist\}/g, info.artist);
  }

  text = text.replace(/\{title\}/g, info.title);
  text = text.replace(/\{url\}/g, info.spotifyUrl);

  if (comment && comment.trim()) {
    text = `${comment}\n${text}`;
  }

  return text;
}
