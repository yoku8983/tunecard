import type { SpotifyUrl, TrackInfo, TrackInfoProvider } from '../types.ts';

interface WorkerTrackResponse {
  title: string;
  artist: string;
  thumbnailUrl: string | null;
}

const TIMEOUT_MS = 5000;

export class WebApiProvider implements TrackInfoProvider {
  readonly name = 'web-api';
  private readonly workerUrl: string;

  constructor(workerUrl: string) {
    this.workerUrl = workerUrl;
  }

  async fetchTrackInfo(url: SpotifyUrl): Promise<TrackInfo> {
    if (!this.workerUrl) {
      throw new Error('Worker URL is not configured');
    }

    const requestUrl = `${this.workerUrl}/track?id=${url.spotifyId}`;

    const response = await fetch(requestUrl, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Worker API returned ${response.status}`);
    }

    const data = (await response.json()) as WorkerTrackResponse;

    if (typeof data.title !== 'string') {
      throw new Error('Worker response missing title field');
    }

    return {
      title: data.title,
      artist: data.artist ?? null,
      spotifyUrl: url.originalUrl,
      thumbnailUrl: data.thumbnailUrl ?? undefined,
    };
  }
}
