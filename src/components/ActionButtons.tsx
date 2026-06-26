import { useState, useCallback } from 'react';
import { copyToClipboard } from '../utils/clipboard.ts';
import { canShareFiles } from '../utils/canShareFiles.ts';

interface ActionButtonsProps {
  shareText: string;
  attachImage: boolean;
  thumbnailUrl?: string;
}

const WORKER_URL = import.meta.env.VITE_WORKER_URL as string | undefined;

async function fetchImageFile(thumbnailUrl: string): Promise<File | null> {
  if (!WORKER_URL) return null;
  try {
    const proxyUrl = `${WORKER_URL}/image?url=${encodeURIComponent(thumbnailUrl)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new File([blob], 'cover.jpg', { type: blob.type || 'image/jpeg' });
  } catch {
    return null;
  }
}

export function ActionButtons({ shareText, attachImage, thumbnailUrl }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const fileShareSupported = canShareFiles();
  const shouldShareWithImage = attachImage && fileShareSupported && !!thumbnailUrl;

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
    if (!shouldShareWithImage) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // ユーザーキャンセル (AbortError) は無視
      }
      return;
    }

    setSharing(true);
    try {
      const file = await fetchImageFile(thumbnailUrl!);
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ text: shareText, files: [file] });
      } else {
        await navigator.share({ text: shareText });
      }
    } catch {
      // ユーザーキャンセル (AbortError) は無視
    } finally {
      setSharing(false);
    }
  }, [shareText, shouldShareWithImage, thumbnailUrl]);

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
            disabled={sharing}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {sharing ? '準備中…' : shouldShareWithImage ? '🖼 画像付き共有' : '↗ 共有'}
          </button>
        )}
      </div>
    </div>
  );
}
