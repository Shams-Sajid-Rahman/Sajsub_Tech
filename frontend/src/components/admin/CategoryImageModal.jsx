import { useRef, useState } from 'react';
import { useToast } from '../../hooks/useToast.js';
import { apiDelete, apiPut } from '../../services/api.js';
import { RowAction } from './AdminPage.jsx';
import { ACCEPTED_IMAGES, findImageProblem, MAX_IMAGE_MB, toFormData } from './imageFiles.js';
import Modal from '../ui/Modal.jsx';

export default function CategoryImageModal({ category, onClose, onChanged }) {
  const path = `/admin/categories/${category.id}/image`;
  const toast = useToast();
  const [imageUrl, setImageUrl] = useState(category.imageUrl);
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  const run = async (action, message) => {
    setBusy(true);
    try {
      const { data } = await action();
      setImageUrl(data.imageUrl);
      toast.success(message);
      onChanged();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleFile = ({ target }) => {
    const files = [...target.files];
    target.value = '';
    const problem = findImageProblem(files);
    if (problem) toast.error(problem);
    else if (files.length) run(() => apiPut(path, toFormData('image', files)), 'Image uploaded');
  };

  return (
    <Modal title={`Image: ${category.name}`} onClose={onClose}>
      <input ref={input} type="file" accept={ACCEPTED_IMAGES} onChange={handleFile} aria-label="Category image" className="hidden" />
      <div className="mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-line bg-slate-50">
        {imageUrl ? <img src={imageUrl} alt={category.name} className="size-full object-contain" /> : <p className="text-sm text-muted">No image yet.</p>}
      </div>
      <p className="mb-4 text-xs text-muted">JPEG, PNG or WebP, up to {MAX_IMAGE_MB} MB.</p>
      <div className="flex items-center justify-between">
        <button type="button" disabled={busy} onClick={() => input.current.click()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {busy ? 'Working...' : imageUrl ? 'Replace image' : 'Upload image'}
        </button>
        {imageUrl && (
          <RowAction danger disabled={busy} onClick={() => run(() => apiDelete(path), 'Image removed')}>
            Remove
          </RowAction>
        )}
      </div>
    </Modal>
  );
}
