"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { demoScript } from "@/content/site";
import { Reveal } from "@/components/fx/Reveal";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { openQuiz } from "@/components/chat/events";

const TYPE_MS = 22;
const PAUSE_MS = 900;
const RESTART_MS = 4000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Анимированная демонстрация диалога: ответы «печатаются» по очереди и повторяются. */
export function AssistantDemo() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: "-80px" });
  const [shown, setShown] = useState<string[]>([]);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    async function play() {
      if (reduced) {
        setShown(demoScript.map((m) => m.text));
        return;
      }
      while (!cancelled) {
        setShown([]);
        for (let i = 0; i < demoScript.length; i++) {
          const { text, role } = demoScript[i];
          // Ответы бота печатаются побуквенно, вопросы клиента появляются сразу
          if (role === "bot") {
            for (let c = 1; c <= text.length && !cancelled; c++) {
              setShown((prev) => [...prev.slice(0, i), text.slice(0, c)]);
              await sleep(TYPE_MS);
            }
          } else {
            setShown((prev) => [...prev.slice(0, i), text]);
          }
          await sleep(PAUSE_MS);
          if (cancelled) return;
        }
        await sleep(RESTART_MS);
      }
    }
    void play();
    return () => {
      cancelled = true;
    };
  }, [inView]);

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
      <Reveal>
        <p className="text-sm font-medium tracking-widest text-brand-2 uppercase">Демо</p>
        <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
          Так ассистент <span className="text-gradient">ведёт клиента к заявке</span>
        </h2>
        <p className="mt-5 max-w-lg text-muted">
          Отвечает по делу, задаёт уточняющие вопросы и мягко приводит к квизу — без давления и выдуманных обещаний.
        </p>
        <div className="mt-8">
          <MagneticButton onClick={openQuiz}>Пройти квиз →</MagneticButton>
        </div>
      </Reveal>

      <div ref={box} className="glass mx-auto w-full max-w-md rounded-3xl p-5" role="img" aria-label="Пример диалога с ИИ-консультантом">
        <div className="mb-4 flex items-center gap-3 border-b border-line pb-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2">🤖</span>
          <span className="text-sm font-semibold">ИИ-консультант</span>
        </div>
        <div className="min-h-[21rem] space-y-3">
          {shown.map((text, i) => {
            const isUser = demoScript[i].role === "user";
            return (
              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser ? "bg-brand text-white" : "bg-foreground/8"
                  }`}
                >
                  {text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
