import type { Metadata, Viewport } from "next";
import { Inter, Unbounded } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });
const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "NeuroFlow — ИИ-автоматизация для бизнеса",
  description:
    "ИИ-ассистенты, которые отвечают клиентам 24/7 и собирают заявки. Запуск за 14 дней, окупаемость от 2 месяцев.",
  openGraph: {
    title: "NeuroFlow — ИИ-автоматизация для бизнеса",
    description: "Ассистент, который продаёт и принимает заявки круглосуточно.",
    type: "website",
    locale: "ru_RU",
  },
};

export const viewport: Viewport = { themeColor: "#05060d" };

const THEME_SCRIPT = `try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${unbounded.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Ставим тему до отрисовки, чтобы не было вспышки */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="noise min-h-screen">{children}</body>
    </html>
  );
}
