import { Star, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { apiDelete, apiPatch, apiPost, apiPut } from '../../services/api.js';
import { RowAction } from './AdminPage.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import { ACCEPTED_IMAGES, findImageProblem, MAX_IMAGE_MB, toFormData } from './imageFiles.js';
import Modal from '../ui/Modal.jsx';
import LoadingSkeleton from '../ui/LoadingSkeleton.jsx';

export default function ProductImagesModal({ product, onClose, onChanged }) {
  const path = `/admin/products/${product.id}`;
  const { data, loading, error, reload } = useFetch(path);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [replacing, setReplacing] = useState(null);
  const addInput = useRef(null);
  const replaceInput = useRef(null);

  const run = async (action, message) => {
    setBusy(true);
    try {
      await action();
      toast.success(message);
      reload();
      onChanged();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const validFiles = ({ target }) => {
    const files = [...target.files];
    target.value = '';
    const problem = findImageProblem(files);
    if (problem) toast.error(problem);
    return problem || files.length === 0 ? null : files;
  };

  const handleAdd = (event) => {
    const files = validFiles(event);
    if (files) run(() => apiPost(`${path}/images`, toFormData('images', files)), 'Images uploaded');
  };

  const handleReplace = (event) => {
    const files = validFiles(event);
    if (files) run(() => apiPut(`${path}/images/${replacing}`, toFormData('image', files)), 'Image replaced');
  };

  const removeImage = async () => {
    await apiDelete(`${path}/images/${deleting.id}`);
    toast.success('Image deleted');
    reload();
    onChanged();
  };

  const images = data?.images ?? [];

  return (
    <Modal size="lg" title={`Images: ${product.name}`} onClose={onClose}>
      <input ref={addInput} type="file" multiple accept={ACCEPTED_IMAGES} onChange={handleAdd} aria-label="Add images" className="hidden" />
      <input ref={replaceInput} type="file" accept={ACCEPTED_IMAGES} onChange={handleReplace} aria-label="Replacement image" className="hidden" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">JPEG, PNG or WebP, up to {MAX_IMAGE_MB} MB each. 20 images at most.</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => addInput.current.click()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          <Upload aria-hidden="true" className="size-4" />
          {busy ? 'Working...' : 'Upload images'}
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !data && <LoadingSkeleton className="h-40" />}
      {data && images.length === 0 && <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">No images yet.</p>}

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((image) => (
          <li key={image.id} className="overflow-hidden rounded-lg border border-line">
            <div className="relative aspect-square bg-slate-50">
              <img src={image.url} alt={image.altText ?? product.name} className="size-full object-contain" />
              {image.isPrimary && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                  <Star aria-hidden="true" className="size-3" /> Main
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-y-1 p-2">
              {!image.isPrimary && (
                <RowAction disabled={busy} onClick={() => run(() => apiPatch(`${path}/images/${image.id}/primary`), 'Main image updated')}>
                  Make main
                </RowAction>
              )}
              <RowAction
                disabled={busy}
                onClick={() => {
                  setReplacing(image.id);
                  replaceInput.current.click();
                }}
              >
                Replace
              </RowAction>
              <RowAction danger disabled={busy} onClick={() => setDeleting(image)}>
                Delete
              </RowAction>
            </div>
          </li>
        ))}
      </ul>

      {deleting && (
        <ConfirmDialog
          title="Delete image?"
          message="This image will be permanently deleted."
          confirmLabel="Delete"
          onConfirm={removeImage}
          onClose={() => setDeleting(null)}
        />
      )}
    </Modal>
  );
}
