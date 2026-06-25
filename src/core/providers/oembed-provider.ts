import type { OEmbedResponse, SpotifyUrl, TrackInfo, TrackInfoProvider } from '../types.ts';

const OEMBED_ENDPOINT = 'https://open.spotify.com/oembed';
const TIMEOUT_MS = 5000;

export class OEmbedProvider implements TrackInfoProvider {
  readonly name = 'oembed';

  async fetchTrackInfo(url: SpotifyUrl): Promise<TrackInfo> {
    const oembedUrl = `${OEMBED_ENDPOINT}?url=${encodeURIComponent(url.originalUrl)}`;

    const response = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`oEmbed API returned ${response.status}`);
    }

    const data = (await response.json()) as OEmbedResponse;

    if (typeof data.title !== 'string') {
      throw new Error('oEmbed response missing title field');
    }

    return {
      title: data.title,
      artist: null,
      spotifyUrl: url.originalUrl,
      thumbnailUrl: data.thumbnail_url,
    };
  }
}
