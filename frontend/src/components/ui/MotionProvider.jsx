import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';

// Uses Motion's smaller feature set, and honours the visitor's reduced-motion setting everywhere.
// Loaded with the page on purpose: if this code arrived separately and failed, dialogs would stay invisible.
export default function MotionProvider({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
