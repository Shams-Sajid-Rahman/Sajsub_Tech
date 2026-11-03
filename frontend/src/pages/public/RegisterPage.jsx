import { Link, useNavigate } from 'react-router-dom';
import FormField from '../../components/FormField.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import SubmitButton from '../../components/SubmitButton.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useForm } from '../../hooks/useForm.js';
import AuthLayout from '../../layouts/AuthLayout.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const form = useForm({ firstName: '', lastName: '', email: '', password: '' });

  const onSubmit = form.submitWith(async (values) => {
    await register(values);
    navigate('/account', { replace: true });
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Sajsub Tech"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-dark">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormMessage>{form.error}</FormMessage>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First name" name="firstName" autoComplete="given-name" required value={form.values.firstName} onChange={form.handleChange} error={form.fieldErrors.firstName} />
          <FormField label="Last name" name="lastName" autoComplete="family-name" required value={form.values.lastName} onChange={form.handleChange} error={form.fieldErrors.lastName} />
        </div>
        <FormField label="Email" name="email" type="email" autoComplete="email" required value={form.values.email} onChange={form.handleChange} error={form.fieldErrors.email} />
        <FormField label="Password" name="password" type="password" autoComplete="new-password" required value={form.values.password} onChange={form.handleChange} error={form.fieldErrors.password} />
        <p className="text-xs text-muted">At least 8 characters, with a letter and a number.</p>
        <SubmitButton submitting={form.submitting}>Create account</SubmitButton>
      </form>
    </AuthLayout>
  );
}
