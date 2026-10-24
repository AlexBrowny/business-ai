"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { faq } from "@/content/site";
import { Reveal } from "@/components/fx/Reveal";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-28">
      <Reveal className="mb-12">
        <p className="text-sm font-medium tracking-widest text-brand-2 uppercase">FAQ</p>
        <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
          Частые <span className="text-gradient">вопросы</span>
        </h2>
      </Reveal>
      <div className="space-y-3">
        {faq.map((item, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={item.q} delay={i * 0.04}>
              <div className="glass overflow-hidden rounded-2xl">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-2"
                  >
                    {item.q}
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="text-2xl text-brand-2">
                      +
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${i}`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="px-6 pb-5 text-muted">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
