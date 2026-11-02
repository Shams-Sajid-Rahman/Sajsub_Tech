import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useForm } from '../hooks/useForm.js';
import { authService } from '../services/auth.service.js';
import FormField from './FormField.jsx';
import FormMessage from './FormMessage.jsx';
import SubmitButton from './SubmitButton.jsx';

const CARD = 'rounded-2xl border border-line bg-white p-6 shadow-sm';

function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const form = useForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' });
  const [saved, setSaved] = useState('');

  const onSubmit = form.submitWith(async ({ phone, ...names }) => {
    setSaved('');
    await updateProfile({ ...names, phone: phone.trim() || null });
    setSaved('Profile updated.');
  });

  return (
    <form onSubmit={onSubmit} className={`${CARD} space-y-4`} noValidate>
      <h2 className="text-lg font-semibold text-navy">Profile</h2>
      <FormMessage>{form.error}</FormMessage>
      <FormMessage type="success">{saved}</FormMessage>
      <p className="text-sm text-muted">{user.email}</p>
      <FormField label="First name" name="firstName" autoComplete="given-name" value={form.values.firstName} onChange={form.handleChange} error={form.fieldErrors.firstName} />
      <FormField label="Last name" name="lastName" autoComplete="family-name" value={form.values.lastName} onChange={form.handleChange} error={form.fieldErrors.lastName} />
      <FormField label="Phone" name="phone" type="tel" autoComplete="tel" value={form.values.phone} onChange={form.handleChange} error={form.fieldErrors.phone} />
      <SubmitButton submitting={form.submitting}>Save changes</SubmitButton>
    </form>
  );
}

function ChangePasswordForm() {
  const form = useForm({ currentPassword: '', newPassword: '' });
  const [saved, setSaved] = useState('');

  const onSubmit = form.submitWith(async (values) => {
    setSaved('');
    await authService.changePassword(values);
    form.setValues({ currentPassword: '', newPassword: '' });
    setSaved('Password changed. Other devices have been signed out.');
  });

  return (
    <form onSubmit={onSubmit} className={`${CARD} space-y-4`} noValidate>
      <h2 className="text-lg font-semibold text-navy">Change password</h2>
      <FormMessage>{form.error}</FormMessage>
      <FormMessage type="success">{saved}</FormMessage>
      <FormField label="Current password" name="currentPassword" type="password" autoComplete="current-password" value={form.values.currentPassword} onChange={form.handleChange} error={form.fieldErrors.currentPassword} />
      <FormField label="New password" name="newPassword" type="password" autoComplete="new-password" value={form.values.newPassword} onChange={form.handleChange} error={form.fieldErrors.newPassword} />
      <SubmitButton submitting={form.submitting}>Change password</SubmitButton>
    </form>
  );
}

export default function ProfileForms() {
  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      <ProfileForm />
      <ChangePasswordForm />
    </div>
  );
}
