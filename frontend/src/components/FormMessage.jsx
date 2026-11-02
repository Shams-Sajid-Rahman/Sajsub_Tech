const STYLES = {
  error: 'bg-red-50 text-red-700',
  success: 'bg-green-50 text-green-700',
};

export default function FormMessage({ type = 'error', children }) {
  if (!children) return null;
  return (
    <p role={type === 'error' ? 'alert' : 'status'} className={`rounded-lg px-3 py-2 text-sm ${STYLES[type]}`}>
      {children}
    </p>
  );
}
