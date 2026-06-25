const PATTERNS: { regex: RegExp; titleIndex: number; artistIndex: number }[] = [
  // "曲名 - song and lyrics by アーティスト | Spotify"
  { regex: /^(.+) - song and lyrics by (.+) \| Spotify$/, titleIndex: 1, artistIndex: 2 },
  // "曲名 - song by アーティスト | Spotify"
  { regex: /^(.+) - song by (.+) \| Spotify$/, titleIndex: 1, artistIndex: 2 },
  // "アルバム名 - Album by アーティスト | Spotify"
  { regex: /^(.+) - Album by (.+) \| Spotify$/, titleIndex: 1, artistIndex: 2 },
  // "プレイリスト名 - playlist by ユーザー | Spotify"
  { regex: /^(.+) - playlist by (.+) \| Spotify$/, titleIndex: 1, artistIndex: 2 },
];

export function parseSpotifyTitle(rawTitle: string): { title: string; artist: string | null } {
  for (const { regex, titleIndex, artistIndex } of PATTERNS) {
    const match = rawTitle.match(regex);
    if (match) {
      return { title: match[titleIndex]!, artist: match[artistIndex]! };
    }
  }

  // Strip " | Spotify" suffix if present
  const suffixMatch = rawTitle.match(/^(.+) \| Spotify$/);
  if (suffixMatch) {
    return { title: suffixMatch[1]!, artist: null };
  }

  return { title: rawTitle, artist: null };
}
