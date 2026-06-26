import { useState, useCallback, type ClipboardEvent, type FormEvent } from 'react';
import { Search } from 'lucide-react';

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
        className="flex-1 rounded-xl border border-gray-300/50 bg-white/80 px-4 py-3 text-base placeholder-gray-400 outline-none backdrop-blur-sm transition-all duration-200 focus:border-spotify focus:ring-2 focus:ring-spotify/50 dark:border-white/10 dark:bg-white/5 dark:placeholder-gray-500"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        aria-label="取得"
        className="rounded-full bg-spotify px-4 py-3 font-medium text-white transition-all duration-200 hover:bg-spotify-dark hover:shadow-[0_0_20px_rgba(29,185,84,0.4)] active:scale-95 disabled:opacity-50 disabled:hover:shadow-none"
      >
        <Search size={20} />
      </button>
    </form>
  );
}
