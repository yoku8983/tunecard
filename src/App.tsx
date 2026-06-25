import { useState, useCallback } from 'react';
import { useTrackInfo } from './hooks/useTrackInfo.ts';
import { UrlInput } from './components/UrlInput.tsx';
import { ErrorMessage } from './components/ErrorMessage.tsx';
import { ResultCard } from './components/ResultCard.tsx';
import { UsageGuide } from './components/UsageGuide.tsx';

function App() {
  const { trackInfo, isLoading, error, comment, shareText, setComment, fetchTrack, reset } =
    useTrackInfo();
  const [resetKey, setResetKey] = useState(0);

  const handleReset = useCallback(() => {
    reset();
    setResetKey((k) => k + 1);
  }, [reset]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <header className="py-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">TuneCard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Spotify の曲を X にシェア
        </p>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-8">
        <UrlInput key={resetKey} onSubmit={fetchTrack} isLoading={isLoading} />

        {error && <ErrorMessage message={error} />}

        {isLoading && (
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#1DB954]" />
          </div>
        )}

        {trackInfo && (
          <ResultCard
            trackInfo={trackInfo}
            shareText={shareText}
            comment={comment}
            onCommentChange={setComment}
          />
        )}

        {(trackInfo || error) && (
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
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
