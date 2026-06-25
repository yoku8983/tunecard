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
  it('Web Share API対応時に4つのボタンが表示される', () => {
    enableWebShareApi();
    render(<ActionButtons shareText={shareText} />);

    expect(screen.getByText('📋 コピー')).toBeInTheDocument();
    expect(screen.getByText('𝕏 で投稿')).toBeInTheDocument();
    expect(screen.getByText('🦋 Bluesky')).toBeInTheDocument();
    expect(screen.getByText('↗ 共有')).toBeInTheDocument();
  });

  it('Web Share API非対応時は共有ボタンが非表示', () => {
    disableWebShareApi();
    render(<ActionButtons shareText={shareText} />);

    expect(screen.getByText('📋 コピー')).toBeInTheDocument();
    expect(screen.getByText('𝕏 で投稿')).toBeInTheDocument();
    expect(screen.getByText('🦋 Bluesky')).toBeInTheDocument();
    expect(screen.queryByText('↗ 共有')).not.toBeInTheDocument();
  });

  it('コピーボタンでクリップボードにコピーされる', async () => {
    disableWebShareApi();
    const user = userEvent.setup();
    render(<ActionButtons shareText={shareText} />);

    await user.click(screen.getByText('📋 コピー'));

    expect(copyToClipboard).toHaveBeenCalledWith(shareText);
    expect(screen.getByText('✓ コピー済み')).toBeInTheDocument();
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

    await user.click(screen.getByText('🦋 Bluesky'));

    expect(openMock).toHaveBeenCalledWith(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`,
      '_blank',
    );
  });

  it('共有ボタンでnavigator.shareが呼ばれる', async () => {
    enableWebShareApi();
    const user = userEvent.setup();
    render(<ActionButtons shareText={shareText} />);

    await user.click(screen.getByText('↗ 共有'));

    expect(navigator.share).toHaveBeenCalledWith({ text: shareText });
  });
});
