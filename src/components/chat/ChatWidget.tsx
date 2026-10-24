"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quiz } from "./Quiz";
import { OPEN_CHAT_EVENT, OPEN_QUIZ_EVENT } from "./events";

interface Message {
  role: "user" | "model";
  text: string;
}

const GREETING: Message = {
  role: "model",
  text: "Привет! Я ИИ-консультант NeuroFlow. Расскажу, как ассистент поможет вашему бизнесу, отвечу на вопросы о сроках и стоимости. С чего начнём?",
};
const SUGGESTIONS = ["Сколько стоит?", "Как быстро запуститесь?", "Что умеет ассистент?"];
const QUIZ_AFTER_USER_MESSAGES = 2;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "quiz">("chat");
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onChat = () => {
      setOpen(true);
      setMode("chat");
    };
    const onQuiz = () => {
      setOpen(true);
      setMode("quiz");
    };
    window.addEventListener(OPEN_CHAT_EVENT, onChat);
    window.addEventListener(OPEN_QUIZ_EVENT, onQuiz);
    return () => {
      window.removeEventListener(OPEN_CHAT_EVENT, onChat);
      window.removeEventListener(OPEN_QUIZ_EVENT, onQuiz);
    };
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, mode, open]);

  const userCount = messages.filter((m) => m.role === "user").length;

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    const history = [...messages, { role: "user" as const, text: clean }];
    setMessages([...history, { role: "model", text: "" }]);
    setInput("");
    setBusy(true);

    // Gemini требует, чтобы история начиналась с реплики пользователя
    const payload = history.slice(history.findIndex((m) => m.role === "user")).slice(-20);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (!res.body) throw new Error("empty");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "model", text: acc }]);
      }
      if (!acc) throw new Error("empty");
    } catch {
      setMessages([
        ...history,
        { role: "model", text: "Не удалось получить ответ. Попробуйте ещё раз или пройдите квиз." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const summary = messages
    .filter((m) => m.text)
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Клиент" : "ИИ"}: ${m.text}`)
    .join("\n");

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="ИИ-консультант"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed right-4 bottom-24 z-50 flex h-[min(600px,calc(100dvh-8rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-line bg-surface/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-brand/30 to-brand-2/20 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2">🤖</span>
                <div>
                  <p className="text-sm font-semibold">ИИ-консультант</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> онлайн
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Закрыть чат" className="text-2xl text-muted transition hover:text-foreground">
                ×
              </button>
            </div>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" data-lenis-prevent>
              {mode === "chat" ? (
                <>
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                          m.role === "user" ? "bg-brand text-white" : "bg-foreground/8 text-foreground"
                        }`}
                      >
                        {m.text || <span className="animate-pulse text-muted">печатает…</span>}
                      </div>
                    </div>
                  ))}
                  {userCount === 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {SUGGESTIONS.map((s) => (
                        <button key={s} onClick={() => void send(s)} className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition hover:border-brand hover:text-foreground">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {userCount >= QUIZ_AFTER_USER_MESSAGES && !busy && (
                    <button
                      onClick={() => setMode("quiz")}
                      className="pulse-ring w-full rounded-2xl bg-gradient-to-r from-brand to-brand-3 py-3 text-sm font-semibold"
                    >
                      Пройти квиз и получить расчёт →
                    </button>
                  )}
                </>
              ) : (
                <Quiz summary={summary} onBack={() => setMode("chat")} onClose={() => setOpen(false)} />
              )}
            </div>

            {mode === "chat" && (
              <form onSubmit={onSubmit} className="flex gap-2 border-t border-line p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={800}
                  placeholder="Задайте вопрос…"
                  aria-label="Сообщение"
                  className="min-w-0 flex-1 rounded-full border border-line bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-brand"
                />
                <button type="submit" disabled={busy || !input.trim()} className="rounded-full bg-brand px-4 text-sm font-semibold transition disabled:opacity-40" aria-label="Отправить">
                  ➤
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Закрыть ИИ-консультанта" : "Открыть ИИ-консультанта"}
        className="pulse-ring fixed right-4 bottom-4 z-50 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-3 text-2xl shadow-xl transition hover:scale-105"
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}
