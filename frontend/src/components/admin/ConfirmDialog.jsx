import { useState } from 'react';
import { useToast } from '../../hooks/useToast.js';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose, danger = true }) {
  const toast = useToast();
  const [working, setWorking] = useState(false);

  const handleConfirm = async () => {
    setWorking(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      toast.error(error.message);
      setWorking(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-navy hover:border-primary">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={working}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}`}
        >
          {working ? 'Please wait...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
