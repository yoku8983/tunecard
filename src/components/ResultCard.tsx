import type { TrackInfo } from '../core/types.ts';
import { CommentInput } from './CommentInput.tsx';
import { ActionButtons } from './ActionButtons.tsx';

interface ResultCardProps {
  trackInfo: TrackInfo;
  shareText: string;
  comment: string;
  onCommentChange: (comment: string) => void;
}

export function ResultCard({ trackInfo, shareText, comment, onCommentChange }: ResultCardProps) {
  return (
    <div className="mt-4 space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div>
        <h2 className="text-lg font-bold">{trackInfo.title}</h2>
        {trackInfo.artist && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{trackInfo.artist}</p>
        )}
      </div>

      <CommentInput value={comment} onChange={onCommentChange} />

      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">プレビュー</p>
        <p className="mt-1 break-all whitespace-pre-wrap text-sm">{shareText}</p>
      </div>

      <ActionButtons shareText={shareText} />
    </div>
  );
}
