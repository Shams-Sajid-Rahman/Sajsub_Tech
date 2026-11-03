import Button from './ui/Button.jsx';

export default function SubmitButton({ submitting, children }) {
  return (
    <Button type="submit" fullWidth loading={submitting}>
      {submitting ? 'Please wait...' : children}
    </Button>
  );
}
