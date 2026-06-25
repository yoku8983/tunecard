export type SpotifyContentType = 'track' | 'album' | 'playlist' | 'artist' | 'unknown';

export interface SpotifyUrl {
  readonly originalUrl: string;
  readonly contentType: SpotifyContentType;
  readonly spotifyId: string;
}

export interface TrackInfo {
  readonly title: string;
  readonly artist: string | null;
  readonly spotifyUrl: string;
  readonly thumbnailUrl?: string;
}

export interface TrackInfoProvider {
  readonly name: string;
  fetchTrackInfo(url: SpotifyUrl): Promise<TrackInfo>;
}

export interface OEmbedResponse {
  title: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  html: string;
  type: string;
  version: string;
  provider_name: string;
  provider_url: string;
}

export const DEFAULT_TEMPLATE = '{title} / {artist} #NowPlaying\n{url}';
