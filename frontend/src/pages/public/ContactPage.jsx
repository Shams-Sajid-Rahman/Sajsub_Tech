import { useState } from 'react';
import FormField from '../../components/FormField.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import SubmitButton from '../../components/SubmitButton.jsx';
import { useForm } from '../../hooks/useForm.js';
import { apiPost } from '../../services/api.js';

export default function ContactPage() {
  const form = useForm({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState('');

  const onSubmit = form.submitWith(async (values) => {
    const { message } = await apiPost('/contact', values);
    setSent(message);
  });

  return (
    <StorePage narrow title="Contact us" subtitle="Send us a message and we'll get back to you.">
      <section className={`${CARD} p-6`}>
        {sent ? (
          <FormMessage type="success">{sent}</FormMessage>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormMessage>{form.error}</FormMessage>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Name" name="name" autoComplete="name" value={form.values.name} onChange={form.handleChange} error={form.fieldErrors.name} />
              <FormField label="Email" name="email" type="email" autoComplete="email" value={form.values.email} onChange={form.handleChange} error={form.fieldErrors.email} />
            </div>
            <FormField label="Subject" name="subject" value={form.values.subject} onChange={form.handleChange} error={form.fieldErrors.subject} />
            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-navy">Message</label>
              <textarea id="message" name="message" rows={5} value={form.values.message} onChange={form.handleChange} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              {form.fieldErrors.message && <p className="mt-1 text-xs text-red-700">{form.fieldErrors.message}</p>}
            </div>
            <SubmitButton submitting={form.submitting}>Send message</SubmitButton>
          </form>
        )}
      </section>
    </StorePage>
  );
}
