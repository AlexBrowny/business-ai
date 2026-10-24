import { brand } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-10 text-center text-sm text-muted">
      <p>
        © {new Date().getFullYear()} {brand.name} — {brand.tagline}
      </p>
    </footer>
  );
}
