import { createClient, type Client, type InValue, type Row } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export type LeadStatus = "new" | "in_work" | "won" | "lost";
export type LeadSource = "form" | "quiz" | "chat";
export type TgStatus = "sent" | "failed" | "skipped";

export interface Lead {
  id: number;
  created_at: string;
  name: string;
  contact: string;
  message: string;
  source: LeadSource;
  answers: Record<string, string>;
  chat_summary: string;
  status: LeadStatus;
  note: string;
  tg_status: TgStatus;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT 'form',
    answers TEXT NOT NULL DEFAULT '{}',
    chat_summary TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    note TEXT NOT NULL DEFAULT '',
    tg_status TEXT NOT NULL DEFAULT 'skipped'
  );
  CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
`;

const globalForDb = globalThis as unknown as { __db?: Promise<Client> };

/**
 * Turso (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN) в проде,
 * локальный файл data/leads.db, если переменные не заданы.
 */
async function open(): Promise<Client> {
  const remoteUrl = process.env.TURSO_DATABASE_URL;
  let client: Client;
  if (remoteUrl) {
    client = createClient({ url: remoteUrl, authToken: process.env.TURSO_AUTH_TOKEN });
  } else {
    // libSQL сам не создаёт каталог для файла базы
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    client = createClient({ url: process.env.LEADS_DB_URL ?? pathToFileURL(path.join(dir, "leads.db")).href });
  }
  await client.executeMultiple(SCHEMA);
  return client;
}

export function getDb(): Promise<Client> {
  if (!globalForDb.__db) {
    // При сбое подключения не кэшируем ошибку: следующий запрос попробует снова
    globalForDb.__db = open().catch((err) => {
      globalForDb.__db = undefined;
      throw err;
    });
  }
  return globalForDb.__db;
}

const parse = (row: Row): Lead => ({
  id: Number(row.id),
  created_at: String(row.created_at),
  name: String(row.name),
  contact: String(row.contact),
  message: String(row.message),
  source: row.source as LeadSource,
  answers: JSON.parse(String(row.answers)),
  chat_summary: String(row.chat_summary),
  status: row.status as LeadStatus,
  note: String(row.note),
  tg_status: row.tg_status as TgStatus,
});

export interface NewLead {
  name: string;
  contact: string;
  message: string;
  source: LeadSource;
  answers: Record<string, string>;
  chatSummary: string;
}

export async function insertLead(input: NewLead): Promise<Lead> {
  const db = await getDb();
  const res = await db.execute({
    sql: `INSERT INTO leads (name, contact, message, source, answers, chat_summary)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [input.name, input.contact, input.message, input.source, JSON.stringify(input.answers), input.chatSummary],
  });
  return (await getLead(Number(res.lastInsertRowid)))!;
}

export async function getLead(id: number): Promise<Lead | undefined> {
  const db = await getDb();
  const res = await db.execute({ sql: "SELECT * FROM leads WHERE id = ?", args: [id] });
  return res.rows[0] ? parse(res.rows[0]) : undefined;
}

export interface LeadFilter {
  status?: LeadStatus;
  source?: LeadSource;
  q?: string;
}

export async function listLeads(filter: LeadFilter = {}): Promise<Lead[]> {
  const where: string[] = [];
  const args: InValue[] = [];
  if (filter.status) {
    where.push("status = ?");
    args.push(filter.status);
  }
  if (filter.source) {
    where.push("source = ?");
    args.push(filter.source);
  }
  if (filter.q) {
    where.push("(name LIKE ? OR contact LIKE ? OR message LIKE ?)");
    const like = `%${filter.q}%`;
    args.push(like, like, like);
  }
  const sql = `SELECT * FROM leads ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC LIMIT 1000`;
  const db = await getDb();
  return (await db.execute({ sql, args })).rows.map(parse);
}

const PATCHABLE = ["status", "note", "tg_status"] as const;

export async function updateLead(
  id: number,
  patch: Partial<Pick<Lead, (typeof PATCHABLE)[number]>>,
): Promise<Lead | undefined> {
  // Имена колонок берём только из белого списка, значения передаём параметрами
  const fields = PATCHABLE.filter((f) => patch[f] !== undefined);
  if (fields.length === 0) return getLead(id);
  const db = await getDb();
  await db.execute({
    sql: `UPDATE leads SET ${fields.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`,
    args: [...fields.map((f) => patch[f] as string), id],
  });
  return getLead(id);
}

export async function deleteLead(id: number): Promise<boolean> {
  const db = await getDb();
  return (await db.execute({ sql: "DELETE FROM leads WHERE id = ?", args: [id] })).rowsAffected > 0;
}

export async function leadStats(): Promise<Record<LeadStatus | "total", number>> {
  const db = await getDb();
  const res = await db.execute("SELECT status, COUNT(*) AS n FROM leads GROUP BY status");
  const stats = { total: 0, new: 0, in_work: 0, won: 0, lost: 0 };
  for (const r of res.rows) {
    const status = r.status as LeadStatus;
    stats[status] = Number(r.n);
    stats.total += Number(r.n);
  }
  return stats;
}
