import Link from "next/link";
import { ArrowRight, Blocks, Cpu, KeyRound, MonitorPlay, Palette, UploadCloud } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { pluginCount } from "@/lib/catalog";

const CAPS = [
  {
    icon: Palette,
    title: "Grading Engine",
    body: "Exposure, contrast, temperature, 3-way wheels and 8-channel HSL — applied per-pixel, per-frame, live.",
    href: "/studio",
  },
  {
    icon: Blocks,
    title: "Prism Plugin Ecosystem",
    body: `${pluginCount} GPU-class WASM plugins across blur, light, stylize, keying and time — install-ready.`,
    href: "/plugins",
  },
  {
    icon: KeyRound,
    title: "Key Access",
    body: "Start free forever. Unlock Pro, Studio and Lifetime tools with a single key — no account required.",
    href: "/pricing",
  },
  {
    icon: MonitorPlay,
    title: "4K Export Pipeline",
    body: "Deterministic offline renders at up to 4K — no server queue, no upload, no waiting room.",
    href: "/studio#export",
  },
  {
    icon: Cpu,
    title: "Runs On-Device",
    body: "Your footage never leaves the browser tab. Canvas-native processing, zero telemetry by default.",
    href: "/support",
  },
  {
    icon: UploadCloud,
    title: "Edge Delivery",
    body: "Static-first pages served from the edge — the platform loads as fast as it grades.",
    href: "/",
  },
];

export function Capabilities() {
  return (
    <section className="relative py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="mono-label mb-4">Capabilities</p>
          <h2 className="display text-4xl md:text-6xl gradient-text max-w-3xl">
            Everything post, in one quiet surface.
          </h2>
          <p className="mt-5 text-lg text-ink-muted font-light max-w-2xl leading-relaxed">
            One platform for the shot and the system behind it — grade in the
            Studio, extend with Prism, deliver to spec.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPS.map((c, i) => (
            <Reveal key={c.title} delay={(i % 3) * 90}>
              <Link
                href={c.href}
                className="glass card-hover block p-7 h-full group"
              >
                <c.icon className="size-5 text-bronze-bright" strokeWidth={1.5} />
                <h3 className="mt-5 display text-xl">{c.title}</h3>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                  {c.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[12px] text-bronze-bright/90 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
