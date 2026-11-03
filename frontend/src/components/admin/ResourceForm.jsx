import { useForm } from '../../hooks/useForm.js';
import FormField from '../FormField.jsx';
import FormMessage from '../FormMessage.jsx';
import SubmitButton from '../SubmitButton.jsx';

const INPUT = 'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/30';

const toFormValue = (field, value) => {
  if (field.type === 'checkbox') return Boolean(value ?? field.defaultValue);
  if (value === null || value === undefined) return field.defaultValue ?? '';
  if (field.type === 'datetime-local') return new Date(value).toISOString().slice(0, 16);
  return String(value);
};

// Blank optional fields become null, or are left out when the API has no null form for them.
const toApiValue = (field, value) => {
  if (field.type === 'checkbox') return value;
  const text = value.trim();
  if (text === '') return field.required ? '' : field.nullable ? null : undefined;
  if (field.type === 'datetime-local') return new Date(`${text}Z`).toISOString();
  return text;
};

function FieldInput({ field, form }) {
  const { name, label, type = 'text', options, help, required, ...rest } = field;
  const value = form.values[name];
  const error = form.fieldErrors[name];
  const shared = { name, id: name, onChange: form.handleChange };

  if (type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-navy">
        <input
          type="checkbox"
          name={name}
          checked={value}
          onChange={({ target }) => form.setValues((current) => ({ ...current, [name]: target.checked }))}
          className="size-4 accent-primary"
        />
        {label}
      </label>
    );
  }

  if (type === 'select' || type === 'textarea') {
    return (
      <div>
        <label htmlFor={name} className="mb-1 block text-sm font-medium text-navy">
          {label}
        </label>
        {type === 'select' ? (
          <select {...shared} value={value} className={INPUT}>
            {!required && <option value="">None</option>}
            {required && value === '' && <option value="">Choose...</option>}
            {options.map(({ value: optionValue, label: optionLabel }) => (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            ))}
          </select>
        ) : (
          <textarea {...shared} value={value} rows={3} className={INPUT} />
        )}
        {help && <p className="mt-1 text-xs text-muted">{help}</p>}
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>
    );
  }

  const { nullable, defaultValue, parse, format, ...inputProps } = rest;
  return (
    <div>
      <FormField label={label} name={name} type={type} value={value} onChange={form.handleChange} error={error} {...inputProps} />
      {help && <p className="mt-1 text-xs text-muted">{help}</p>}
    </div>
  );
}

// A config-driven form. fields: [{ name, label, type, options, required, nullable, parse, format }]
export default function ResourceForm({ fields, initial = {}, submitLabel, onSubmit }) {
  const form = useForm(
    Object.fromEntries(
      fields.map((field) => [
        field.name,
        field.format ? field.format(initial[field.name]) : toFormValue(field, initial[field.name]),
      ]),
    ),
  );

  const handleSubmit = form.submitWith(async (values) => {
    const payload = {};
    for (const field of fields) {
      const value = toApiValue(field, values[field.name]);
      if (value !== undefined) payload[field.name] = field.parse ? field.parse(value) : value;
    }
    await onSubmit(payload);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormMessage>{form.error}</FormMessage>
      {fields.map((field) => (
        <FieldInput key={field.name} field={field} form={form} />
      ))}
      <SubmitButton submitting={form.submitting}>{submitLabel}</SubmitButton>
    </form>
  );
}
