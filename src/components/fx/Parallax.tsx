"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ParallaxProps {
  children?: ReactNode;
  /** Смещение в px на всём проходе секции: + вниз, − вверх */
  distance?: number;
  className?: string;
}

/** Параллакс-слой: двигается по Y при скролле. */
export function Parallax({ children, distance = -120, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(
      el,
      { y: -distance / 2 },
      {
        y: distance / 2,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
