export default function SubmitButton({ submitting, children }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {submitting ? 'Please wait...' : children}
    </button>
  );
}
