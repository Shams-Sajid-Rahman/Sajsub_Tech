// Shared animation values, so every moving part of the site feels the same. Times are in seconds.
export const DURATION = { fast: 0.15, base: 0.25, slow: 0.4 };
export const EASE = [0.2, 0.8, 0.2, 1];

const transition = { duration: DURATION.base, ease: EASE };

export const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition },
  exit: { opacity: 0, y: 8, transition: { duration: DURATION.fast, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition },
  exit: { opacity: 0, scale: 0.9, transition: { duration: DURATION.fast, ease: EASE } },
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const pressable = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.97 },
  transition: { duration: DURATION.fast, ease: EASE },
};

export const dropdown = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.fast, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: DURATION.fast, ease: EASE } },
};
