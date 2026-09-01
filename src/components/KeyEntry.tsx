"use client";

import { useState, useRef, useEffect } from "react";
import { Key, X, Loader2, Check, AlertCircle } from "lucide-react";
import { validateKey, type KeyTier, TIER_LABELS, TIER_DURATIONS } from "@/lib/keys";

interface KeyEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyValidated: (tier: KeyTier) => void;
}

const ALL_TIERS: KeyTier[] = ["basic", "pro", "studio", "lifetime"];

export default function KeyEntry({ isOpen, onClose, onKeyValidated }: KeyEntryProps) {
  const [keyInput, setKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setKeyInput("");
      setError("");
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").trim();
    setKeyInput(text);
    setError("");
    // Auto-submit on paste
    if (text.length > 5) {
      setTimeout(() => handleValidate(text), 100);
    }
  };

  const handleValidate = async (key?: string) => {
    const code = (key || keyInput).trim();
    if (!code) {
      setError("Please paste or enter your access key");
      return;
    }

    setLoading(true);
    setError("");

    const result = await validateKey(code);

    if (result.success && result.key) {
      setSuccess(true);
      setTimeout(() => {
        onKeyValidated(result.key!.tier);
        onClose();
      }, 800);
    } else {
      setError(result.error || "Invalid key");
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && keyInput.trim()) handleValidate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-md"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-elevated)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(6,148,148,0.08)", border: "1px solid rgba(6,148,148,0.12)" }}
            >
              <Key className="w-5 h-5 text-[var(--accent-teal)]" />
            </div>
            <h2
              className="text-xl text-[var(--text-primary)] mb-1"
              style={{ fontFamily: "var(--font-space), Georgia, serif" }}
            >
              Enter Access Key
            </h2>
            <p className="text-xs text-[var(--text-muted)]">Paste your access key to unlock premium features</p>
          </div>

          {/* Single paste input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Paste your key here..."
              disabled={loading || success}
              className="w-full px-4 py-3.5 text-center font-mono text-sm tracking-wider rounded-lg border transition-all duration-200 focus:outline-none disabled:opacity-50 placeholder:text-[var(--text-ghost)] placeholder:font-sans placeholder:tracking-normal"
              style={{
                background: "var(--bg-deep)",
                borderColor: error
                  ? "rgba(239,68,68,0.4)"
                  : success
                  ? "rgba(34,197,94,0.4)"
                  : "var(--border-medium)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Status messages */}
          {error && (
            <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              <span className="text-xs text-green-400">Key activated! Unlocking features...</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => handleValidate()}
            disabled={loading || success || !keyInput.trim()}
            className="w-full mt-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: success ? "var(--accent-sage)" : "var(--accent-teal)", color: "#181818" }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />Verifying...
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4" />Activated!
              </>
            ) : (
              "Activate Key"
            )}
          </button>

          {/* Tier reference */}
          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-muted)] tracking-[0.12em] uppercase mb-3 text-center">
              Key Tiers
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALL_TIERS.map((tier) => (
                <div
                  key={tier}
                  className="flex items-center justify-between p-2 rounded-md"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
                >
                  <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                    {TIER_LABELS[tier]}
                  </span>
                  <span className="text-[9px] text-[var(--text-muted)]">{TIER_DURATIONS[tier]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
