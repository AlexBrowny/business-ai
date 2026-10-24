"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";
const EVENT = "themechange";

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};
const getTheme = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark" as Theme);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // приватный режим: тема просто не запомнится
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
      className="glass grid h-10 w-10 place-items-center rounded-full text-lg transition hover:bg-foreground/10"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
