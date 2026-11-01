import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="mono-label mb-6">404 — Frame not found</p>
      <h1 className="display text-4xl md:text-6xl gradient-text">
        This cut is offline.
      </h1>
      <p className="mt-4 text-ink-muted max-w-md">
        The reel you followed doesn&rsquo;t exist in this timeline.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to the platform
      </Link>
    </main>
  );
}
