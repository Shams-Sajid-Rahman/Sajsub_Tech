const dateTime = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

// Taka with the sign first: ৳119,900, or ৳8,400.50 when there are paisa.
export const formatMoney = (value) =>
  `৳${Number(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
export const formatDateTime = (value) => (value ? dateTime.format(new Date(value)) : '-');
export const formatDay = (value) => date.format(new Date(value));
export const formatEnum = (value) =>
  value ? value.charAt(0) + value.slice(1).toLowerCase().replaceAll('_', ' ') : '-';

export const enumOptions = (values) => values.map((value) => ({ value, label: formatEnum(value) }));
export const yesNoOptions = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];
