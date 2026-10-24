"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const NeuralCore = dynamic(() => import("./NeuralCore"), { ssr: false });

type Mode = "pending" | "3d" | "static";

/** Слабое устройство, узкий экран или просьба системы уменьшить анимации */
function shouldUseStatic(): boolean {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 2;
  return reduced || narrow || lowEnd;
}

/** Лёгкая замена 3D: CSS-шар с градиентом и орбитами. */
function StaticOrb() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative h-56 w-56 sm:h-72 sm:w-72">
        <div className="absolute inset-0 animate-[spin_24s_linear_infinite] rounded-full border border-brand-2/30" />
        <div className="absolute -inset-6 animate-[spin_40s_linear_infinite_reverse] rounded-full border border-brand-3/25" />
        <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_30%_30%,#c9bbff,#7c5cff_45%,#2a1590_80%)] shadow-[0_0_80px_rgba(124,92,255,0.55)]" />
      </div>
    </div>
  );
}

/**
 * Выбирает 3D или статичную версию, грузит сцену после первой отрисовки
 * и ставит её на паузу, когда она ушла за экран.
 */
export function HeroScene() {
  const [mode, setMode] = useState<Mode>("pending");
  const [visible, setVisible] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Не мешаем первой отрисовке текста оффера
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setMode(shouldUseStatic() ? "static" : "3d"));
    return () => cancel(id);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className="absolute inset-0">
      {mode === "3d" && <NeuralCore active={visible} />}
      {mode !== "3d" && <StaticOrb />}
    </div>
  );
}
