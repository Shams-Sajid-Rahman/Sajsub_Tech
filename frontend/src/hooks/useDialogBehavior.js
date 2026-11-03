import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Open dialogs, newest last. Only the newest responds to the keyboard.
const openDialogs = [];

const lockPageScroll = () => {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`;
};

const unlockPageScroll = () => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
};

// What every modal and drawer shares: takes focus and keeps it inside, closes on Escape,
// stops the page behind from scrolling, and returns focus when closed.
export const useDialogBehavior = (onEscape) => {
  const dialogRef = useRef(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement;
    if (!dialog.contains(previous)) dialog.focus();
    if (openDialogs.length === 0) lockPageScroll();
    openDialogs.push(dialog);

    const onKeyDown = (event) => {
      if (openDialogs.at(-1) !== dialog) return;
      if (event.key === 'Escape') {
        onEscapeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = dialog.querySelectorAll(FOCUSABLE);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      openDialogs.splice(openDialogs.indexOf(dialog), 1);
      if (openDialogs.length === 0) unlockPageScroll();
      previous?.focus?.();
    };
  }, []);

  return dialogRef;
};
