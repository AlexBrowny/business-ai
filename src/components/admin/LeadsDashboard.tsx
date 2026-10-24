"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadStatus } from "@/lib/db";

type Stats = Record<LeadStatus | "total", number>;

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Новая",
  in_work: "В работе",
  won: "Успех",
  lost: "Отказ",
};
const STATUS_COLOR: Record<LeadStatus, string> = {
  new: "bg-brand/30 text-brand-2",
  in_work: "bg-amber-400/20 text-amber-300",
  won: "bg-emerald-400/20 text-emerald-300",
  lost: "bg-red-400/20 text-red-300",
};
const SOURCE_LABEL = { form: "Форма", quiz: "Квиз", chat: "ИИ-чат" } as const;
const TG_LABEL = { sent: "✓ отправлено", failed: "✗ ошибка", skipped: "— не настроен" } as const;

const select = "rounded-xl border border-line bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-brand";

export function LeadsDashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams({ status, source, q });
    try {
      const res = await fetch(`/api/admin/leads?${params}`);
      if (res.status === 401) return router.replace("/admin/login");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setLeads(json.leads);
      setStats(json.stats);
      setError("");
    } catch {
      setError("Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }, [status, source, q, router]);

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  async function patch(id: number, body: object) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const { lead } = await res.json();
      setSelected(lead);
      void load();
    }
  }

  async function remove(id: number) {
    if (!confirm("Удалить заявку безвозвратно?")) return;
    const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSelected(null);
      void load();
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Заявки</h1>
        <div className="flex gap-2">
          <a href="/api/admin/export" className="glass rounded-xl px-4 py-2 text-sm hover:bg-foreground/10">
            Экспорт CSV
          </a>
          <button onClick={logout} className="glass rounded-xl px-4 py-2 text-sm hover:bg-foreground/10">
            Выйти
          </button>
        </div>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            [["total", "Всего"], ["new", "Новые"], ["in_work", "В работе"], ["won", "Успех"], ["lost", "Отказ"]] as const
          ).map(([k, label]) => (
            <div key={k} className="glass rounded-2xl p-4">
              <p className="text-xs text-muted">{label}</p>
              <p className="font-display text-2xl font-bold">{stats[k]}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по имени, контакту…" aria-label="Поиск" className={`${select} min-w-60 flex-1`} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Статус" className={select}>
          <option value="">Все статусы</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} aria-label="Источник" className={select}>
          <option value="">Все источники</option>
          {Object.entries(SOURCE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {error && <p role="alert" className="mb-4 text-red-400">{error}</p>}

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-line text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Клиент</th>
              <th className="px-4 py-3">Контакт</th>
              <th className="px-4 py-3">Источник</th>
              <th className="px-4 py-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} onClick={() => setSelected(l)} className="cursor-pointer border-b border-line/50 transition hover:bg-foreground/5">
                <td className="px-4 py-3 text-muted">{l.id}</td>
                <td className="px-4 py-3 whitespace-nowrap">{l.created_at}</td>
                <td className="px-4 py-3 font-medium">{l.name}</td>
                <td className="px-4 py-3">{l.contact}</td>
                <td className="px-4 py-3">{SOURCE_LABEL[l.source]}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_COLOR[l.status]}`}>{STATUS_LABEL[l.status]}</span>
                </td>
              </tr>
            ))}
            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">Заявок пока нет</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setSelected(null)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-md space-y-5 overflow-y-auto border-l border-line bg-surface p-6"
            aria-label={`Заявка ${selected.id}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold">{selected.name}</h2>
                <p className="text-sm text-muted">#{selected.id} · {selected.created_at} · {SOURCE_LABEL[selected.source]}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Закрыть" className="text-2xl text-muted hover:text-foreground">×</button>
            </div>

            <p className="text-lg">📞 {selected.contact}</p>
            {selected.message && <p className="rounded-xl bg-foreground/5 p-3 text-sm whitespace-pre-wrap">{selected.message}</p>}

            {Object.keys(selected.answers).length > 0 && (
              <ul className="space-y-1 text-sm">
                {Object.entries(selected.answers).map(([k, v]) => (
                  <li key={k}><span className="text-muted">{k}</span> — {v}</li>
                ))}
              </ul>
            )}

            {selected.chat_summary && (
              <div>
                <p className="mb-1 text-xs text-muted uppercase">Диалог с ИИ</p>
                <p className="rounded-xl bg-foreground/5 p-3 text-sm whitespace-pre-wrap">{selected.chat_summary}</p>
              </div>
            )}

            <label className="block text-sm">
              <span className="mb-1 block text-muted">Статус</span>
              <select value={selected.status} onChange={(e) => patch(selected.id, { status: e.target.value })} className={`${select} w-full`}>
                {Object.entries(STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-muted">Заметка</span>
              <textarea
                key={selected.id}
                defaultValue={selected.note}
                rows={3}
                maxLength={2000}
                onBlur={(e) => e.target.value !== selected.note && patch(selected.id, { note: e.target.value })}
                className={`${select} w-full`}
              />
            </label>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Telegram: {TG_LABEL[selected.tg_status]}</span>
              {selected.tg_status !== "sent" && (
                <button onClick={() => patch(selected.id, { resendTelegram: true })} className="text-brand-2 underline">
                  Отправить повторно
                </button>
              )}
            </div>

            <button onClick={() => remove(selected.id)} className="text-sm text-red-400 hover:underline">
              Удалить заявку
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
