import type { ShareSettings } from '../core/types.ts';

interface SettingsPanelProps {
  settings: ShareSettings;
  onSettingsChange: (partial: Partial<ShareSettings>) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200/50 bg-gray-100/80 p-3 dark:border-white/10 dark:bg-white/5">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={settings.includeNowPlaying}
          onChange={(e) => onSettingsChange({ includeNowPlaying: e.target.checked })}
          className="h-4 w-4 rounded accent-spotify"
        />
        #NowPlaying を含める
      </label>

      <div>
        <label className="block text-xs text-gray-500 dark:text-white/40">
          追加ハッシュタグ
        </label>
        <input
          type="text"
          value={settings.customHashtag}
          onChange={(e) => onSettingsChange({ customHashtag: e.target.value })}
          placeholder="例: #なうぷれ"
          className="mt-1 w-full rounded-xl border border-gray-300/50 bg-white/80 px-3 py-2 text-sm outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400 focus:border-spotify focus:ring-2 focus:ring-spotify/50 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  );
}
