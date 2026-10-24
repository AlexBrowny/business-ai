import { NextResponse } from "next/server";
import { createLead, leadSchema } from "@/lib/leads";
import { clientKey, isRateLimited } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (isRateLimited(`lead:${clientKey(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Слишком много заявок, попробуйте позже." }, { status: 429 });
  }

  const parsed = leadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    // Заполненный honeypot тоже попадает сюда: отвечаем как обычной ошибкой валидации
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Проверьте поля формы" },
      { status: 400 },
    );
  }

  try {
    const lead = await createLead(parsed.data);
    return NextResponse.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error("Lead save failed", err);
    return NextResponse.json({ error: "Не удалось сохранить заявку" }, { status: 500 });
  }
}
