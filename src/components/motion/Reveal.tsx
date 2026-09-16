"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT } from "./variants";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds of delay before the reveal starts. */
  delay?: number;
  /** Initial vertical offset in px (0 = pure fade). */
  y?: number;
  duration?: number;
  /** Animate every time it enters the viewport (default: once). */
  once?: boolean;
  /** Fraction of the element that must be visible to trigger. */
  amount?: number;
}

/**
 * Scroll-triggered entrance. Composes inside Server Components.
 * Under prefers-reduced-motion it renders content immediately, no transform.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.6,
  once = true,
  amount = 0.2,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
