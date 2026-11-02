const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateTime = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export const formatMoney = (value) => currency.format(Number(value ?? 0));
export const formatDateTime = (value) => (value ? dateTime.format(new Date(value)) : '-');
export const formatDay = (value) => date.format(new Date(value));
export const formatEnum = (value) =>
  value ? value.charAt(0) + value.slice(1).toLowerCase().replaceAll('_', ' ') : '-';

export const enumOptions = (values) => values.map((value) => ({ value, label: formatEnum(value) }));
export const yesNoOptions = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];
