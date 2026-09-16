"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { SPRING } from "./variants";

/** <button> with a hover-lift + tap-press spring. Reduced-motion safe. */
export function MotionButton({ children, ...props }: HTMLMotionProps<"button">) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={SPRING}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * Inline wrapper that adds the same hover-lift + tap-press spring to arbitrary
 * children (e.g. a Next <Link>). Renders an inline-flex span.
 */
export function Tap({
  children,
  className,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const reduce = useReducedMotion();
  const active = !reduce && !disabled;
  return (
    <motion.span
      className={className}
      style={{ display: "inline-flex" }}
      whileHover={active ? { y: -2 } : undefined}
      whileTap={active ? { scale: 0.97 } : undefined}
      transition={SPRING}
    >
      {children}
    </motion.span>
  );
}
