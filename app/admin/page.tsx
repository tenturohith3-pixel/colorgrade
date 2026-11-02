import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Wrench } from "lucide-react";
import { AdminForge } from "@/components/admin/AdminForge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Key Forge",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const pin = process.env.ADMIN_PIN;
  const secret = process.env.LICENSE_SECRET;
  const pinSet = Boolean(pin && pin.length >= 6);
  const secretSet = Boolean(secret && secret.length >= 16);

  return (
    <main className="relative min-h-screen pt-28 pb-24">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="ambient-a absolute -top-32 right-0 size-[34rem] rounded-full blur-[140px] opacity-[0.08]"
          style={{
            background:
              "radial-gradient(circle, rgba(201,160,106,0.5), transparent 65%)",
          }}
        />
      </div>

      <section className="px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <span className="pill-badge">
            <ShieldCheck className="size-3.5 text-bronze-bright" />
            STAFF ONLY
          </span>
          <h1 className="display text-4xl md:text-5xl mt-6">
            License control room.
          </h1>
          <p className="mt-3 text-ink-muted text-[15px]">
            Mint tier keys for customers and the Prism Bundle. Access is the
            PIN — don&rsquo;t share it beyond the people who should mint.
          </p>

          <div className="my-8 hairline" />

          <AdminForge pinSet={pinSet} secretSet={secretSet} />

          <div className="mt-10 glass p-6 flex items-start gap-3">
            <Wrench className="size-4 text-bronze-bright mt-0.5 shrink-0" />
            <p className="text-[12.5px] text-ink-muted leading-relaxed">
              Prefer the terminal? The same power lives locally:{" "}
              <code className="mono-num text-[11px] text-bronze-bright">
                bun run mint pro
              </code>{" "}
              from the repo (uses your local{" "}
              <code className="mono-num text-[11px]">LICENSE_SECRET</code>). To
              revoke a person&rsquo;s minting access, rotate the PIN or the
              secret in Vercel.
            </p>
          </div>

          <p className="mt-6 text-center">
            <Link href="/" className="text-ink-faint hover:text-ink text-[13px]">
              ← back to the platform
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
