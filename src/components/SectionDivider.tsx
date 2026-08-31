interface SectionDividerProps {
  number?: string;
  accent?: boolean;
}

export default function SectionDivider({ number, accent = false }: SectionDividerProps) {
  return (
    <div className="relative py-4">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12">
        <div className="flex items-center gap-4">
          <div
            className="flex-1 h-px"
            style={{
              background: accent
                ? "linear-gradient(90deg, var(--border-subtle) 0%, var(--accent-bronze) 50%, var(--border-subtle) 100%)"
                : "var(--border-subtle)",
              opacity: accent ? 0.25 : 1,
            }}
          />
          {number && (
            <span className="section-number">{number}</span>
          )}
          <div
            className="flex-1 h-px"
            style={{
              background: accent
                ? "linear-gradient(90deg, var(--border-subtle) 0%, var(--accent-bronze) 50%, var(--border-subtle) 100%)"
                : "var(--border-subtle)",
              opacity: accent ? 0.25 : 1,
            }}
          />
        </div>
      </div>
    </div>
  );
}
