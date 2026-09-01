"use client";

import { useState } from "react";
import { Key, Copy, Check, Loader2, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────

type KeyTier = "basic" | "pro" | "studio" | "lifetime";

// ── Constants ────────────────────────────────────────

const TIER_INFO: Record<KeyTier, { label: string; duration: string; color: string }> = {
  basic: { label: "Basic", duration: "7 days", color: "#4A8A8A" },
  pro: { label: "Pro", duration: "30 days", color: "#069494" },
  studio: { label: "Studio", duration: "1 year", color: "#047A7A" },
  lifetime: { label: "Lifetime", duration: "Never expires", color: "#3DAAAA" },
};

const ALL_TIERS: KeyTier[] = ["basic", "pro", "studio", "lifetime"];

// ── Component ────────────────────────────────────────

export default function AdminPage() {
  // Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [authError, setAuthError] = useState("");

  // Generate
  const [selectedTier, setSelectedTier] = useState<KeyTier>("pro");
  const [keyCount, setKeyCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  // ── Auth ───────────────────────────────────────────

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminSecret.trim().length > 0) {
      setAuthenticated(true);
      setAuthError("");
    }
  };

  // ── Key Generation ─────────────────────────────────

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setGeneratedKeys([]);
    try {
      const res = await fetch("/api/admin/generate-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier, count: keyCount, secret: adminSecret }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) setError(data.error || "Failed to generate keys");
      else setGeneratedKeys(data.keys);
    } catch {
      setError("Network error — check your connection");
    }
    setLoading(false);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedKeys.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // ── Auth Gate ──────────────────────────────────────

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm p-8"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          <div className="text-center mb-6">
            <Shield className="w-8 h-8 text-[var(--accent-teal)] mx-auto mb-3" />
            <h1
              className="text-xl text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-space), Georgia, serif" }}
            >
              Admin Access
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">Enter your admin secret to continue</p>
          </div>
          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {authError}
            </div>
          )}
          <form onSubmit={handleAuth}>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Admin secret"
              className="w-full px-4 py-3 rounded-lg text-sm mb-4 focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
              style={{
                background: "var(--bg-deep)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-lg text-sm font-medium transition-all"
              style={{ background: "var(--accent-teal)", color: "#181818" }}
            >
              Authenticate
            </button>
          </form>
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 mt-4 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-2"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to site
            </Link>
            <h1
              className="text-2xl md:text-3xl text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-space), Georgia, serif" }}
            >
              Key Generator
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Generate signed access keys. No database required — keys are self-contained tokens.
            </p>
          </div>
          <Key className="w-6 h-6 text-[var(--accent-teal)] opacity-40" />
        </div>

        {/* Generate Card */}
        <div
          className="p-6 md:p-8 mb-6"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <h2 className="text-sm font-medium text-[var(--text-primary)] mb-5">Generate Keys</h2>

          {/* Tier selection */}
          <div className="mb-5">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              Tier
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ALL_TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTier(t)}
                  className="p-3 rounded-lg text-center transition-all duration-200"
                  style={{
                    background: selectedTier === t ? "var(--bg-card)" : "transparent",
                    border:
                      selectedTier === t
                        ? `1px solid ${TIER_INFO[t].color}`
                        : "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full mx-auto mb-1.5"
                    style={{ background: TIER_INFO[t].color }}
                  />
                  <div className="text-xs font-medium text-[var(--text-primary)]">
                    {TIER_INFO[t].label}
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
                    {TIER_INFO[t].duration}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="mb-5">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              Number of Keys
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={keyCount}
              onChange={(e) => setKeyCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="w-32 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
              style={{
                background: "var(--bg-deep)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-primary)",
              }}
            />
            <span className="text-[10px] text-[var(--text-ghost)] ml-2">max 100</span>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            style={{ background: "var(--accent-teal)", color: "#181818" }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Generate {keyCount} {TIER_INFO[selectedTier].label} Key{keyCount > 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>

        {/* Generated Keys */}
        {generatedKeys.length > 0 && (
          <div
            className="p-6 md:p-8"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-[var(--text-primary)]">
                Generated Keys ({generatedKeys.length})
              </h2>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  color: copied ? "var(--accent-sage)" : "var(--text-secondary)",
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy All
                  </>
                )}
              </button>
            </div>
            <div
              className="p-4 rounded-lg max-h-80 overflow-y-auto"
              style={{ background: "var(--bg-deep)", border: "1px solid var(--border-subtle)" }}
            >
              {generatedKeys.map((key, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0"
                >
                  <span className="font-mono text-xs text-[var(--text-primary)] tracking-wider break-all mr-2">
                    {key}
                  </span>
                  <button
                    onClick={() => handleCopyKey(key)}
                    className="p-1 rounded text-[var(--text-ghost)] hover:text-[var(--text-secondary)] transition-colors flex-shrink-0"
                    title="Copy"
                  >
                    {copiedKey === key ? (
                      <Check className="w-3 h-3 text-[var(--accent-sage)]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-[var(--text-ghost)] mt-3">
              Keys are cryptographically signed. Each key expires after{" "}
              {TIER_INFO[selectedTier].duration.toLowerCase()}. Copy these keys and distribute to
              users — they paste them in the tool to activate.
            </p>
          </div>
        )}

        {/* Info Card */}
        <div
          className="mt-6 p-5 rounded-lg"
          style={{
            background: "rgba(6,148,148,0.04)",
            border: "1px solid rgba(6,148,148,0.1)",
          }}
        >
          <h3 className="text-xs font-medium text-[var(--accent-teal)] mb-2">How it works</h3>
          <ul className="text-[11px] text-[var(--text-muted)] space-y-1.5">
            <li>• Keys are HMAC-signed tokens — no database needed</li>
            <li>• Each key embeds its tier, expiry, and creation time</li>
            <li>• Cryptographically tamper-proof — users can&apos;t forge keys</li>
            <li>• Requires <code className="text-[var(--accent-teal)]">TOKEN_SECRET</code> env var in Vercel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
