"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { process as steps } from "@/content/site";

export function Process() {
  const root = useRef<HTMLElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (line.current) line.current.style.transform = "scaleY(1)";
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ".steps", start: "top 70%", end: "bottom 60%", scrub: true },
        },
      );
      gsap.utils.toArray<HTMLElement>(".step").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          x: 60,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="mx-auto max-w-4xl overflow-x-clip px-6 py-28">
      <p className="text-sm font-medium tracking-widest text-brand-2 uppercase">Как мы работаем</p>
      <h2 className="font-display mt-3 mb-14 text-3xl font-bold sm:text-4xl">
        От идеи до заявок — <span className="text-gradient">4 шага</span>
      </h2>
      <div className="steps relative pl-12">
        <div className="absolute top-0 bottom-0 left-4 w-px bg-line" />
        <div
          ref={line}
          className="absolute top-0 bottom-0 left-4 w-px origin-top bg-gradient-to-b from-brand-2 via-brand to-brand-3"
        />
        {steps.map((s, i) => (
          <div key={s.title} className="step relative pb-12 last:pb-0">
            <span className="font-display absolute top-0 -left-12 grid h-9 w-9 place-items-center rounded-full border border-brand bg-background text-sm font-bold text-brand-2">
              {i + 1}
            </span>
            <h3 className="font-display text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-muted">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
