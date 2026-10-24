"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { stats } from "@/content/site";
import { Reveal } from "@/components/fx/Reveal";

interface CounterProps {
  value: number;
  prefix: string;
  suffix: string;
}

function Counter({ value, prefix, suffix }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controls = animate(0, value, {
      duration: reduced ? 0 : 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = `${prefix}${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, prefix, suffix]);

  // Итоговое значение лежит в разметке: видно без JS и скринридерам
  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="bg-surface/80 p-7 text-center sm:p-9">
            <p className="font-display text-gradient text-3xl font-bold whitespace-nowrap sm:text-4xl lg:text-5xl">
              <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
