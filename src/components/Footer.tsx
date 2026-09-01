"use client";

export default function Footer() {
  return (
    <footer
      className="w-full py-16 md:py-24 text-sm relative z-10"
      style={{
        background: "rgba(10, 14, 26, 0.8)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderTop: "1px solid rgba(125, 211, 252, 0.2)",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-5 md:px-12 lg:px-16 items-center max-w-screen-2xl mx-auto">
        <div
          className="text-lg md:text-2xl text-[var(--text-primary)] opacity-80 hover:opacity-100 transition-opacity font-semibold"
          style={{ fontFamily: "var(--font-space), Georgia, serif" }}
        >
          © 2026 ColorGrade. Professional Cinematic Precision.
        </div>
        <div className="flex flex-wrap gap-4 md:gap-6 justify-start md:justify-end">
          {["Privacy Policy", "Terms of Service", "API Docs", "Support", "Community"].map(
            (link) => (
              <a
                key={link}
                href="#"
                className="text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-all opacity-80 hover:opacity-100 text-xs"
              >
                {link}
              </a>
            )
          )}
        </div>
      </div>
    </footer>
  );
}
