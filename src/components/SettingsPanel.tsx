import type { ShareSettings } from '../core/types.ts';

interface SettingsPanelProps {
  settings: ShareSettings;
  onSettingsChange: (partial: Partial<ShareSettings>) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={settings.includeNowPlaying}
          onChange={(e) => onSettingsChange({ includeNowPlaying: e.target.checked })}
          className="h-4 w-4 rounded accent-[#1DB954]"
        />
        #NowPlaying を含める
      </label>

      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400">
          追加ハッシュタグ
        </label>
        <input
          type="text"
          value={settings.customHashtag}
          onChange={(e) => onSettingsChange({ customHashtag: e.target.value })}
          placeholder="例: #なうぷれ"
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[#1DB954] dark:border-gray-600 dark:bg-gray-800 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  );
}
