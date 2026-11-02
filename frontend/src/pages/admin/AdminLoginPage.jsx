import { useNavigate } from 'react-router-dom';
import FormField from '../../components/FormField.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import SubmitButton from '../../components/SubmitButton.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useForm } from '../../hooks/useForm.js';
import AuthLayout from '../../layouts/AuthLayout.jsx';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const form = useForm({ email: '', password: '' });

  const onSubmit = form.submitWith(async (values) => {
    await adminLogin(values);
    navigate('/admin', { replace: true });
  });

  return (
    <AuthLayout title="Admin login" subtitle="Sajsub Tech administration">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormMessage>{form.error}</FormMessage>
        <FormField label="Email" name="email" type="email" autoComplete="username" required value={form.values.email} onChange={form.handleChange} error={form.fieldErrors.email} />
        <FormField label="Password" name="password" type="password" autoComplete="current-password" required value={form.values.password} onChange={form.handleChange} error={form.fieldErrors.password} />
        <SubmitButton submitting={form.submitting}>Log in</SubmitButton>
      </form>
    </AuthLayout>
  );
}
