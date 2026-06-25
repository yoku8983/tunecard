const steps = [
  'Spotifyアプリで曲を開く',
  'シェアボタンをタップ',
  '「リンクをコピー」を選択',
  '上のフィールドに貼り付け',
];

export function UsageGuide() {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">
        使い方
      </h2>
      <ol className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1DB954] text-xs font-bold text-white">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
