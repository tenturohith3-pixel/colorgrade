"use client";

import { useState, useEffect } from "react";
import { Key, Clock, ChevronDown, LogOut, AlertTriangle } from "lucide-react";
import {
  getTimeRemaining,
  getExpirationLevel,
  TIER_LABELS,
  removeStoredKey,
  type KeyTier,
  type ExpirationLevel,
} from "@/lib/keys";

interface KeyBadgeProps {
  currentTier: KeyTier | null;
  onKeyRemoved: () => void;
  onChangeKey: () => void;
}

const TIER_COLORS: Record<KeyTier, string> = {
  basic: "#6B7B8D",
  pro: "#D4A574",
  studio: "#A67C52",
  lifetime: "#7A9B7E",
};

/** Colors for expiration urgency levels */
const EXPIRY_STYLES: Record<ExpirationLevel, { border: string; text: string; bg: string; glow: string }> = {
  safe:     { border: "", text: "", bg: "", glow: "" },
  warning:  { border: "#D4A57433", text: "#D4A574", bg: "rgba(212,165,116,0.08)", glow: "0 0 12px rgba(212,165,116,0.15)" },
  urgent:   { border: "#EF444433", text: "#EF4444", bg: "rgba(239,68,68,0.08)", glow: "0 0 12px rgba(239,68,68,0.15)" },
  expired:  { border: "#EF444433", text: "#EF4444", bg: "rgba(239,68,68,0.08)", glow: "" },
  lifetime: { border: "", text: "", bg: "", glow: "" },
};

export default function KeyBadge({ currentTier, onKeyRemoved, onChangeKey }: KeyBadgeProps) {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [expiryLevel, setExpiryLevel] = useState<ExpirationLevel>("safe");

  useEffect(() => {
    const update = () => {
      setTimeLeft(getTimeRemaining());
      setExpiryLevel(getExpirationLevel());
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [currentTier]);

  if (!currentTier) return null;

  const tierColor = TIER_COLORS[currentTier];
  const expiry = EXPIRY_STYLES[expiryLevel];
  const isWarning = expiryLevel === "warning" || expiryLevel === "urgent";
  const badgeColor = isWarning ? expiry.text : tierColor;

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-300 hover:bg-white/5"
        style={{
          border: `1px solid ${isWarning ? expiry.border : `${tierColor}33`}`,
          color: badgeColor,
          boxShadow: isWarning ? expiry.glow : undefined,
          animation: expiryLevel === "urgent" ? "glowPulse 2s ease-in-out infinite" : undefined,
        }}
      >
        {isWarning ? (
          <AlertTriangle className="w-3 h-3" />
        ) : (
          <Key className="w-3 h-3" />
        )}
        <span className="hidden sm:inline">{TIER_LABELS[currentTier]}</span>
        {timeLeft && (
          <>
            <span className="text-[var(--text-ghost)]">·</span>
            <Clock className="w-2.5 h-2.5 opacity-60" />
            <span className={`hidden md:inline ${isWarning ? "font-semibold" : "opacity-70"}`}>{timeLeft}</span>
          </>
        )}
        <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-56 z-50 p-3"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-elevated)",
            }}
          >
            {/* Current key info */}
            <div className="mb-3 pb-3 border-b border-[var(--border-subtle)]">
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Current Key
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: tierColor }} />
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  {TIER_LABELS[currentTier]} Access
                </span>
              </div>
              {timeLeft && (
                <div
                  className="text-[10px] mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-md"
                  style={{
                    color: isWarning ? expiry.text : "var(--text-muted)",
                    background: isWarning ? expiry.bg : "transparent",
                  }}
                >
                  {isWarning ? <AlertTriangle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                  <span className={isWarning ? "font-medium" : ""}>{timeLeft}</span>
                </div>
              )}
            </div>

            {/* Expiry warning in dropdown */}
            {expiryLevel === "warning" && (
              <div className="mb-3 p-2 rounded-md text-[10px] leading-relaxed" style={{ background: "rgba(212,165,116,0.06)", border: "1px solid rgba(212,165,116,0.12)", color: "#D4A574" }}>
                Your key expires soon. Upgrade or get a new key to keep access.
              </div>
            )}
            {expiryLevel === "urgent" && (
              <div className="mb-3 p-2 rounded-md text-[10px] leading-relaxed" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", color: "#EF4444" }}>
                ⚠️ Your key expires within 24 hours. Get a new key to avoid losing access.
              </div>
            )}

            {/* Actions */}
            <button
              onClick={() => { setOpen(false); onChangeKey(); }}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
            >
              <Key className="w-3 h-3" />
              Change Key
            </button>
            <button
              onClick={() => { removeStoredKey(); onKeyRemoved(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Remove Key
            </button>
          </div>
        </>
      )}
    </div>
  );
}
