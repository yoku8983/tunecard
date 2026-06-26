interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function CommentInput({ value, onChange }: CommentInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="コメントを追加...（任意）"
      rows={2}
      className="w-full resize-none rounded-xl border border-gray-300/50 bg-white/80 px-4 py-3 text-sm placeholder-gray-400 outline-none backdrop-blur-sm transition-all duration-200 focus:border-spotify focus:ring-2 focus:ring-spotify/50 dark:border-white/10 dark:bg-white/5 dark:placeholder-gray-500"
    />
  );
}
