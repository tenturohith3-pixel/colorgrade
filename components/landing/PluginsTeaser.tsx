import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { pluginById } from "@/lib/catalog";

const FEATURED = [
  "prism-glow",
  "prism-light-rays",
  "twixtor-pro",
  "prism-aurora",
  "deep-glow",
  "prism-oil-paint",
];

export function PluginsTeaser() {
  const items = FEATURED.map((id) => pluginById(id)).filter(
    (p): p is NonNullable<typeof p> => p !== null,
  );
  return (
    <section className="relative py-32 px-6 md:px-12 border-y border-line/60">
      <div className="max-w-7xl mx-auto">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="mono-label mb-4">Prism Ecosystem</p>
            <h2 className="display text-4xl md:text-5xl gradient-text max-w-xl">
              The modules houses don&rsquo;t ship.
            </h2>
          </div>
          <Link
            href="/plugins"
            className="text-sm text-ink-muted hover:text-ink inline-flex items-center gap-2 shrink-0"
          >
            Full catalog <ArrowRight className="size-4" />
          </Link>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 90}>
              <Link
                href={`/plugins/${p.id}`}
                className="glass card-hover block overflow-hidden group"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imagePath}
                    alt={p.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-500"
                  />
                  <span className="absolute left-3 bottom-3 mono-label !text-[9px] !bg-black/60 !px-2.5 !py-1 rounded-md border border-white/10">
                    WASM
                  </span>
                </div>
                <div className="p-5">
                  <p className="display text-lg">{p.name}</p>
                  <p className="mt-1.5 text-[12px] text-ink-muted">
                    {p.category}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
