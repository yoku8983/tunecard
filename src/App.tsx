import { useState, useCallback, useMemo } from 'react';
import { useTrackInfo } from './hooks/useTrackInfo.ts';
import { useShareSettings } from './hooks/useShareSettings.ts';
import { buildTemplate } from './core/template-builder.ts';
import { UrlInput } from './components/UrlInput.tsx';
import { ErrorMessage } from './components/ErrorMessage.tsx';
import { ResultCard } from './components/ResultCard.tsx';
import { UsageGuide } from './components/UsageGuide.tsx';
import { SkeletonCard } from './components/SkeletonCard.tsx';

function App() {
  const { settings, updateSettings } = useShareSettings();
  const template = useMemo(() => buildTemplate(settings), [settings]);
  const { trackInfo, isLoading, error, comment, shareText, setComment, fetchTrack, reset } =
    useTrackInfo(template);
  const [resetKey, setResetKey] = useState(0);

  const handleReset = useCallback(() => {
    reset();
    setResetKey((k) => k + 1);
  }, [reset]);

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-spotify/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <header className="py-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">TuneCard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          曲名付きで、Spotifyをシェア
        </p>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-8">
        <UrlInput key={resetKey} onSubmit={fetchTrack} isLoading={isLoading} />

        {error && <ErrorMessage message={error} />}

        {isLoading && <SkeletonCard />}

        {trackInfo && (
          <ResultCard
            trackInfo={trackInfo}
            shareText={shareText}
            comment={comment}
            onCommentChange={setComment}
            settings={settings}
            onSettingsChange={updateSettings}
          />
        )}

        {(trackInfo || error) && (
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-gray-300/50 bg-white/80 px-4 py-3 text-sm font-medium text-gray-600 backdrop-blur-sm transition-all duration-200 hover:bg-white active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
          >
            別の曲をシェア
          </button>
        )}

        {!trackInfo && !isLoading && <UsageGuide />}
      </main>
    </div>
  );
}

export default App;
