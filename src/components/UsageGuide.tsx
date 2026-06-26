const steps = [
  'Spotifyアプリで曲を開く',
  'シェアボタンをタップ',
  '「リンクをコピー」を選択',
  '上のフィールドに貼り付け',
];

export function UsageGuide() {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200/50 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <h2 className="text-sm font-bold text-gray-700 dark:text-white/60">
        使い方
      </h2>
      <ol className="mt-3 space-y-2 text-sm text-gray-600 dark:text-white/60">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-spotify text-xs font-bold text-white">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
