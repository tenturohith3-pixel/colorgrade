import type { Metadata } from "next";
import { Reveal } from "@/components/site/Reveal";
import { CatalogExplorer } from "@/components/plugins/CatalogExplorer";
import {
  plugins,
  pluginCategories,
  pluginCount,
} from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Prism Plugins",
  description: `${pluginCount} premium WASM plugins — blur, light, stylize, keying, time and more. Binaries you keep.`,
};

const ID = "catalog";

export default function PluginsPage() {
  return (
    <main className="relative overflow-hidden pt-36">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="ambient-a absolute -top-32 right-0 size-[36rem] rounded-full blur-[140px] opacity-[0.1]"
          style={{
            background:
              "radial-gradient(circle, rgba(90,110,200,0.5), transparent 65%)",
          }}
        />
      </div>

      <section className="px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <span className="pill-badge">PRISM ECOSYSTEM</span>
            <h1 className="display text-5xl md:text-7xl gradient-text mt-8 max-w-3xl leading-[1.05]">
              {pluginCount} modules. Eight disciplines.
            </h1>
            <p className="mt-5 text-lg text-ink-muted font-light max-w-2xl leading-relaxed">
              GPU-class effects built as WASM binaries — S_Glow, S_Twixtor Pro,
              S_Light Rays and friends. Every entry ships its binary and a
              rendered reference frame. Yours to keep.
            </p>
          </Reveal>
        </div>
      </section>

      <section id={ID} className="relative py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <CatalogExplorer plugins={[...plugins]} categories={pluginCategories} />
        </div>
      </section>
    </main>
  );
}
