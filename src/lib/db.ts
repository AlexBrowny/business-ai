import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

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

interface LeadRow extends Omit<Lead, "answers"> {
  answers: string;
}

const globalForDb = globalThis as unknown as { __db?: Database.Database };

function open(): Database.Database {
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(process.env.LEADS_DB_PATH ?? path.join(dir, "leads.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
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
  `);
  return db;
}

export function getDb(): Database.Database {
  return (globalForDb.__db ??= open());
}

const parse = (row: LeadRow): Lead => ({ ...row, answers: JSON.parse(row.answers) });

export interface NewLead {
  name: string;
  contact: string;
  message: string;
  source: LeadSource;
  answers: Record<string, string>;
  chatSummary: string;
}

export function insertLead(input: NewLead): Lead {
  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO leads (name, contact, message, source, answers, chat_summary)
       VALUES (@name, @contact, @message, @source, @answers, @chatSummary)`,
    )
    .run({ ...input, answers: JSON.stringify(input.answers) });
  return getLead(Number(info.lastInsertRowid))!;
}

export function getLead(id: number): Lead | undefined {
  const row = getDb().prepare("SELECT * FROM leads WHERE id = ?").get(id) as LeadRow | undefined;
  return row && parse(row);
}

export interface LeadFilter {
  status?: LeadStatus;
  source?: LeadSource;
  q?: string;
}

export function listLeads(filter: LeadFilter = {}): Lead[] {
  const where: string[] = [];
  const params: Record<string, string> = {};
  if (filter.status) {
    where.push("status = @status");
    params.status = filter.status;
  }
  if (filter.source) {
    where.push("source = @source");
    params.source = filter.source;
  }
  if (filter.q) {
    where.push("(name LIKE @q OR contact LIKE @q OR message LIKE @q)");
    params.q = `%${filter.q}%`;
  }
  const sql = `SELECT * FROM leads ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC LIMIT 1000`;
  return (getDb().prepare(sql).all(params) as LeadRow[]).map(parse);
}

export function updateLead(
  id: number,
  patch: Partial<Pick<Lead, "status" | "note" | "tg_status">>,
): Lead | undefined {
  const fields = Object.keys(patch) as (keyof typeof patch)[];
  if (fields.length === 0) return getLead(id);
  const set = fields.map((f) => `${f} = @${f}`).join(", ");
  getDb().prepare(`UPDATE leads SET ${set} WHERE id = @id`).run({ ...patch, id });
  return getLead(id);
}

export function deleteLead(id: number): boolean {
  return getDb().prepare("DELETE FROM leads WHERE id = ?").run(id).changes > 0;
}

export function leadStats(): Record<LeadStatus | "total", number> {
  const rows = getDb()
    .prepare("SELECT status, COUNT(*) AS n FROM leads GROUP BY status")
    .all() as { status: LeadStatus; n: number }[];
  const stats = { total: 0, new: 0, in_work: 0, won: 0, lost: 0 };
  for (const r of rows) {
    stats[r.status] = r.n;
    stats.total += r.n;
  }
  return stats;
}
