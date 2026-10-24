"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
      return;
    }
    const json = await res.json().catch(() => ({}));
    setError(json.error ?? "Ошибка входа");
    setBusy(false);
  }

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <form onSubmit={onSubmit} className="glass w-full max-w-sm space-y-4 rounded-3xl p-8">
        <h1 className="font-display text-2xl font-bold">Вход в админку</h1>
        <input
          name="password"
          type="password"
          required
          autoFocus
          placeholder="Пароль"
          aria-label="Пароль"
          className="w-full rounded-xl border border-line bg-foreground/5 px-4 py-3 outline-none focus:border-brand"
        />
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-3 py-3 font-semibold disabled:opacity-60">
          {busy ? "Входим…" : "Войти"}
        </button>
      </form>
    </main>
  );
}
