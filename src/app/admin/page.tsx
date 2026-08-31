"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Key,
  Copy,
  Check,
  Loader2,
  Shield,
  ArrowLeft,
  Filter,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Trash2,
  Ban,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────

type KeyTier = "basic" | "pro" | "studio" | "lifetime";
type KeyStatus = "available" | "consumed" | "expired";

interface KeyRecord {
  id: string;
  key_code: string;
  tier: string;
  created_at: string;
  expires_at: string | null;
  is_consumed: boolean;
  used_at: string | null;
  status: KeyStatus;
}

interface KeyListResponse {
  success: boolean;
  keys: KeyRecord[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
}

// ── Constants ────────────────────────────────────────

const TIER_INFO: Record<KeyTier, { label: string; duration: string; color: string }> = {
  basic: { label: "Basic", duration: "7 days", color: "#4A8A8A" },
  pro: { label: "Pro", duration: "30 days", color: "#069494" },
  studio: { label: "Studio", duration: "1 year", color: "#047A7A" },
  lifetime: { label: "Lifetime", duration: "Never expires", color: "#3DAAAA" },
};

const STATUS_STYLES: Record<KeyStatus, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "#3DAAAA", bg: "rgba(61,170,170,0.1)" },
  consumed: { label: "Used", color: "#B5B0A0", bg: "rgba(181,176,160,0.1)" },
  expired: { label: "Expired", color: "#8B5E5E", bg: "rgba(139,94,94,0.1)" },
};

const ALL_TIERS: KeyTier[] = ["basic", "pro", "studio", "lifetime"];
const ALL_STATUSES: KeyStatus[] = ["available", "consumed", "expired"];

// ── Component ────────────────────────────────────────

export default function AdminPage() {
  // Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [authError, setAuthError] = useState("");

  // Tab
  const [activeView, setActiveView] = useState<"generate" | "list">("generate");

  // Generate
  const [selectedTier, setSelectedTier] = useState<KeyTier>("pro");
  const [keyCount, setKeyCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // List
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTier, setFilterTier] = useState<KeyTier | "">("");
  const [filterStatus, setFilterStatus] = useState<KeyStatus | "">("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Selection & Revoke
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [revoking, setRevoking] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState<{ type: "single" | "bulk" | "filtered"; ids?: string[]; count?: number } | null>(null);

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

  // ── Key Listing ────────────────────────────────────

  const fetchKeys = useCallback(async (p: number) => {
    setListLoading(true);
    setSelectedIds(new Set());
    const params = new URLSearchParams({ secret: adminSecret, page: String(p), limit: "20" });
    if (filterTier) params.set("tier", filterTier);
    if (filterStatus) params.set("status", filterStatus);

    try {
      const res = await fetch(`/api/admin/keys?${params}`);
      const data: KeyListResponse = await res.json();
      if (data.success) {
        setKeys(data.keys);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }
    } catch { /* silent */ }
    setListLoading(false);
  }, [adminSecret, filterTier, filterStatus]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount/filter change is a valid pattern
  // Trigger fetch when filters/view change (after initial mount)
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    if (authenticated && activeView === "list") fetchKeys(1);
  }, [authenticated, activeView, filterTier, filterStatus, fetchKeys]);

  // ── Selection ──────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const selectable = keys.filter((k) => k.status === "available");
    if (selectedIds.size === selectable.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectable.map((k) => k.id)));
    }
  };

  // ── Revoke ─────────────────────────────────────────

  const revokeKeys = async (keyIds?: string[], revokeAll = false, statusFilter?: string) => {
    setRevoking(true);
    try {
      const body: Record<string, unknown> = { secret: adminSecret };
      if (revokeAll) body.all = true;
      else if (keyIds) body.keyIds = keyIds;
      else if (statusFilter) body.status = statusFilter;

      const res = await fetch("/api/admin/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIds(new Set());
        fetchKeys(page);
      }
    } catch { /* silent */ }
    setRevoking(false);
    setRevokeConfirm(null);
  };

  const handleRevokeSingle = (id: string) => {
    setRevokeConfirm({ type: "single", ids: [id], count: 1 });
  };

  const handleRevokeSelected = () => {
    const ids = Array.from(selectedIds);
    setRevokeConfirm({ type: "bulk", ids, count: ids.length });
  };

  // ── Auth Gate ──────────────────────────────────────

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm p-8" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-elevated)" }}>
          <div className="text-center mb-6">
            <Shield className="w-8 h-8 text-[var(--accent-teal)] mx-auto mb-3" />
            <h1 className="text-xl text-[var(--text-primary)]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Admin Access</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">Enter your admin secret to continue</p>
          </div>
          {authError && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">{authError}</div>}
          <form onSubmit={handleAuth}>
            <input type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} placeholder="Admin secret" className="w-full px-4 py-3 rounded-lg text-sm mb-4 focus:outline-none focus:border-[var(--accent-teal)] transition-colors" style={{ background: "var(--bg-deep)", border: "1px solid var(--border-medium)", color: "var(--text-primary)" }} />
            <button type="submit" className="w-full py-3 rounded-lg text-sm font-medium transition-all" style={{ background: "var(--accent-teal)", color: "#181818" }}>Authenticate</button>
          </form>
          <Link href="/" className="flex items-center justify-center gap-1.5 mt-4 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"><ArrowLeft className="w-3 h-3" />Back to site</Link>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-2"><ArrowLeft className="w-3 h-3" />Back to site</Link>
            <h1 className="text-2xl md:text-3xl text-[var(--text-primary)]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Key Management</h1>
          </div>
          <Key className="w-6 h-6 text-[var(--accent-teal)] opacity-40" />
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "generate" as const, label: "Generate", icon: LayoutGrid },
            { id: "list" as const, label: "All Keys", icon: List },
          ].map((v) => (
            <button key={v.id} onClick={() => setActiveView(v.id)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200" style={{ background: activeView === v.id ? "var(--bg-elevated)" : "transparent", border: activeView === v.id ? "1px solid var(--border-medium)" : "1px solid transparent", color: activeView === v.id ? "var(--text-primary)" : "var(--text-muted)" }}>
              <v.icon className="w-3.5 h-3.5" />{v.label}
            </button>
          ))}
        </div>

        {/* ── Generate View ──────────────────────────── */}
        {activeView === "generate" && (
          <div className="space-y-6">
            <div className="p-6 md:p-8" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-md)" }}>
              <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">Generate Keys</h2>
              <div className="mb-5">
                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Tier</label>
                <div className="grid grid-cols-4 gap-2">
                  {ALL_TIERS.map((t) => (
                    <button key={t} onClick={() => setSelectedTier(t)} className="p-3 rounded-lg text-center transition-all duration-200" style={{ background: selectedTier === t ? "var(--bg-card)" : "transparent", border: selectedTier === t ? `1px solid ${TIER_INFO[t].color}` : "1px solid var(--border-subtle)" }}>
                      <div className="w-2 h-2 rounded-full mx-auto mb-1.5" style={{ background: TIER_INFO[t].color }} />
                      <div className="text-xs font-medium text-[var(--text-primary)]">{TIER_INFO[t].label}</div>
                      <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{TIER_INFO[t].duration}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Number of Keys</label>
                <input type="number" min={1} max={100} value={keyCount} onChange={(e) => setKeyCount(Math.min(100, Math.max(1, Number(e.target.value))))} className="w-32 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-teal)] transition-colors" style={{ background: "var(--bg-deep)", border: "1px solid var(--border-medium)", color: "var(--text-primary)" }} />
                <span className="text-[10px] text-[var(--text-ghost)] ml-2">max 100</span>
              </div>
              {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">{error}</div>}
              <button onClick={handleGenerate} disabled={loading} className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50" style={{ background: "var(--accent-teal)", color: "#181818" }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Key className="w-4 h-4" />Generate {keyCount} {TIER_INFO[selectedTier].label} Key{keyCount > 1 ? "s" : ""}</>}
              </button>
            </div>
            {generatedKeys.length > 0 && (
              <div className="p-6 md:p-8" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-md)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-[var(--text-primary)]">Generated Keys ({generatedKeys.length})</h2>
                  <button onClick={handleCopyAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: copied ? "var(--accent-sage)" : "var(--text-secondary)" }}>
                    {copied ? <><Check className="w-3 h-3" />Copied!</> : <><Copy className="w-3 h-3" />Copy All</>}
                  </button>
                </div>
                <div className="p-4 rounded-lg max-h-80 overflow-y-auto" style={{ background: "var(--bg-deep)", border: "1px solid var(--border-subtle)" }}>
                  {generatedKeys.map((key) => (
                    <div key={key} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
                      <span className="font-mono text-sm text-[var(--text-primary)] tracking-wider">{key}</span>
                      <button onClick={() => handleCopyKey(key)} className="p-1 rounded text-[var(--text-ghost)] hover:text-[var(--text-secondary)] transition-colors" title="Copy">
                        {copiedKey === key ? <Check className="w-3 h-3 text-[var(--accent-sage)]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-[var(--text-ghost)] mt-3">Keys are single-use and expire after {TIER_INFO[selectedTier].duration.toLowerCase()}.</p>
              </div>
            )}
          </div>
        )}

        {/* ── List View ──────────────────────────────── */}
        {activeView === "list" && (
          <div className="space-y-4">
            {/* Filters + Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <select value={filterTier} onChange={(e) => { setFilterTier(e.target.value as KeyTier | ""); setPage(1); }} className="px-3 py-2 rounded-lg text-xs" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-medium)", color: "var(--text-secondary)" }}>
                <option value="">All Tiers</option>
                {ALL_TIERS.map((t) => <option key={t} value={t}>{TIER_INFO[t].label}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as KeyStatus | ""); setPage(1); }} className="px-3 py-2 rounded-lg text-xs" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-medium)", color: "var(--text-secondary)" }}>
                <option value="">All Statuses</option>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
              </select>
              <div className="flex-1" />
              <span className="text-[10px] text-[var(--text-ghost)]">{total} key{total !== 1 ? "s" : ""}</span>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(6,148,148,0.06)", border: "1px solid var(--border-accent)" }}>
                <span className="text-xs text-[var(--text-secondary)]">{selectedIds.size} selected</span>
                <div className="flex-1" />
                <button onClick={handleRevokeSelected} disabled={revoking} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all" style={{ background: "rgba(139,94,94,0.15)", color: "#8B5E5E", border: "1px solid rgba(139,94,94,0.2)" }}>
                  <Trash2 className="w-3 h-3" />
                  Revoke Selected
                </button>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-md)" }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="w-10 px-4 py-3">
                      <input type="checkbox" onChange={toggleSelectAll} checked={keys.length > 0 && keys.filter((k) => k.status === "available").length === selectedIds.size} className="w-3.5 h-3.5 rounded accent-[var(--accent-teal)]" />
                    </th>
                    <th className="text-left text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-4 py-3 font-medium">Key</th>
                    <th className="text-left text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-4 py-3 font-medium">Tier</th>
                    <th className="text-left text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-4 py-3 font-medium">Status</th>
                    <th className="text-left text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-4 py-3 font-medium hidden md:table-cell">Created</th>
                    <th className="text-left text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-4 py-3 font-medium hidden md:table-cell">Expires</th>
                    <th className="text-right text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-4 py-3 font-medium w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[var(--text-ghost)]" /></td></tr>
                  ) : keys.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-[var(--text-ghost)]">No keys found</td></tr>
                  ) : (
                    keys.map((k) => {
                      const tier = TIER_INFO[k.tier as KeyTier] || TIER_INFO.basic;
                      const status = STATUS_STYLES[k.status];
                      const isAvailable = k.status === "available";
                      const isSelected = selectedIds.has(k.id);
                      return (
                        <tr key={k.id} className={`border-b border-[var(--border-subtle)] last:border-0 transition-colors ${isSelected ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}>
                          <td className="px-4 py-3">
                            {isAvailable && <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(k.id)} className="w-3.5 h-3.5 rounded accent-[var(--accent-teal)]" />}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-[var(--text-primary)] tracking-wider">{k.key_code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: tier.color }} />
                              <span className="text-xs text-[var(--text-secondary)]">{tier.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ color: status.color, background: status.bg }}>{status.label}</span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-[11px] text-[var(--text-muted)]">{formatDate(k.created_at)}</span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-[11px] text-[var(--text-muted)]">{k.expires_at ? formatDate(k.expires_at) : "Never"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleCopyKey(k.key_code)} className="p-1.5 rounded text-[var(--text-ghost)] hover:text-[var(--text-secondary)] transition-colors" title="Copy">
                                {copiedKey === k.key_code ? <Check className="w-3 h-3 text-[var(--accent-sage)]" /> : <Copy className="w-3 h-3" />}
                              </button>
                              {isAvailable && (
                                <button onClick={() => handleRevokeSingle(k.id)} disabled={revoking} className="p-1.5 rounded text-[var(--text-ghost)] hover:text-red-400 transition-colors" title="Revoke key">
                                  <Ban className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-ghost)]">Page {page} of {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => fetchKeys(page - 1)} disabled={page <= 1} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => fetchKeys(page + 1)} disabled={page >= totalPages} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Revoke Confirmation Modal ────────────────── */}
      {revokeConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !revoking && setRevokeConfirm(null)} />
          <div className="relative w-full max-w-sm p-6" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-elevated)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(139,94,94,0.1)" }}>
                <AlertTriangle className="w-5 h-5 text-[#8B5E5E]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Revoke Keys</h3>
                <p className="text-[11px] text-[var(--text-muted)]">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              {revokeConfirm.type === "single" && "This key will be permanently deleted. The user will lose access immediately."}
              {revokeConfirm.type === "bulk" && `${revokeConfirm.count} selected key${revokeConfirm.count! > 1 ? "s" : ""} will be permanently deleted.`}
              {revokeConfirm.type === "filtered" && `All ${revokeConfirm.count} key${revokeConfirm.count! > 1 ? "s" : ""} matching current filters will be permanently deleted.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRevokeConfirm(null)} disabled={revoking} className="flex-1 py-2.5 rounded-lg text-xs font-medium transition-all" style={{ border: "1px solid var(--border-medium)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  if (revokeConfirm.type === "single") revokeKeys(revokeConfirm.ids);
                  else if (revokeConfirm.type === "bulk") revokeKeys(revokeConfirm.ids);
                  else if (revokeConfirm.type === "filtered") revokeKeys(undefined, false, filterStatus || undefined);
                }}
                disabled={revoking}
                className="flex-1 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all"
                style={{ background: "rgba(139,94,94,0.9)", color: "#fff" }}
              >
                {revoking ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Revoking...</> : <><Trash2 className="w-3.5 h-3.5" />Revoke</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
