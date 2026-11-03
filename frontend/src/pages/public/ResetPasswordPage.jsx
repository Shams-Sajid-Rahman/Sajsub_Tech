import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FormField from '../../components/FormField.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import SubmitButton from '../../components/SubmitButton.jsx';
import { useForm } from '../../hooks/useForm.js';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import { authService } from '../../services/auth.service.js';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const form = useForm({ password: '' });
  const [done, setDone] = useState('');

  const onSubmit = form.submitWith(async ({ password }) => {
    const { message } = await authService.resetPassword({ token, password });
    setDone(message);
  });

  const footer = (
    <Link to="/login" className="font-semibold text-primary-dark">
      Go to log in
    </Link>
  );

  if (!token) {
    return (
      <AuthLayout title="Reset your password" footer={footer}>
        <FormMessage>This reset link is invalid. Please request a new one.</FormMessage>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Choose a new password." footer={footer}>
      {done ? (
        <FormMessage type="success">{done}</FormMessage>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormMessage>{form.error}</FormMessage>
          <FormField label="New password" name="password" type="password" autoComplete="new-password" required value={form.values.password} onChange={form.handleChange} error={form.fieldErrors.password} />
          <p className="text-xs text-muted">At least 8 characters, with a letter and a number.</p>
          <SubmitButton submitting={form.submitting}>Reset password</SubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
