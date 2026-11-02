export default function FormField({ label, name, error, ...inputProps }) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-navy">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-navy outline-none transition focus:ring-2 focus:ring-primary/30 ${
          error ? 'border-red-500' : 'border-line focus:border-primary'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
