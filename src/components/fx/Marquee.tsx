import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  duration?: number;
  className?: string;
}

/** Бесконечная лента: контент дублируется, чтобы сдвиг на 50% был бесшовным. */
export function Marquee({ children, duration = 35, className = "" }: MarqueeProps) {
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div
        className="marquee-track flex w-max gap-4"
        style={{ "--dur": `${duration}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 gap-4">{children}</div>
        <div className="flex shrink-0 gap-4" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
