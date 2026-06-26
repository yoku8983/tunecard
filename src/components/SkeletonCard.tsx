export function SkeletonCard() {
  return (
    <div className="mt-4 rounded-2xl border border-gray-200/50 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="flex animate-pulse gap-4">
        <div className="h-20 w-20 shrink-0 rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="h-10 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="h-10 rounded-full bg-gray-200 dark:bg-white/10" />
        <div className="flex gap-3">
          <div className="h-10 flex-1 rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="h-10 flex-1 rounded-full bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}
