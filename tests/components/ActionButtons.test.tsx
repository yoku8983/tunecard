import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActionButtons } from '../../src/components/ActionButtons.tsx';

vi.mock('../../src/utils/clipboard.ts', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true),
}));

const { copyToClipboard } = await import('../../src/utils/clipboard.ts');

const shareText = 'Shape of You / Ed Sheeran #NowPlaying\nhttps://open.spotify.com/track/abc123';

let openMock: ReturnType<typeof vi.fn>;
let originalShare: unknown;

beforeEach(() => {
  openMock = vi.fn();
  vi.stubGlobal('open', openMock);
});

afterEach(() => {
  vi.restoreAllMocks();
  if (originalShare !== undefined) {
    Object.defineProperty(navigator, 'share', {
      value: originalShare,
      writable: true,
      configurable: true,
    });
  } else {
    delete (navigator as Record<string, unknown>).share;
  }
});

function enableWebShareApi() {
  originalShare = (navigator as Record<string, unknown>).share;
  Object.defineProperty(navigator, 'share', {
    value: vi.fn().mockResolvedValue(undefined),
    writable: true,
    configurable: true,
  });
}

function disableWebShareApi() {
  originalShare = (navigator as Record<string, unknown>).share;
  delete (navigator as Record<string, unknown>).share;
}

describe('ActionButtons', () => {
  it('X・Bluesky・コピーの3ボタンが常時表示される', () => {
    disableWebShareApi();
    render(<ActionButtons shareText={shareText} />);

    expect(screen.getByText(/𝕏 で投稿/)).toBeInTheDocument();
    expect(screen.getByText(/Bluesky/)).toBeInTheDocument();
    expect(screen.getByText(/投稿文をコピー/)).toBeInTheDocument();
  });

  it('thumbnailUrl未指定時は画像付き共有ボタンが非表示', () => {
    enableWebShareApi();
    render(<ActionButtons shareText={shareText} />);

    expect(screen.queryByText(/画像付きで共有/)).not.toBeInTheDocument();
  });

  it('コピーボタンでクリップボードにコピーされる', async () => {
    disableWebShareApi();
    const user = userEvent.setup();
    render(<ActionButtons shareText={shareText} />);

    await user.click(screen.getByText(/投稿文をコピー/));

    expect(copyToClipboard).toHaveBeenCalledWith(shareText);
    expect(screen.getByText(/コピーしました/)).toBeInTheDocument();
  });

  it('XボタンでTwitter intent URLが開く', async () => {
    disableWebShareApi();
    const user = userEvent.setup();
    render(<ActionButtons shareText={shareText} />);

    await user.click(screen.getByText('𝕏 で投稿'));

    expect(openMock).toHaveBeenCalledWith(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      '_blank',
    );
  });

  it('BlueskyボタンでBluesky intent URLが開く', async () => {
    disableWebShareApi();
    const user = userEvent.setup();
    render(<ActionButtons shareText={shareText} />);

    await user.click(screen.getByText(/Bluesky/));

    expect(openMock).toHaveBeenCalledWith(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`,
      '_blank',
    );
  });
});
