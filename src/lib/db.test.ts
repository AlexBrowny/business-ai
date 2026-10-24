import { beforeAll, describe, expect, it } from "vitest";

process.env.LEADS_DB_URL = "file::memory:";
delete process.env.TURSO_DATABASE_URL;

const base = {
  name: "Анна",
  contact: "@anna_test",
  message: "хочу бота",
  source: "quiz" as const,
  answers: { Сфера: "Услуги" },
  chatSummary: "",
};

describe("leads storage (libSQL)", () => {
  let db: typeof import("./db");

  beforeAll(async () => {
    db = await import("./db");
  });

  it("inserts and reads a lead back with parsed answers", async () => {
    const lead = await db.insertLead(base);
    const found = await db.getLead(lead.id);
    expect(found?.name).toBe("Анна");
    expect(found?.answers).toEqual({ Сфера: "Услуги" });
    expect(found?.status).toBe("new");
  });

  it("updates only whitelisted fields and filters by status", async () => {
    const lead = await db.insertLead({ ...base, name: "Борис" });
    const updated = await db.updateLead(lead.id, { status: "won", note: "оплатил" });
    expect(updated?.status).toBe("won");
    expect(updated?.note).toBe("оплатил");
    const won = await db.listLeads({ status: "won" });
    expect(won.some((l) => l.id === lead.id)).toBe(true);
  });

  it("treats search input as data, not SQL", async () => {
    const result = await db.listLeads({ q: "'; DROP TABLE leads; --" });
    expect(result).toEqual([]);
    expect((await db.listLeads()).length).toBeGreaterThan(0);
  });

  it("deletes a lead and reports stats", async () => {
    const lead = await db.insertLead({ ...base, name: "Вера" });
    expect(await db.deleteLead(lead.id)).toBe(true);
    expect(await db.getLead(lead.id)).toBeUndefined();
    const stats = await db.leadStats();
    expect(stats.total).toBeGreaterThanOrEqual(2);
  });
});
