import { z } from "zod";
import { insertLead, updateLead, type Lead } from "./db";
import { sendLeadToTelegram } from "./telegram";

const text = (max: number) => z.string().trim().max(max);

export const leadSchema = z.object({
  name: text(80).min(2, "Укажите имя"),
  contact: text(100).min(5, "Укажите телефон или Telegram"),
  message: text(1000).default(""),
  source: z.enum(["form", "quiz", "chat"]).default("form"),
  answers: z
    .record(z.string().max(40), text(200))
    .refine((o) => Object.keys(o).length <= 10)
    .default({}),
  chatSummary: text(4000).default(""),
  consent: z.literal(true, { error: "Нужно согласие на обработку данных" }),
  // honeypot: боты заполняют скрытое поле
  website: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export async function createLead(input: LeadInput): Promise<Lead> {
  const lead = await insertLead({
    name: input.name,
    contact: input.contact,
    message: input.message,
    source: input.source,
    answers: input.answers,
    chatSummary: input.chatSummary,
  });
  // Сбой Telegram не должен терять заявку: она уже в базе.
  const tg_status = await sendLeadToTelegram(lead);
  return (await updateLead(lead.id, { tg_status })) ?? lead;
}
