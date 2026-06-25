import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App.tsx';

const validOEmbedResponse = {
  title: 'Shape of You',
  thumbnail_url: 'https://i.scdn.co/image/abc123',
  thumbnail_width: 300,
  thumbnail_height: 300,
  html: '<iframe>...</iframe>',
  type: 'rich',
  version: '1.0',
  provider_name: 'Spotify',
  provider_url: 'https://spotify.com',
};

function mockFetchSuccess() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validOEmbedResponse),
    }),
  );
}

const SPOTIFY_URL =
  'https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6';

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('初期状態で使い方ガイドが表示され、リセットボタンは非表示', () => {
    render(<App />);

    expect(screen.getByText('使い方')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /別の曲をシェア/ }),
    ).not.toBeInTheDocument();
  });

  it('楽曲取得成功後、ガイドが消えてリセットボタンが表示される', async () => {
    mockFetchSuccess();
    render(<App />);

    const input = screen.getByPlaceholderText('Spotify URLをペースト...');
    await userEvent.clear(input);
    await userEvent.type(input, SPOTIFY_URL);
    await userEvent.click(screen.getByRole('button', { name: '取得' }));

    await waitFor(() => {
      expect(screen.getByText('Shape of You')).toBeInTheDocument();
    });

    expect(screen.queryByText('使い方')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /別の曲をシェア/ }),
    ).toBeInTheDocument();
  });

  it('リセットボタンで全てクリアされ、ガイドが再表示される', async () => {
    mockFetchSuccess();
    render(<App />);

    const input = screen.getByPlaceholderText('Spotify URLをペースト...');
    await userEvent.clear(input);
    await userEvent.type(input, SPOTIFY_URL);
    await userEvent.click(screen.getByRole('button', { name: '取得' }));

    await waitFor(() => {
      expect(screen.getByText('Shape of You')).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', { name: /別の曲をシェア/ }),
    );

    expect(screen.queryByText('Shape of You')).not.toBeInTheDocument();
    expect(screen.getByText('使い方')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /別の曲をシェア/ }),
    ).not.toBeInTheDocument();

    const clearedInput = screen.getByPlaceholderText(
      'Spotify URLをペースト...',
    );
    expect(clearedInput).toHaveValue('');
  });

  it('エラー時にガイドが表示され、リセットボタンも表示される', async () => {
    render(<App />);

    const input = screen.getByPlaceholderText('Spotify URLをペースト...');
    await userEvent.clear(input);
    await userEvent.type(input, 'invalid-url');
    await userEvent.click(screen.getByRole('button', { name: '取得' }));

    await waitFor(() => {
      expect(screen.getByText(/有効なSpotify URL/)).toBeInTheDocument();
    });

    expect(screen.getByText('使い方')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /別の曲をシェア/ }),
    ).toBeInTheDocument();
  });

  it('エラー後のリセットでエラーが消えガイドが残る', async () => {
    render(<App />);

    const input = screen.getByPlaceholderText('Spotify URLをペースト...');
    await userEvent.clear(input);
    await userEvent.type(input, 'invalid-url');
    await userEvent.click(screen.getByRole('button', { name: '取得' }));

    await waitFor(() => {
      expect(screen.getByText(/有効なSpotify URL/)).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', { name: /別の曲をシェア/ }),
    );

    expect(
      screen.queryByText(/有効なSpotify URL/),
    ).not.toBeInTheDocument();
    expect(screen.getByText('使い方')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /別の曲をシェア/ }),
    ).not.toBeInTheDocument();
  });
});
