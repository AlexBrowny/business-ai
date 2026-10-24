import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPassword, createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { clientKey, isRateLimited } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (isRateLimited(`login:${clientKey(req)}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: "Слишком много попыток, подождите." }, { status: 429 });
  }
  const parsed = z.object({ password: z.string().max(200) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success || !checkPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSession(), sessionCookieOptions);
  return res;
}
