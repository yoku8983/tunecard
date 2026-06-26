interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="mt-4 rounded-xl border border-red-300/50 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur-sm dark:border-red-500/20 dark:bg-red-900/20 dark:text-red-400">
      {message}
    </div>
  );
}
