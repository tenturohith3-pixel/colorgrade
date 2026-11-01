import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Cpu, Box } from "lucide-react";
import { pluginById, plugins } from "@/lib/catalog";
import { Reveal } from "@/components/site/Reveal";

export async function generateStaticParams() {
  return plugins.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const plugin = pluginById(id);
  if (!plugin) return { title: "Plugin not found" };
  return {
    title: `${plugin.name} — Prism`,
    description: `${plugin.name} — ${plugin.category} WASM module for the EffectCraft pipeline.`,
  };
}

export default async function PluginDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plugin = pluginById(id);
  if (!plugin) notFound();

  const related = plugins
    .filter((p) => p.category === plugin.category && p.id !== plugin.id)
    .slice(0, 3);
  const binaryFile = plugin.binaryPath.split("/").at(-1) ?? `${plugin.id}.wasm`;

  return (
    <main className="pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8">
        <Link
          href="/plugins"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-10"
        >
          <ArrowLeft className="size-4" /> Back to catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-10 items-start">
          {/* Visual */}
          <Reveal>
            <div className="relative rounded-2xl border border-line overflow-hidden bg-bg-raised noise">
              <div className="relative aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={plugin.imagePath}
                  alt={`${plugin.name} rendered reference`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute left-4 top-4 pill-badge !bg-black/50 text-bronze-bright">
                  REFERENCE RENDER
                </span>
              </div>
            </div>
          </Reveal>

          {/* Spec sheet */}
          <Reveal delay={120}>
            <div className="space-y-6">
              <div>
                <p className="mono-label mb-3">{plugin.category}</p>
                <h1 className="display text-4xl md:text-5xl">{plugin.name}</h1>
                <p className="mono-num text-[11px] text-ink-faint mt-2">
                  prism://{plugin.id} — wasm/wasi
                </p>
              </div>

              <p className="text-[15px] text-ink-muted leading-relaxed">
                A Prism module from the{" "}
                {plugin.category.toLowerCase()} discipline. Drop the binary in
                your host&rsquo;s module directory or run it inside
                EffectCraft-compatible pipelines. Versioned, deterministic and
                unwatermarked — the file is yours.
              </p>

              <dl className="glass divide-y divide-line overflow-hidden text-sm">
                <Row label="Module ID" value={plugin.id} mono />
                <Row label="Binary" value={binaryFile} mono />
                <Row label="Format" value="WebAssembly (wasm32)" />
                <Row label="Category" value={plugin.category} />
                <Row label="License" value="Royalty-free, single instance" />
              </dl>

              <a
                href={`/api/plugins/${plugin.id}/download`}
                className="btn-primary w-full justify-center gap-2"
                download
              >
                <Download className="size-4" />
                Download binary — {binaryFile}
              </a>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: Cpu, label: "WASM32" },
                  { icon: Box, label: "Deterministic" },
                  { icon: Download, label: "Yours forever" },
                ].map((b) => (
                  <div key={b.label} className="glass p-4">
                    <b.icon className="size-4 mx-auto text-bronze-bright" strokeWidth={1.5} />
                    <p className="mono-label !text-[8px] mt-2">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Related */}
        {related.length > 0 ? (
          <div className="mt-24">
            <p className="mono-label mb-8">MORE IN {plugin.category.toUpperCase()}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/plugins/${r.id}`}
                  className="glass card-hover overflow-hidden group"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.imagePath}
                      alt={r.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <p className="display">{r.name}</p>
                    <p className="mono-num text-[10px] text-ink-faint mt-1">{r.id}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <dt className="mono-label !text-[9px]">{label}</dt>
      <dd className={mono ? "mono-num text-[11px] text-ink" : "text-[13px] text-ink"}>
        {value}
      </dd>
    </div>
  );
}
