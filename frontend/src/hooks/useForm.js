import { useState } from 'react';

// Shared form state: values, submit status, and error messages from the API.
export const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = ({ target }) => {
    setValues((previous) => ({ ...previous, [target.name]: target.value }));
    setFieldErrors((previous) => ({ ...previous, [target.name]: undefined }));
  };

  const submitWith = (action) => async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      await action(values);
    } catch (requestError) {
      // Nested paths such as specifications.0.value show on their top-level field.
      const fields = Object.fromEntries(
        (requestError.errors ?? []).map(({ field, message }) => [field.split('.')[0], message]),
      );
      setFieldErrors(fields);
      setError(Object.keys(fields).length > 0 ? 'Please check the highlighted fields.' : requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setValues, handleChange, submitWith, submitting, error, fieldErrors };
};
