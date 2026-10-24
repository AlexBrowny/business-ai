"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/fx/Reveal";
import { Parallax } from "@/components/fx/Parallax";
import { openChat } from "@/components/chat/events";
import { scrollToTop } from "@/components/fx/BackToTop";

type Status = "idle" | "sending" | "done" | "error";

const field =
  "w-full rounded-2xl border border-line bg-foreground/5 px-5 py-3.5 text-foreground placeholder:text-muted/70 outline-none transition focus:border-brand focus:bg-foreground/10";

export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          contact: data.get("contact"),
          message: data.get("message"),
          source: "form",
          consent: data.get("consent") === "on",
          website: data.get("website") ?? "",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Не удалось отправить заявку");
      form.reset();
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
      setStatus("error");
    }
  }

  return (
    <section id="lead" className="relative isolate overflow-hidden px-6 py-28">
      <Parallax distance={-140} className="absolute top-10 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]" />
      <div className="mx-auto max-w-2xl">
        <Reveal className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Получите <span className="text-gradient">бесплатный расчёт</span>
          </h2>
          <p className="mt-4 text-muted">Оставьте контакты — свяжемся в течение часа в рабочее время.</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass rounded-3xl p-6 sm:p-9">
            {status === "done" ? (
              <div role="status" className="py-10 text-center">
                <div className="text-5xl">🎉</div>
                <h3 className="font-display mt-4 text-2xl font-semibold">Заявка отправлена!</h3>
                <p className="mt-2 text-muted">Мы свяжемся с вами в ближайшее время.</p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <button
                    onClick={scrollToTop}
                    className="rounded-full bg-gradient-to-r from-brand to-brand-3 px-7 py-3 text-sm font-semibold text-white"
                  >
                    На главную
                  </button>
                  <button onClick={() => setStatus("idle")} className="text-sm text-brand-2 underline">
                    Отправить ещё одну
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <label className="block">
                  <span className="sr-only">Имя</span>
                  <input name="name" required minLength={2} maxLength={80} placeholder="Ваше имя" autoComplete="name" className={field} />
                </label>
                <label className="block">
                  <span className="sr-only">Телефон или Telegram</span>
                  <input name="contact" required minLength={5} maxLength={100} placeholder="Телефон или @telegram" autoComplete="tel" className={field} />
                </label>
                <label className="block">
                  <span className="sr-only">Задача</span>
                  <textarea name="message" rows={3} maxLength={1000} placeholder="Что хотите автоматизировать? (необязательно)" className={field} />
                </label>
                {/* honeypot: скрыто от людей */}
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <label className="flex items-start gap-3 text-sm text-muted">
                  <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[var(--brand)]" />
                  Согласен на обработку персональных данных
                </label>
                {status === "error" && (
                  <p role="alert" className="text-sm text-red-400">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-2xl bg-gradient-to-r from-brand to-brand-3 py-4 font-semibold text-white shadow-[0_10px_40px_-10px_rgba(124,92,255,0.8)] transition hover:brightness-110 disabled:opacity-60"
                >
                  {status === "sending" ? "Отправляем…" : "Отправить заявку"}
                </button>
                <button type="button" onClick={openChat} className="w-full text-center text-sm text-muted transition hover:text-foreground">
                  Остались вопросы? Спросите ИИ-консультанта →
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
