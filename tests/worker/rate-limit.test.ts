import { describe, it, expect, vi } from 'vitest';
import { isRateLimited, rateLimitKey } from '../../worker/src/rate-limit.ts';

function requestFrom(ip: string | null): Request {
  const headers = new Headers();
  if (ip) headers.set('CF-Connecting-IP', ip);
  return new Request('https://worker.example/track?id=x', { headers });
}

describe('rateLimitKey', () => {
  it('uses the CF-Connecting-IP header', () => {
    expect(rateLimitKey(requestFrom('203.0.113.7'))).toBe('203.0.113.7');
  });

  it('falls back to a shared key when the header is missing', () => {
    expect(rateLimitKey(requestFrom(null))).toBe('unknown');
  });
});

describe('isRateLimited', () => {
  it('returns false when no limiter is bound (local dev / tests)', async () => {
    expect(await isRateLimited(undefined, requestFrom('203.0.113.7'))).toBe(false);
  });

  it('returns false when the limiter allows the request', async () => {
    const limit = vi.fn().mockResolvedValue({ success: true });
    expect(await isRateLimited({ limit }, requestFrom('203.0.113.7'))).toBe(false);
    expect(limit).toHaveBeenCalledWith({ key: '203.0.113.7' });
  });

  it('returns true when the limiter rejects the request', async () => {
    const limit = vi.fn().mockResolvedValue({ success: false });
    expect(await isRateLimited({ limit }, requestFrom('203.0.113.7'))).toBe(true);
  });

  it('fails open when the limiter throws', async () => {
    const limit = vi.fn().mockRejectedValue(new Error('binding unavailable'));
    expect(await isRateLimited({ limit }, requestFrom('203.0.113.7'))).toBe(false);
  });
});
