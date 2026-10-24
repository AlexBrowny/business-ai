import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteLead, getLead, updateLead } from "@/lib/db";
import { sendLeadToTelegram } from "@/lib/telegram";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum(["new", "in_work", "won", "lost"]).optional(),
  note: z.string().max(2000).optional(),
  resendTelegram: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

async function parseId(ctx: Ctx): Promise<number | null> {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(req: Request, ctx: Ctx) {
  const id = await parseId(ctx);
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!id || !parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const lead = await getLead(id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { resendTelegram, ...patch } = parsed.data;
  const tg_status = resendTelegram ? await sendLeadToTelegram(lead) : undefined;
  const updated = await updateLead(id, { ...patch, ...(tg_status && { tg_status }) });
  return NextResponse.json({ lead: updated });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const id = await parseId(ctx);
  if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  return (await deleteLead(id))
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}
