import { chatSchema, isGeminiConfigured, streamReply } from "@/lib/gemini";
import { clientKey, isRateLimited } from "@/lib/rateLimit";

export const runtime = "nodejs";

const FALLBACK =
  "Сейчас я не могу ответить, но вы можете пройти короткий квиз или оставить заявку — менеджер свяжется с вами.";

export async function POST(req: Request) {
  if (isRateLimited(`chat:${clientKey(req)}`, 20, 60_000)) {
    return new Response("Слишком много сообщений, подождите минуту.", { status: 429 });
  }

  const parsed = chatSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response("Некорректный запрос", { status: 400 });

  if (!isGeminiConfigured()) return new Response(FALLBACK, { status: 503 });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const piece of streamReply(parsed.data.messages)) {
          controller.enqueue(encoder.encode(piece));
        }
      } catch (err) {
        console.error("Gemini error", err);
        controller.enqueue(encoder.encode(FALLBACK));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
