export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4 },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
}

export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
}
