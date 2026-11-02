import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../../components/FormField.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import SubmitButton from '../../components/SubmitButton.jsx';
import { useForm } from '../../hooks/useForm.js';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import { authService } from '../../services/auth.service.js';

export default function ForgotPasswordPage() {
  const form = useForm({ email: '' });
  const [sent, setSent] = useState('');

  const onSubmit = form.submitWith(async ({ email }) => {
    const { message } = await authService.forgotPassword(email);
    setSent(message);
  });

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" className="font-semibold text-primary">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <FormMessage type="success">{sent}</FormMessage>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormMessage>{form.error}</FormMessage>
          <FormField label="Email" name="email" type="email" autoComplete="email" required value={form.values.email} onChange={form.handleChange} error={form.fieldErrors.email} />
          <SubmitButton submitting={form.submitting}>Send reset link</SubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
