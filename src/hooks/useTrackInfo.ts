import { useState, useMemo, useRef, useCallback } from 'react';
import type { TrackInfo } from '../core/types.ts';
import { DEFAULT_TEMPLATE } from '../core/types.ts';
import { parseSpotifyUrl } from '../core/spotify-url-parser.ts';
import { formatShareText } from '../core/share-text-formatter.ts';
import { FallbackTrackInfoProvider } from '../core/providers/fallback-provider.ts';
import { OEmbedProvider } from '../core/providers/oembed-provider.ts';
import { WebApiProvider } from '../core/providers/web-api-provider.ts';

export interface UseTrackInfoReturn {
  trackInfo: TrackInfo | null;
  isLoading: boolean;
  error: string | null;
  comment: string;
  shareText: string;
  setComment: (comment: string) => void;
  fetchTrack: (url: string) => void;
  reset: () => void;
}

export function useTrackInfo(template: string = DEFAULT_TEMPLATE): UseTrackInfoReturn {
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const providerRef = useRef(
    new FallbackTrackInfoProvider([
      ...(import.meta.env.VITE_WORKER_URL
        ? [new WebApiProvider(import.meta.env.VITE_WORKER_URL)]
        : []),
      new OEmbedProvider(),
    ]),
  );

  const shareText = useMemo(() => {
    if (!trackInfo) return '';
    return formatShareText(trackInfo, template, comment || undefined);
  }, [trackInfo, comment, template]);

  const reset = useCallback(() => {
    setTrackInfo(null);
    setIsLoading(false);
    setError(null);
    setComment('');
  }, []);

  const fetchTrack = useCallback(
    (url: string) => {
      const parsed = parseSpotifyUrl(url);
      if (!parsed) {
        setError('有効なSpotify URLを入力してください');
        setTrackInfo(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setTrackInfo(null);

      providerRef.current
        .fetchTrackInfo(parsed)
        .then((info) => {
          setTrackInfo(info);
          setIsLoading(false);
        })
        .catch((err: Error) => {
          setError(err.message || '楽曲情報を取得できませんでした');
          setIsLoading(false);
        });
    },
    [],
  );

  return {
    trackInfo,
    isLoading,
    error,
    comment,
    shareText,
    setComment,
    fetchTrack,
    reset,
  };
}
