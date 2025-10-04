import { Variants } from "framer-motion"

// Advanced entrance animations
export const advancedFadeInUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 60, 
    scale: 0.95,
    rotateX: -15,
    transformPerspective: 1000
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom easing
      staggerChildren: 0.1
    }
  }
}

export const advancedSlideIn: Variants = {
  initial: { 
    opacity: 0, 
    x: -100,
    scale: 0.9,
    filter: "blur(10px)"
  },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1,
      ease: [0.23, 1, 0.32, 1], // Ease out expo
      delay: 0.2
    }
  }
}

export const advancedStagger: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
      duration: 0.6
    }
  }
}

// Hover animations
export const hoverLift: Variants = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.05, 
    y: -8,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

export const hoverGlow: Variants = {
  initial: { 
    boxShadow: "0 0 0px rgba(120, 119, 198, 0)",
    scale: 1
  },
  hover: { 
    boxShadow: "0 0 30px rgba(120, 119, 198, 0.6)",
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

export const hoverRotate: Variants = {
  initial: { rotate: 0, scale: 1 },
  hover: { 
    rotate: 360,
    scale: 1.1,
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
}

// Floating animations
export const floating: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-10, 10, -10],
    rotate: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const pulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Page transitions
export const pageTransition: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    filter: "blur(10px)"
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 1.05,
    y: -20,
    filter: "blur(10px)",
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Text animations
export const textReveal: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    rotateX: -90
  },
  animate: { 
    opacity: 1, 
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const typewriter: Variants = {
  initial: { width: 0 },
  animate: { 
    width: "100%",
    transition: {
      duration: 2,
      ease: "easeInOut",
      delay: 0.5
    }
  }
}

// Card animations
export const cardHover: Variants = {
  initial: { 
    scale: 1, 
    rotateY: 0,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
  },
  hover: { 
    scale: 1.03, 
    rotateY: 5,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const cardFlip: Variants = {
  initial: { rotateY: 0 },
  hover: { 
    rotateY: 180,
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
}

// Loading animations
export const loadingSpinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

export const loadingDots: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: [0, 1, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Morphing animations
export const morph: Variants = {
  initial: { 
    borderRadius: "8px",
    scale: 1
  },
  animate: {
    borderRadius: ["8px", "50%", "8px"],
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Gradient animations
export const gradientShift: Variants = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// Particle animations
export const particleFloat: Variants = {
  animate: {
    y: [0, -100, 0],
    x: [0, 50, 0],
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Advanced stagger for complex layouts
export const complexStagger: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      duration: 0.8
    }
  }
}

// Reveal animations
export const revealUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 50,
    clipPath: "inset(100% 0 0 0)"
  },
  animate: { 
    opacity: 1, 
    y: 0,
    clipPath: "inset(0% 0 0 0)",
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const revealLeft: Variants = {
  initial: { 
    opacity: 0, 
    x: -50,
    clipPath: "inset(0 100% 0 0)"
  },
  animate: { 
    opacity: 1, 
    x: 0,
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Advanced hover effects
export const hoverTilt: Variants = {
  initial: { 
    rotateX: 0, 
    rotateY: 0,
    scale: 1
  },
  hover: { 
    rotateX: 10, 
    rotateY: 10,
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

export const hoverScale: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.2,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Magnetic hover effect
export const magnetic: Variants = {
  initial: { x: 0, y: 0 },
  hover: { 
    x: [0, 10, -5, 0],
    y: [0, -5, 5, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
}

// Glitch effect
export const glitch: Variants = {
  initial: { x: 0 },
  animate: {
    x: [0, -2, 2, -2, 2, 0],
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
}

// Breathing animation
export const breathe: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Wave animation
export const wave: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Shake animation
export const shake: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
}

// Elastic animation
export const elastic: Variants = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.68, -0.55, 0.265, 1.55] // Elastic easing
    }
  }
}
