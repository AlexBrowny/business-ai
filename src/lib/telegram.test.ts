import { describe, expect, it } from "vitest";
import { escapeHtml, formatLeadMessage } from "./telegram";
import type { Lead } from "./db";

const lead: Lead = {
  id: 7,
  created_at: "2026-10-21 10:00:00",
  name: "<b>Иван</b>",
  contact: "@ivan & co",
  message: "",
  source: "quiz",
  answers: { "Сфера": "Услуги" },
  chat_summary: "",
  status: "new",
  note: "",
  tg_status: "skipped",
};

describe("telegram formatting", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml("<a>&")).toBe("&lt;a&gt;&amp;");
  });

  it("escapes user-supplied fields and includes quiz answers", () => {
    const text = formatLeadMessage(lead);
    expect(text).toContain("#7");
    expect(text).toContain("&lt;b&gt;Иван&lt;/b&gt;");
    expect(text).toContain("@ivan &amp; co");
    expect(text).toContain("Сфера: Услуги");
  });
});
