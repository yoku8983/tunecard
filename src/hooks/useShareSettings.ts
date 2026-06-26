import { useState, useCallback } from 'react';
import type { ShareSettings } from '../core/types.ts';
import { DEFAULT_SHARE_SETTINGS } from '../core/types.ts';

const STORAGE_KEY = 'tunecard:share-settings';

function loadSettings(): ShareSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SHARE_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ShareSettings>;
    return {
      includeNowPlaying:
        typeof parsed.includeNowPlaying === 'boolean'
          ? parsed.includeNowPlaying
          : DEFAULT_SHARE_SETTINGS.includeNowPlaying,
      customHashtag:
        typeof parsed.customHashtag === 'string'
          ? parsed.customHashtag
          : DEFAULT_SHARE_SETTINGS.customHashtag,
      attachImage:
        typeof parsed.attachImage === 'boolean'
          ? parsed.attachImage
          : DEFAULT_SHARE_SETTINGS.attachImage,
    };
  } catch {
    return DEFAULT_SHARE_SETTINGS;
  }
}

function saveSettings(settings: ShareSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useShareSettings() {
  const [settings, setSettingsState] = useState<ShareSettings>(loadSettings);

  const updateSettings = useCallback((partial: Partial<ShareSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSettings } as const;
}
