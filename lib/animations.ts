export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 },
}

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4 },
}

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, type: "spring", stiffness: 200 },
}

export const slideInBottom = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, type: "spring", stiffness: 100 },
}

export const rotateIn = {
  initial: { opacity: 0, rotate: -10, scale: 0.9 },
  animate: { opacity: 1, rotate: 0, scale: 1 },
  transition: { duration: 0.6, type: "spring", stiffness: 150 },
}

export const perspective3D = {
  initial: { opacity: 0, rotateX: -15, z: -50 },
  animate: { opacity: 1, rotateX: 0, z: 0 },
  transition: { duration: 0.7, type: "spring" },
}

export const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(120, 119, 198, 0.3)",
      "0 0 40px rgba(120, 119, 198, 0.6)",
      "0 0 20px rgba(120, 119, 198, 0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export const shimmer = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  },
}

export const staggerFast = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

export const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
}

export const slideInRotate = {
  initial: { opacity: 0, x: -50, rotate: -5 },
  animate: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: {
      duration: 0.6,
      type: "spring",
      stiffness: 120,
    },
  },
}

export const expandWidth = {
  initial: { width: 0, opacity: 0 },
  animate: {
    width: "100%",
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
}

export const morphShape = {
  animate: {
    borderRadius: ["20%", "50%", "20%"],
    rotate: [0, 180, 360],
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}
