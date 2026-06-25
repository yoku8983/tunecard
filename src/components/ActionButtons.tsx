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

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleCopy}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        {copied ? '✓ コピー済み' : '📋 コピー'}
      </button>
      <button
        type="button"
        onClick={handlePostToX}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-medium text-white transition-opacity hover:opacity-80"
      >
        𝕏 で投稿
      </button>
    </div>
  );
}
