import { useState } from 'react';
import { useToast } from '../../hooks/useToast.js';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';

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
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={handleConfirm} loading={working}>
          {working ? 'Please wait...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
