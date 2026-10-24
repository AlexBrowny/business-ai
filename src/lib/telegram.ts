import type { Lead, TgStatus } from "./db";

const SOURCE_LABEL = { form: "Форма", quiz: "Квиз", chat: "ИИ-чат" } as const;

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function formatLeadMessage(lead: Lead): string {
  const lines = [
    `🔥 <b>Новая заявка #${lead.id}</b> · ${SOURCE_LABEL[lead.source]}`,
    "",
    `👤 <b>${escapeHtml(lead.name)}</b>`,
    `📞 ${escapeHtml(lead.contact)}`,
  ];
  if (lead.message) lines.push("", `💬 ${escapeHtml(lead.message)}`);
  const answers = Object.entries(lead.answers);
  if (answers.length) {
    lines.push("", ...answers.map(([k, v]) => `• ${escapeHtml(k)}: ${escapeHtml(v)}`));
  }
  if (lead.chat_summary) {
    lines.push("", `🤖 <i>${escapeHtml(lead.chat_summary.slice(0, 1200))}</i>`);
  }
  return lines.join("\n").slice(0, 4000);
}

export async function sendLeadToTelegram(lead: Lead): Promise<TgStatus> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return "skipped";
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatLeadMessage(lead),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("Telegram error", res.status, await res.text());
      return "failed";
    }
    return "sent";
  } catch (err) {
    console.error("Telegram request failed", err);
    return "failed";
  }
}
