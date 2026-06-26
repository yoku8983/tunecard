import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPanel } from '../../src/components/SettingsPanel.tsx';
import { DEFAULT_SHARE_SETTINGS } from '../../src/core/types.ts';

describe('SettingsPanel', () => {
  it('チェックボックスと入力欄が常時表示される', () => {
    render(
      <SettingsPanel settings={DEFAULT_SHARE_SETTINGS} onSettingsChange={() => {}} />,
    );

    expect(screen.getByLabelText(/#NowPlaying を含める/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例: #なうぷれ')).toBeInTheDocument();
  });

  it('デフォルトで #NowPlaying トグルが ON', () => {
    render(
      <SettingsPanel settings={DEFAULT_SHARE_SETTINGS} onSettingsChange={() => {}} />,
    );

    expect(screen.getByLabelText(/#NowPlaying を含める/)).toBeChecked();
  });

  it('トグル OFF → onSettingsChange が呼ばれる', async () => {
    const onChange = vi.fn();
    render(
      <SettingsPanel settings={DEFAULT_SHARE_SETTINGS} onSettingsChange={onChange} />,
    );

    await userEvent.click(screen.getByLabelText(/#NowPlaying を含める/));

    expect(onChange).toHaveBeenCalledWith({ includeNowPlaying: false });
  });

  it('トグル ON → onSettingsChange が呼ばれる', async () => {
    const onChange = vi.fn();
    render(
      <SettingsPanel
        settings={{ includeNowPlaying: false, customHashtag: '', attachImage: true }}
        onSettingsChange={onChange}
      />,
    );

    await userEvent.click(screen.getByLabelText(/#NowPlaying を含める/));

    expect(onChange).toHaveBeenCalledWith({ includeNowPlaying: true });
  });

  it('ハッシュタグ入力 → onSettingsChange が呼ばれる', async () => {
    const onChange = vi.fn();
    render(
      <SettingsPanel settings={DEFAULT_SHARE_SETTINGS} onSettingsChange={onChange} />,
    );

    const input = screen.getByPlaceholderText('例: #なうぷれ');
    await userEvent.type(input, 'a');

    expect(onChange).toHaveBeenCalledWith({ customHashtag: 'a' });
  });

  it('settings の値がフォームに反映される', () => {
    render(
      <SettingsPanel
        settings={{ includeNowPlaying: false, customHashtag: '#tag', attachImage: true }}
        onSettingsChange={() => {}}
      />,
    );

    expect(screen.getByLabelText(/#NowPlaying を含める/)).not.toBeChecked();
    expect(screen.getByPlaceholderText('例: #なうぷれ')).toHaveValue('#tag');
  });
});
