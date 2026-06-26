import { describe, it, expect, vi, afterEach } from 'vitest';
import { canShareFiles } from '../../src/utils/canShareFiles.ts';

describe('canShareFiles', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('navigator.canShare が未定義なら false', () => {
    vi.stubGlobal('navigator', { canShare: undefined });
    expect(canShareFiles()).toBe(false);
  });

  it('canShare({ files }) が true を返す環境なら true', () => {
    vi.stubGlobal('navigator', {
      canShare: vi.fn().mockReturnValue(true),
    });
    expect(canShareFiles()).toBe(true);
  });

  it('canShare({ files }) が false を返す環境なら false', () => {
    vi.stubGlobal('navigator', {
      canShare: vi.fn().mockReturnValue(false),
    });
    expect(canShareFiles()).toBe(false);
  });

  it('canShare が例外を投げる場合は false', () => {
    vi.stubGlobal('navigator', {
      canShare: vi.fn().mockImplementation(() => {
        throw new TypeError('not supported');
      }),
    });
    expect(canShareFiles()).toBe(false);
  });
});
