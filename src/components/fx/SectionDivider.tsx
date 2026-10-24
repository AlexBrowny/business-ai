"use client";

import { motion } from "framer-motion";

/** Светящаяся линия между секциями: «прорисовывается» при появлении. */
export function SectionDivider() {
  return (
    <div aria-hidden className="mx-auto flex max-w-7xl justify-center px-6">
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="h-px w-full bg-gradient-to-r from-transparent via-brand to-transparent shadow-[0_0_24px_2px_rgba(124,92,255,0.5)]"
      />
    </div>
  );
}
