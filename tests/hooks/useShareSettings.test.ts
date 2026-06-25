import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShareSettings } from '../../src/hooks/useShareSettings.ts';
import { DEFAULT_SHARE_SETTINGS } from '../../src/core/types.ts';

describe('useShareSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('localStorage 空 → デフォルト設定を返す', () => {
    const { result } = renderHook(() => useShareSettings());
    expect(result.current.settings).toEqual(DEFAULT_SHARE_SETTINGS);
  });

  it('保存済みデータを復元する', () => {
    localStorage.setItem(
      'tunecard:share-settings',
      JSON.stringify({ includeNowPlaying: false, customHashtag: '#test' }),
    );
    const { result } = renderHook(() => useShareSettings());
    expect(result.current.settings).toEqual({
      includeNowPlaying: false,
      customHashtag: '#test',
    });
  });

  it('updateSettings で部分更新 + localStorage 保存', () => {
    const { result } = renderHook(() => useShareSettings());

    act(() => {
      result.current.updateSettings({ includeNowPlaying: false });
    });

    expect(result.current.settings.includeNowPlaying).toBe(false);
    expect(result.current.settings.customHashtag).toBe('');

    const stored = JSON.parse(localStorage.getItem('tunecard:share-settings')!);
    expect(stored.includeNowPlaying).toBe(false);
  });

  it('updateSettings でカスタムハッシュタグを更新', () => {
    const { result } = renderHook(() => useShareSettings());

    act(() => {
      result.current.updateSettings({ customHashtag: '#なうぷれ' });
    });

    expect(result.current.settings.customHashtag).toBe('#なうぷれ');
    expect(result.current.settings.includeNowPlaying).toBe(true);
  });

  it('不正 JSON → デフォルトにフォールバック', () => {
    localStorage.setItem('tunecard:share-settings', 'not-json');
    const { result } = renderHook(() => useShareSettings());
    expect(result.current.settings).toEqual(DEFAULT_SHARE_SETTINGS);
  });

  it('部分的なデータ → 欠損フィールドはデフォルト補完', () => {
    localStorage.setItem(
      'tunecard:share-settings',
      JSON.stringify({ includeNowPlaying: false }),
    );
    const { result } = renderHook(() => useShareSettings());
    expect(result.current.settings).toEqual({
      includeNowPlaying: false,
      customHashtag: '',
    });
  });
});
