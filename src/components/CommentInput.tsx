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
      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 outline-none transition-colors focus:border-[#1DB954] dark:border-gray-600 dark:bg-gray-800 dark:placeholder-gray-500"
    />
  );
}
