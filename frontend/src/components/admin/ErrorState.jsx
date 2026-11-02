export default function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100">
          Try again
        </button>
      )}
    </div>
  );
}
