"use client";

import { X, Key, Sparkles, Lock, Zap, Crown } from "lucide-react";

interface ExportUpsellProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

const benefits = [
  { icon: Zap, title: "4K Export", desc: "Export in full 4K resolution — 4x sharper than free" },
  { icon: Sparkles, title: "All Presets", desc: "Access 30+ cinematic LUT presets and color wheels" },
  { icon: Crown, title: "Priority Queue", desc: "Your exports process first — no waiting" },
];

export default function ExportUpsell({ isOpen, onClose, onUnlock }: ExportUpsellProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div
        className="relative w-full max-w-md overflow-hidden"
        style={{
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--neo-raised-lg), 0 0 60px rgba(6,148,148,0.1)",
          border: "1px solid var(--glass-border)",
        }}
      >
        {/* Teal glow header */}
        <div
          className="relative px-6 pt-8 pb-6 text-center"
          style={{
            background: "linear-gradient(180deg, rgba(6,148,148,0.08) 0%, transparent 100%)",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            style={{ background: "var(--bg-card)" }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Lock icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(6,148,148,0.15) 0%, rgba(6,148,148,0.05) 100%)",
              boxShadow: "var(--neo-soft)",
              border: "1px solid rgba(6,148,148,0.15)",
            }}
          >
            <Lock className="w-6 h-6 text-[var(--accent-teal)]" />
          </div>

          <h2
            className="text-xl mb-1 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-serif), 'Space Grotesk', sans-serif", fontWeight: 600 }}
          >
            Unlock Full Quality
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Upgrade to export in 4K with all premium features
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 pb-4">
          <div className="space-y-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "var(--bg-card)",
                  boxShadow: "var(--neo-soft)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(6,148,148,0.12) 0%, rgba(6,148,148,0.04) 100%)",
                    boxShadow: "var(--neo-inset)",
                  }}
                >
                  <b.icon className="w-4 h-4 text-[var(--accent-teal)]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{b.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-8 pt-2">
          <button
            onClick={onUnlock}
            className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              background: "linear-gradient(135deg, #069494 0%, #047A7A 100%)",
              color: "#EDE8D0",
              boxShadow: "var(--neo-raised), 0 0 20px rgba(6,148,148,0.2)",
            }}
          >
            <Key className="w-4 h-4" />
            Enter Access Key
          </button>
          <p className="text-center text-[10px] text-[var(--text-ghost)] mt-3">
            Basic features remain free — no key needed
          </p>
        </div>

        {/* Decorative corner glow */}
        <div
          className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 100% 0%, rgba(6,148,148,0.06) 0%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
