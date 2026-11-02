import { Link, useLocation, useNavigate } from 'react-router-dom';
import FormField from '../../components/FormField.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import SubmitButton from '../../components/SubmitButton.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useForm } from '../../hooks/useForm.js';
import AuthLayout from '../../layouts/AuthLayout.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm({ email: '', password: '' });

  const onSubmit = form.submitWith(async (values) => {
    await login(values);
    navigate(location.state?.from ?? '/account', { replace: true });
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-primary">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormMessage>{form.error}</FormMessage>
        <FormField label="Email" name="email" type="email" autoComplete="email" required value={form.values.email} onChange={form.handleChange} error={form.fieldErrors.email} />
        <FormField label="Password" name="password" type="password" autoComplete="current-password" required value={form.values.password} onChange={form.handleChange} error={form.fieldErrors.password} />
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-primary">
            Forgot password?
          </Link>
        </div>
        <SubmitButton submitting={form.submitting}>Log in</SubmitButton>
      </form>
    </AuthLayout>
  );
}
