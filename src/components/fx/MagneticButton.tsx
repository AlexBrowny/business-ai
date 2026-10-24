"use client";

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost";
}

/** Кнопка, которая слегка «тянется» к курсору. */
export function MagneticButton({ children, variant = "primary", className = "", ...rest }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const move = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-brand via-brand to-brand-3 text-white shadow-[0_10px_40px_-10px_rgba(124,92,255,0.8)]"
      : "glass text-foreground hover:bg-foreground/10";

  return (
    <button
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      className={`rounded-full px-7 py-3.5 text-sm font-semibold transition-[transform,background] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-2 ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
