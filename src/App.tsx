import { useTrackInfo } from './hooks/useTrackInfo.ts';
import { UrlInput } from './components/UrlInput.tsx';
import { ErrorMessage } from './components/ErrorMessage.tsx';
import { ResultCard } from './components/ResultCard.tsx';

function App() {
  const { trackInfo, isLoading, error, comment, shareText, setComment, fetchTrack } =
    useTrackInfo();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <header className="py-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">TuneCard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Spotify の曲を X にシェア
        </p>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-8">
        <UrlInput onSubmit={fetchTrack} isLoading={isLoading} />

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
      </main>
    </div>
  );
}

export default App;
