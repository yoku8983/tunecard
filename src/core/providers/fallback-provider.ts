import type { SpotifyUrl, TrackInfo, TrackInfoProvider } from '../types.ts';

export class FallbackTrackInfoProvider implements TrackInfoProvider {
  readonly name = 'fallback';
  private readonly providers: TrackInfoProvider[];

  constructor(providers: TrackInfoProvider[]) {
    this.providers = providers;
  }

  async fetchTrackInfo(url: SpotifyUrl): Promise<TrackInfo> {
    let lastError: Error | undefined;

    for (const provider of this.providers) {
      try {
        return await provider.fetchTrackInfo(url);
      } catch (error) {
        lastError = error as Error;
        console.warn(`[${provider.name}] failed:`, error);
      }
    }

    throw lastError ?? new Error('All providers failed');
  }
}
