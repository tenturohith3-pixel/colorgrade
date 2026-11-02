/**
 * Oversized display ticker — pure CSS infinite marquee with alternating
 * outlined / filled display type. The kind of band that sits between hero
 * and the work on every award-winning one-pager.
 */

const ITEMS: { label: string; solid: boolean }[] = [
  { label: "GRADE", solid: true },
  { label: "EFFECT", solid: false },
  { label: "DELIVER", solid: true },
  { label: "REPEAT", solid: false },
  { label: "65 MODULES", solid: true },
  { label: "ZERO UPLOADS", solid: false },
];

export function Ticker() {
  return (
    <section aria-hidden className="relative py-16 md:py-24 overflow-hidden select-none">
      <div className="w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="ticker-track flex items-center gap-10 md:gap-16 w-max will-change-transform">
          {[0, 1].map((half) => (
            <div key={half} className="flex items-center gap-10 md:gap-16 shrink-0">
              {ITEMS.map((item) => (
                <span
                  key={`${half}-${item.label}`}
                  className={`display leading-none text-[13vw] md:text-[7.5rem] whitespace-nowrap ${
                    item.solid
                      ? "gradient-text"
                      : "display ticker-outline"
                  }`}
                >
                  {item.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
