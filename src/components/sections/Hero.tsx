"use client";

import { motion } from "framer-motion";
import { brand, hero } from "@/content/site";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { Marquee } from "@/components/fx/Marquee";
import { Parallax } from "@/components/fx/Parallax";
import { openChat } from "@/components/chat/events";
import { HeroScene } from "@/components/three/HeroScene";
import { ThemeToggle } from "@/components/fx/ThemeToggle";

const word = {
  hidden: { opacity: 0, y: 50, rotateX: -40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { delay: 0.15 + i * 0.07, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  const words = hero.title.split(" ");

  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden">
      <Parallax distance={-200} className="absolute -top-20 -left-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-brand/30 blur-[120px]" />
      <Parallax distance={160} className="absolute top-1/3 -right-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-brand-3/20 blur-[120px]" />
      <Parallax distance={-100} className="absolute bottom-0 left-1/3 -z-10 h-80 w-80 rounded-full bg-brand-2/20 blur-[110px]" />

      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-bold tracking-tight">
          {brand.name}
          <span className="text-brand-2">.</span>
        </span>
        <nav className="hidden gap-8 text-sm text-muted md:flex" aria-label="Навигация">
          <a href="#benefits" className="transition hover:text-foreground">Преимущества</a>
          <a href="#reviews" className="transition hover:text-foreground">Отзывы</a>
          <a href="#faq" className="transition hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a href="#lead" className="glass rounded-full px-5 py-2 text-sm font-medium transition hover:bg-foreground/10">
            Оставить заявку
          </a>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-6 pt-28 pb-32 lg:grid-cols-2">
        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-brand-2"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-2" />
            {hero.badge}
          </motion.span>

          <h1 className="font-display mt-6 text-4xl leading-[1.08] font-bold tracking-tight [perspective:800px] sm:text-5xl lg:text-6xl">
            {words.map((w, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={word}
                initial="hidden"
                animate="show"
                className={`mr-[0.25em] inline-block ${i >= words.length - 3 ? "text-gradient" : ""}`}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-6 max-w-xl text-lg text-muted"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <MagneticButton onClick={() => document.getElementById("lead")?.scrollIntoView({ behavior: "smooth" })}>
              {hero.cta} →
            </MagneticButton>
            <MagneticButton variant="ghost" onClick={openChat}>
              {hero.ctaSecondary}
            </MagneticButton>
          </motion.div>
        </div>

        <div className="relative h-[380px] sm:h-[480px] lg:h-[640px]" aria-hidden>
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-brand/20 to-brand-2/10 blur-3xl" />
          <HeroScene />
        </div>
      </div>

      <Marquee className="absolute inset-x-0 bottom-0 border-y border-line bg-background/60 py-4 backdrop-blur" duration={40}>
        {hero.metrics.map((m) => (
          <span key={m} className="font-display flex items-center gap-4 pr-4 text-sm font-medium text-muted">
            <span className="text-brand-2">✦</span>
            {m}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
