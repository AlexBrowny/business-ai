import { listLeads } from "@/lib/db";

export const runtime = "nodejs";

// Префикс ' защищает от формул в Excel/Sheets (CSV injection)
const cell = (v: string | number) => {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET() {
  const header = ["id", "created_at", "name", "contact", "message", "source", "status", "note", "answers"];
  const rows = (await listLeads()).map((l) =>
    [l.id, l.created_at, l.name, l.contact, l.message, l.source, l.status, l.note, JSON.stringify(l.answers)]
      .map(cell)
      .join(","),
  );
  const csv = "﻿" + [header.join(","), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads.csv"',
    },
  });
}
