"use client";

import { useRef } from "react";
import { benefits } from "@/content/site";
import { Reveal } from "@/components/fx/Reveal";

const ICONS = ["⚡", "🎯", "🚀", "🧠", "🔌", "📊"];

function Card({ index }: { index: number }) {
  const b = benefits[index];
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`glass group relative h-full overflow-hidden rounded-3xl p-7 transition-transform duration-200 ease-out ${
        b.size === "lg" ? "lg:col-span-2" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(360px circle at var(--mx,50%) var(--my,50%), rgba(124,92,255,0.22), transparent 60%)",
        }}
      />
      <div className="relative">
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand/40 to-brand-2/30 text-2xl">
          {ICONS[index]}
        </div>
        <h3 className="font-display text-xl font-semibold">{b.title}</h3>
        <p className="mt-3 text-muted">{b.text}</p>
      </div>
    </div>
  );
}

export function Benefits() {
  return (
    <section id="benefits" className="mx-auto max-w-7xl px-6 py-28">
      <Reveal className="mb-14 max-w-2xl">
        <p className="text-sm font-medium tracking-widest text-brand-2 uppercase">Преимущества</p>
        <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
          Всё, чтобы <span className="text-gradient">не терять клиентов</span>
        </h2>
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b, i) => (
          <Reveal key={b.title} delay={(i % 3) * 0.08} className={b.size === "lg" ? "lg:col-span-2" : ""}>
            <Card index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
