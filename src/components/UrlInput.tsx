import { useState, useCallback, type ClipboardEvent, type FormEvent } from 'react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [value, setValue] = useState('');

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text');
      if (pasted) {
        setTimeout(() => onSubmit(pasted), 0);
      }
    },
    [onSubmit],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(value.trim());
      }
    },
    [value, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPaste={handlePaste}
        placeholder="Spotify URLをペースト..."
        disabled={isLoading}
        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base placeholder-gray-400 outline-none transition-colors focus:border-[#1DB954] dark:border-gray-600 dark:bg-gray-800 dark:placeholder-gray-500"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="rounded-lg bg-[#1DB954] px-4 py-3 font-medium text-white transition-opacity disabled:opacity-50"
      >
        取得
      </button>
    </form>
  );
}
