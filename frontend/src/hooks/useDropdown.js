import { useCallback, useEffect, useRef, useState } from 'react';

// Open state for a dropdown that closes on outside click or Escape.
export const useDropdown = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  const show = useCallback(() => setOpen(true), []);
  const toggle = useCallback(() => setOpen((current) => !current), []);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = ({ target }) => {
      if (!containerRef.current?.contains(target)) close();
    };
    const onKeyDown = ({ key }) => {
      if (key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  return { open, show, toggle, close, containerRef };
};
