import { useState, useCallback } from 'react';
import { Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard.ts';
import { canShareFiles } from '../utils/canShareFiles.ts';

interface ActionButtonsProps {
  shareText: string;
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

export function ActionButtons({ shareText, thumbnailUrl }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const fileShareSupported = canShareFiles();
  const canShareWithImage = fileShareSupported && !!thumbnailUrl;

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

  const handleShareWithImage = useCallback(async () => {
    if (!thumbnailUrl) return;
    setSharing(true);
    try {
      const file = await fetchImageFile(thumbnailUrl);
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
  }, [shareText, thumbnailUrl]);

  return (
    <div className="flex flex-col gap-3">
      {canShareWithImage && (
        <button
          type="button"
          onClick={handleShareWithImage}
          disabled={sharing}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-spotify px-4 py-3 font-medium text-white transition-all duration-200 hover:bg-spotify-dark hover:shadow-[0_0_20px_rgba(29,185,84,0.4)] active:scale-95 disabled:opacity-50 sm:hidden"
        >
          <Share2 size={18} />
          {sharing ? '準備中…' : '画像付きで共有'}
        </button>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePostToX}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-300/50 bg-white/80 px-4 py-3 font-medium backdrop-blur-sm transition-all duration-200 hover:bg-white active:scale-95 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:border-0 sm:bg-black sm:text-white sm:backdrop-blur-none sm:hover:bg-black sm:hover:opacity-80 dark:sm:bg-white dark:sm:text-gray-900 dark:sm:hover:bg-white dark:sm:hover:opacity-80"
        >
          <ExternalLink size={16} />
          𝕏 で投稿
        </button>
        <button
          type="button"
          onClick={handlePostToBluesky}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-300/50 bg-white/80 px-4 py-3 font-medium backdrop-blur-sm transition-all duration-200 hover:bg-white active:scale-95 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:border-0 sm:bg-[#0085FF] sm:text-white sm:backdrop-blur-none sm:hover:bg-[#0085FF] sm:hover:opacity-80 dark:sm:bg-[#0085FF] dark:sm:text-white dark:sm:hover:bg-[#0085FF] dark:sm:hover:opacity-80"
        >
          <ExternalLink size={16} />
          Bluesky
        </button>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 font-medium transition-all duration-200 active:scale-95 ${
          copied
            ? 'border-spotify/50 bg-spotify/10 text-spotify dark:border-spotify/30 dark:bg-spotify/10 dark:text-spotify-light'
            : 'border-gray-300/50 bg-white/80 text-gray-600 backdrop-blur-sm hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
        }`}
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? 'コピーしました' : '投稿文をコピー'}
      </button>
    </div>
  );
}
