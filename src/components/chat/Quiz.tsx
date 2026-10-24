"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { quizSteps } from "@/content/site";
import { scrollToTop } from "@/components/fx/BackToTop";

interface QuizProps {
  summary: string;
  onBack: () => void;
  onClose: () => void;
}

type Phase = "steps" | "contact" | "sending" | "done" | "error";

const input =
  "w-full rounded-xl border border-line bg-foreground/5 px-4 py-3 text-sm outline-none focus:border-brand";

export function Quiz({ summary, onBack, onClose }: QuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("steps");
  const [error, setError] = useState("");

  const pick = (question: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [question]: option }));
    if (step + 1 < quizSteps.length) setStep(step + 1);
    else setPhase("contact");
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPhase("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          contact: data.get("contact"),
          source: "quiz",
          answers,
          chatSummary: summary,
          consent: data.get("consent") === "on",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Не удалось отправить");
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
      setPhase("error");
    }
  }

  if (phase === "done") {
    return (
      <div role="status" className="py-10 text-center">
        <div className="text-5xl">✅</div>
        <p className="font-display mt-4 text-lg font-semibold">Заявка принята!</p>
        <p className="mt-2 text-sm text-muted">Менеджер свяжется с вами и пришлёт расчёт.</p>
        <button
          onClick={() => {
            onClose();
            scrollToTop();
          }}
          className="mt-5 rounded-full bg-gradient-to-r from-brand to-brand-3 px-6 py-2.5 text-sm font-semibold text-white"
        >
          На главную
        </button>
      </div>
    );
  }

  if (phase !== "steps") {
    return (
      <motion.form initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} onSubmit={submit} className="space-y-3">
        <p className="font-display text-base font-semibold">Куда отправить расчёт?</p>
        <input name="name" required minLength={2} maxLength={80} placeholder="Ваше имя" aria-label="Имя" className={input} />
        <input name="contact" required minLength={5} maxLength={100} placeholder="Телефон или @telegram" aria-label="Контакт" className={input} />
        <label className="flex items-start gap-2 text-xs text-muted">
          <input type="checkbox" name="consent" required className="mt-0.5 accent-[var(--brand)]" />
          Согласен на обработку персональных данных
        </label>
        {phase === "error" && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button disabled={phase === "sending"} className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-3 py-3 text-sm font-semibold disabled:opacity-60">
          {phase === "sending" ? "Отправляем…" : "Получить расчёт"}
        </button>
      </motion.form>
    );
  }

  const current = quizSteps[step];
  return (
    <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
      <div className="flex items-center gap-1.5" aria-label={`Шаг ${step + 1} из ${quizSteps.length}`}>
        {quizSteps.map((_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-foreground/10"}`} />
        ))}
      </div>
      <p className="font-display text-base font-semibold">{current.question}</p>
      <div className="grid gap-2">
        {current.options.map((o) => (
          <button
            key={o}
            onClick={() => pick(current.question, o)}
            className="rounded-xl border border-line bg-foreground/5 px-4 py-3 text-left text-sm transition hover:border-brand hover:bg-brand/20"
          >
            {o}
          </button>
        ))}
      </div>
      <button onClick={step === 0 ? onBack : () => setStep(step - 1)} className="text-xs text-muted hover:text-foreground">
        ← Назад
      </button>
    </motion.div>
  );
}
