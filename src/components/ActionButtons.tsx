import { useState, useCallback } from 'react';
import { copyToClipboard } from '../utils/clipboard.ts';

interface ActionButtonsProps {
  shareText: string;
}

export function ActionButtons({ shareText }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText]);

  const handlePostToX = useCallback(() => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
  }, [shareText]);

  const handlePostToBluesky = useCallback(() => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://bsky.app/intent/compose?text=${encoded}`, '_blank');
  }, [shareText]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.share({ text: shareText });
    } catch {
      // ユーザーキャンセル (AbortError) は無視
    }
  }, [shareText]);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleCopy}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        {copied ? '✓ コピー済み' : '📋 コピー'}
      </button>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePostToX}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-medium text-white transition-opacity hover:opacity-80"
        >
          𝕏 で投稿
        </button>
        <button
          type="button"
          onClick={handlePostToBluesky}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0085FF] px-4 py-3 font-medium text-white transition-opacity hover:opacity-80"
        >
          🦋 Bluesky
        </button>
        {'share' in navigator && (
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            ↗ 共有
          </button>
        )}
      </div>
    </div>
  );
}
