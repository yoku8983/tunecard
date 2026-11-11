// アクセス元 IP 単位のレート制限（Cloudflare Workers Rate Limiting バインディング）。
// 上限値は wrangler.toml の [[ratelimits]] で設定する。カウントは Cloudflare の拠点ごとで
// 厳密な上限ではない（大量アクセスを大まかに止めるためのもの）。

// Workers の RateLimit 型の必要部分だけを定義（フロントの Vitest からもテストできるように）
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export function rateLimitKey(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}

// 制限超過なら true。バインディング未設定（ローカル）や障害時は通す（fail-open）:
// レート制限の不調で本来の利用者を止めないため。
export async function isRateLimited(
  limiter: RateLimiter | undefined,
  request: Request,
): Promise<boolean> {
  if (!limiter) return false;
  try {
    const { success } = await limiter.limit({ key: rateLimitKey(request) });
    return !success;
  } catch {
    return false;
  }
}
