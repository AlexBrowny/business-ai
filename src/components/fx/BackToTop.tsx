"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 600;

export const scrollToTop = () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
};

/** Плавающая кнопка «наверх»: появляется после прокрутки первого экрана. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={scrollToTop}
      aria-label="Наверх, на главный экран"
      tabIndex={visible ? 0 : -1}
      className={`glass fixed bottom-20 left-4 z-50 grid h-12 w-12 place-items-center rounded-full text-lg transition-all duration-300 hover:bg-foreground/10 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      ↑
    </button>
  );
}
