// 入力検証と CORS オリジン判定。Workers 固有 API に依存しない純粋関数にして、
// フロント側の Vitest から直接テストできるようにしている。

// Spotify ID は base62 の 22 文字。これ以外を Spotify API のパスに埋め込まない
// （`../` 等で /v1/tracks/ の外へ出るパスインジェクションを防ぐ）。
const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export function isValidSpotifyId(id: string): boolean {
  return SPOTIFY_ID_PATTERN.test(id);
}

const IMAGE_HOST_ALLOWLIST = new Set([
  'i.scdn.co',
  'mosaic.scdn.co',
  'image-cdn-ak.spotifycdn.com',
]);

export function isAllowedImageUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  return (
    url.protocol === 'https:' &&
    url.port === '' &&
    url.username === '' &&
    url.password === '' &&
    IMAGE_HOST_ALLOWLIST.has(url.hostname)
  );
}

// "https://a.example, http://localhost:5173" → ['https://a.example', 'http://localhost:5173']
export function parseAllowedOrigins(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// リクエストの Origin が許可リストにあれば、その Origin を返す（ACAO にそのまま使う）。
// 許可リストのエントリは完全一致、または `https://*.example.com` 形式のサブドメインワイルドカード。
export function resolveAllowedOrigin(
  origin: string | null,
  allowed: readonly string[],
): string | null {
  if (!origin) return null;

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return null;
  }

  for (const entry of allowed) {
    if (entry === origin) return origin;

    const wildcard = /^(https?):\/\/\*\.(.+)$/.exec(entry);
    if (wildcard) {
      const [, scheme, baseHost] = wildcard;
      if (
        parsed.protocol === `${scheme}:` &&
        parsed.port === '' &&
        parsed.hostname.endsWith(`.${baseHost}`)
      ) {
        return origin;
      }
    }
  }
  return null;
}
