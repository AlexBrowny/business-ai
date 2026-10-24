# NeuroFlow — лендинг с ИИ-ассистентом

Next.js 16 + Tailwind 4 + SQLite. Лендинг (оффер → преимущества → процесс → отзывы → FAQ → форма), ИИ-консультант на `gemini-3.5-flash-lite` с квизом, админка `/admin`, дублирование заявок в Telegram-группу.

Эффекты: Lenis (плавный скролл), GSAP ScrollTrigger (параллакс), Framer Motion, 3D-ядро на React Three Fiber.

## Запуск

```bash
npm install
cp .env.example .env.local   # заполните значения
npm run dev                  # http://localhost:3000, админка: /admin
```

## Настройка

| Переменная | Что это |
|---|---|
| `GEMINI_API_KEY` | ключ из https://aistudio.google.com/apikey |
| `TELEGRAM_BOT_TOKEN` | токен бота из @BotFather |
| `TELEGRAM_CHAT_ID` | id группы менеджеров (отрицательное число) |
| `ADMIN_PASSWORD` | пароль входа в `/admin` |
| `SESSION_SECRET` | случайная строка от 32 символов |

**Telegram:** создайте бота в @BotFather → добавьте его в группу → напишите в группе любое сообщение → откройте `https://api.telegram.org/bot<TOKEN>/getUpdates` и возьмите `chat.id`.

Без ключей сайт работает: заявки сохраняются в `data/leads.db`, чат показывает запасное сообщение, у заявки в админке виден статус Telegram и кнопка «Отправить повторно».

## Команды

`npm run build` · `npm run lint` · `npm test`

## Контент

Все тексты и база знаний ИИ — в `src/content/site.ts`. Шаблон легко адаптировать под другой бизнес.
