"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Тонкая полоса прогресса прокрутки вверху страницы. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.2 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-brand-2 via-brand to-brand-3"
    />
  );
}
