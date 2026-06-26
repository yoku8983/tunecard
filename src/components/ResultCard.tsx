import type { TrackInfo, ShareSettings } from '../core/types.ts';
import { CommentInput } from './CommentInput.tsx';
import { ActionButtons } from './ActionButtons.tsx';
import { SettingsPanel } from './SettingsPanel.tsx';

interface ResultCardProps {
  trackInfo: TrackInfo;
  shareText: string;
  comment: string;
  onCommentChange: (comment: string) => void;
  settings: ShareSettings;
  onSettingsChange: (partial: Partial<ShareSettings>) => void;
}

export function ResultCard({
  trackInfo,
  shareText,
  comment,
  onCommentChange,
  settings,
  onSettingsChange,
}: ResultCardProps) {
  return (
    <div className="animate-slide-up mt-4 space-y-4 rounded-2xl border border-gray-200/50 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="flex items-start gap-4">
        {trackInfo.thumbnailUrl && (
          <img
            src={trackInfo.thumbnailUrl}
            alt=""
            className="h-20 w-20 shrink-0 rounded-lg object-cover shadow-md"
          />
        )}
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{trackInfo.title}</h2>
          {trackInfo.artist && (
            <p className="truncate text-sm text-gray-500 dark:text-white/60">
              {trackInfo.artist}
            </p>
          )}
        </div>
      </div>

      <CommentInput value={comment} onChange={onCommentChange} />

      <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} />

      <div className="rounded-xl bg-gray-100/80 p-3 dark:bg-white/5">
        <p className="text-xs font-medium text-gray-500 dark:text-white/40">プレビュー</p>
        <p className="mt-1 break-all whitespace-pre-wrap text-sm">{shareText}</p>
      </div>

      <ActionButtons shareText={shareText} thumbnailUrl={trackInfo.thumbnailUrl} />
    </div>
  );
}
