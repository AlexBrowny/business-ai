import { testimonials } from "@/content/site";
import { Marquee } from "@/components/fx/Marquee";

function Card({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <figure className="glass w-[320px] shrink-0 rounded-3xl p-6 sm:w-[380px]">
      <div className="mb-3 text-brand-3" aria-label="5 из 5">
        ★★★★★
      </div>
      <blockquote className="text-sm leading-relaxed text-foreground/90">«{t.text}»</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-sm font-bold">
          {t.name[0]}
        </span>
        <span>
          <span className="block text-sm font-semibold">{t.name}</span>
          <span className="block text-xs text-muted">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const half = Math.ceil(testimonials.length / 2);
  const rows = [testimonials.slice(0, half), testimonials.slice(half)];
  return (
    <section id="reviews" className="overflow-hidden py-28">
      <div className="mx-auto mb-14 max-w-7xl px-6">
        <p className="text-sm font-medium tracking-widest text-brand-2 uppercase">Отзывы</p>
        <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
          Нам доверяют <span className="text-gradient">владельцы бизнеса</span>
        </h2>
      </div>
      <div className="space-y-5 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        {rows.map((row, i) => (
          <Marquee key={i} duration={i === 0 ? 55 : 70}>
            {[...row, ...row].map((t, j) => (
              <Card key={`${t.name}-${j}`} t={t} />
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}
