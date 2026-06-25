import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsageGuide } from '../../src/components/UsageGuide.tsx';

describe('UsageGuide', () => {
  it('4つのステップが全て表示される', () => {
    render(<UsageGuide />);

    expect(screen.getByText('Spotifyアプリで曲を開く')).toBeInTheDocument();
    expect(screen.getByText('シェアボタンをタップ')).toBeInTheDocument();
    expect(
      screen.getByText('「リンクをコピー」を選択'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('上のフィールドに貼り付け'),
    ).toBeInTheDocument();
  });

  it('ol要素で構造化されている', () => {
    render(<UsageGuide />);

    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
  });
});
