import { NextResponse } from "next/server";
import { z } from "zod";
import { leadStats, listLeads } from "@/lib/db";

export const runtime = "nodejs";

const querySchema = z.object({
  status: z.enum(["new", "in_work", "won", "lost"]).optional(),
  source: z.enum(["form", "quiz", "chat"]).optional(),
  q: z.string().trim().max(100).optional(),
});

export async function GET(req: Request) {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  for (const k of Object.keys(params)) if (params[k] === "") delete params[k];
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: "Bad filter" }, { status: 400 });
  const [leads, stats] = await Promise.all([listLeads(parsed.data), leadStats()]);
  return NextResponse.json({ leads, stats });
}
