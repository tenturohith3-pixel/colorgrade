"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Download,
  RotateCcw,
  SunMedium,
  Contrast,
  Droplets,
  CircleDot,
  Waves,
  Sparkles,
  Film,
  Palette,
  SlidersHorizontal,
  Eye,
  EyeOff,
  PanelLeftClose,
  PanelRightClose,
  X,
  Key,
  AlertTriangle,
  Wand2,
} from "lucide-react";
import { applyColorGrading, autoColorCorrect, type GradeSettings } from "@/lib/colorGrading";
import { getCurrentTier, hasTierAccess, TIER_LABELS, getExpirationLevel, getTimeRemaining, type KeyTier, type ExpirationLevel } from "@/lib/keys";
import KeyEntry from "@/components/KeyEntry";
import KeyBadge from "@/components/KeyBadge";

// ── Constants ────────────────────────────────────────

const DEFAULT_SETTINGS: GradeSettings = {
  lutPreset: "none",
  whiteBalance: 0,
  exposure: 0,
  contrast: 0,
  saturation: 0,
  brightness: 0,
  temperature: 0,
  shadowsHue: 0,
  midtonesHue: 0,
  highlightsHue: 0,
  shadowsSat: 100,
  midtonesSat: 100,
  highlightsSat: 100,
  hdrStrength: 0,
  highlightRecovery: 0,
  filmGrain: 0,
  halation: 0,
  bloom: 0,
};

const LUT_PRESETS = [
  { id: "none", name: "None", colors: ["#666", "#888", "#666"] },
  { id: "moody", name: "Moody Cinematic", colors: ["#1a4a5a", "#d4845a", "#0d3040"] },
  { id: "warm", name: "Warm Tone", colors: ["#d4a54a", "#e8c070", "#c08030"] },
  { id: "clean", name: "Clean Minimal", colors: ["#e0e0e0", "#d0d0d0", "#c8c8c8"] },
  { id: "vintage", name: "Vintage Film", colors: ["#c8a870", "#e0c898", "#a08050"] },
  { id: "cool", name: "Cool Blue", colors: ["#4a8ab0", "#6ab0d0", "#3a7090"] },
  { id: "neon", name: "Neon Pop", colors: ["#ff00ff", "#00ffff", "#ff4080"] },
  { id: "pastel", name: "Muted Pastel", colors: ["#c8a0b8", "#a0c8d0", "#b8c8a0"] },
];

type ToolTab = "basic" | "3way" | "hsl" | "effects";

/** Which tier unlocks each tab (null = always free) */
const TAB_TIER: Record<ToolTab, KeyTier | null> = {
  basic: null,
  "3way": "pro",
  hsl: "pro",
  effects: "studio",
};

// ── Main Component ───────────────────────────────────

export default function ColorToolPage() {
  const [settings, setSettings] = useState<GradeSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<ToolTab>("basic");
  const [showPreview, setShowPreview] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [keyEntryOpen, setKeyEntryOpen] = useState(false);
  const [expiryLevel, setExpiryLevel] = useState<ExpirationLevel>(() => getExpirationLevel());
  const [timeLeft, setTimeLeft] = useState<string | null>(() => getTimeRemaining());
  const [currentTier, setCurrentTier] = useState<KeyTier | null>(() => getCurrentTier());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // ── Effects ──────────────────────────────────────────

  // Poll expiry every 60s
  useEffect(() => {
    const id = setInterval(() => {
      setExpiryLevel(getExpirationLevel());
      setTimeLeft(getTimeRemaining());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) { setSidebarOpen(false); setRightPanelOpen(false); }
    else { setSidebarOpen(true); }
  }, [isMobile]);

  // ── Canvas Rendering ─────────────────────────────────

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !showPreview) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const start = performance.now();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    applyColorGrading(ctx, canvas.width, canvas.height, settings);
    setProcessingTime(Math.round(performance.now() - start));
  }, [settings, showPreview]);

  useEffect(() => { if (uploadedImage) renderCanvas(); }, [settings, uploadedImage, renderCanvas, showPreview]);

  // ── Handlers ─────────────────────────────────────────

  const update = useCallback(
    <K extends keyof GradeSettings>(key: K, value: GradeSettings[K]) =>
      setSettings((s) => ({ ...s, [key]: value })),
    []
  );

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    if (canvasRef.current && imageRef.current) renderCanvas();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setUploadedImage(src);
      const img = new Image();
      img.onload = () => { imageRef.current = img; renderCanvas(); };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `colorgraded-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Auto Color Correction — analyzes image and applies optimal settings
  const handleAutoCC = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render original image to canvas for analysis
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Analyze and get optimal settings
    const autoSettings = autoColorCorrect(ctx, canvas.width, canvas.height);
    setSettings(autoSettings);
  };

  const handleKeyValidated = (tier: KeyTier) => setCurrentTier(tier);
  const handleKeyRemoved = () => { setCurrentTier(null); setActiveTab("basic"); };
  const isTabLocked = (tab: ToolTab) => {
    const req = TAB_TIER[tab];
    return req !== null && !hasTierAccess(req);
  };

  // ── Tab Config ───────────────────────────────────────

  const tabs: { id: ToolTab; label: string; icon: React.ElementType; locked: boolean }[] = [
    { id: "basic", label: "Basic", icon: SlidersHorizontal, locked: false },
    { id: "3way", label: "3-Way", icon: CircleDot, locked: isTabLocked("3way") },
    { id: "hsl", label: "HSL", icon: Droplets, locked: isTabLocked("hsl") },
    { id: "effects", label: "Effects", icon: Sparkles, locked: isTabLocked("effects") },
  ];

  // ── Sidebar Content ──────────────────────────────────

  const sidebarContent = (
    <div className="p-4">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-sm border border-[var(--border-subtle)] mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.locked && setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 md:py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                : tab.locked
                ? "text-[var(--text-ghost)] cursor-not-allowed opacity-50"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.locked && <span className="text-[10px]">🔒</span>}
          </button>
        ))}
      </div>

      {/* Basic Tab */}
      {activeTab === "basic" && <BasicTab settings={settings} update={update} />}

      {/* 3-Way Tab */}
      {activeTab === "3way" && (
        isTabLocked("3way")
          ? <LockedPanel feature="3-Way Color Wheels" tier="pro" onUnlock={() => setKeyEntryOpen(true)} />
          : <ThreeWayTab settings={settings} update={update} />
      )}

      {/* HSL Tab */}
      {activeTab === "hsl" && (
        isTabLocked("hsl")
          ? <LockedPanel feature="HSL Target Isolation" tier="pro" onUnlock={() => setKeyEntryOpen(true)} />
          : <HSLTab />
      )}

      {/* Effects Tab */}
      {activeTab === "effects" && (
        isTabLocked("effects")
          ? <LockedPanel feature="Film Grain & Effects" tier="studio" onUnlock={() => setKeyEntryOpen(true)} />
          : <EffectsTab settings={settings} update={update} />
      )}
    </div>
  );

  // ── Render ───────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <KeyEntry isOpen={keyEntryOpen} onClose={() => setKeyEntryOpen(false)} onKeyValidated={handleKeyValidated} />

      {/* Expiry Warning Banner */}
      {currentTier && (expiryLevel === "warning" || expiryLevel === "urgent") && (
        <div
          className="sticky top-12 md:top-14 z-40 flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-medium"
          style={{
            background: expiryLevel === "urgent" ? "rgba(239,68,68,0.1)" : "rgba(6,148,148,0.08)",
            borderBottom: `1px solid ${expiryLevel === "urgent" ? "rgba(239,68,68,0.2)" : "rgba(6,148,148,0.15)"}`,
            color: expiryLevel === "urgent" ? "#EF4444" : "#0AB5B5",
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {expiryLevel === "urgent" ? (
            <span>Your key expires <strong>within 24 hours</strong>. {timeLeft} remaining.</span>
          ) : (
            <span>Your key expires soon. {timeLeft} remaining — get a new key to maintain access.</span>
          )}
          <button
            onClick={() => setKeyEntryOpen(true)}
            className="ml-2 underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Enter new key
          </button>
        </div>
      )}

      {/* Header */}
      <header className="h-12 md:h-14 bg-[var(--bg-deep)]/90 backdrop-blur-xl border-b border-[var(--border-subtle)] flex items-center justify-between px-3 md:px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-white/10 hidden sm:block" />
          <span className="text-sm font-medium text-[var(--text-secondary)] truncate hidden sm:inline">Color Grading Tool</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {processingTime > 0 && <span className="text-[10px] text-[var(--text-ghost)] font-mono hidden md:inline">{processingTime}ms</span>}
          <KeyBadge currentTier={currentTier} onKeyRemoved={handleKeyRemoved} onChangeKey={() => setKeyEntryOpen(true)} />
          {!currentTier && (
            <button onClick={() => setKeyEntryOpen(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-300 border" style={{ borderColor: "var(--border-accent)", color: "var(--accent-teal)" }}>
              <Key className="w-3 h-3" />
              <span className="hidden sm:inline">Enter Key</span>
            </button>
          )}
          {isMobile && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all" title="Toggle tools">
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
            </button>
          )}
          <button onClick={reset} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all" title="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={handleAutoCC} disabled={!uploadedImage} className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed" style={{ background: uploadedImage ? "rgba(6,148,148,0.1)" : "transparent", border: uploadedImage ? "1px solid rgba(6,148,148,0.2)" : "1px solid var(--border-medium)", color: uploadedImage ? "var(--accent-teal)" : "var(--text-muted)" }} title="Auto Color Correct">
            <Wand2 className="w-4 h-4" />
            <span className="hidden sm:inline">Auto CC</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg border border-[var(--border-medium)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg bg-[var(--accent-teal)] text-[#181818] text-sm font-medium hover:bg-[var(--accent-teal-light)] transition-all">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          {isMobile && (
            <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all" title="Adjustments">
              {rightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      </header>

      <div className="flex h-[calc(100vh-48px)] md:h-[calc(100vh-56px)]">
        {/* Left sidebar */}
        {isMobile ? (
          sidebarOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--bg-primary)] border-r border-[var(--border-subtle)] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Tools</span>
                  <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"><X className="w-4 h-4" /></button>
                </div>
                {sidebarContent}
              </div>
            </div>
          )
        ) : (
          sidebarOpen && <aside className="w-72 border-r border-[var(--border-subtle)] overflow-y-auto flex-shrink-0 bg-[var(--bg-primary)]">{sidebarContent}</aside>
        )}

        {/* Main canvas */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="h-9 md:h-10 border-b border-white/5 flex items-center justify-between px-3 md:px-4">
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <span className="hidden sm:inline">Preview</span>
              <button onClick={() => setShowPreview(!showPreview)} className="p-1 rounded hover:bg-white/5 transition-colors">
                {showPreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              {uploadedImage && <span className="text-[var(--text-ghost)] hidden md:inline">{processingTime > 0 && `Processed in ${processingTime}ms`}</span>}
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-ghost)]">
              <span className="hidden md:inline">Client-Side Engine</span>
              <span className="hidden md:inline">•</span>
              <span>Canvas 2D</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-[#08080a] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl shadow-black/50">
              {uploadedImage ? (
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(100,60,120,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(40,80,120,0.3) 0%, transparent 50%), linear-gradient(135deg, #1a1020 0%, #101828 50%, #0d1520 100%)" }}>
                  <div className="text-center px-4">
                    <Upload className="w-10 h-10 md:w-12 md:h-12 text-[var(--text-ghost)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--text-muted)]">Drop an image here or click Upload</p>
                    <p className="text-xs text-[var(--text-ghost)] mt-1">Real-time Canvas color grading</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Histogram */}
          <div className="h-16 md:h-24 border-t border-white/5 px-4 md:px-6 flex items-center gap-4 md:gap-6">
            <div className="flex-1 h-10 md:h-14 flex items-end gap-px opacity-60">
              {Array.from({ length: isMobile ? 32 : 64 }, (_, i) => {
                const h = Math.sin(i * 0.15 + settings.contrast * 0.01) * 0.3 + Math.sin(i * 0.08) * 0.2 + 0.4;
                return <div key={i} className="flex-1 rounded-t-sm transition-all duration-300" style={{ height: `${Math.max(5, h * 100)}%`, background: "linear-gradient(to top, rgba(6,148,148,0.3), rgba(6,148,148,0.1))" }} />;
              })}
            </div>
            <div className="text-xs text-[var(--text-ghost)] hidden sm:block">
              <div className="text-[var(--text-muted)]">RGB Histogram</div>
              <div className="font-mono mt-1 text-[var(--text-ghost)]">256 levels</div>
            </div>
          </div>
        </main>

        {/* Right sidebar */}
        {isMobile ? (
          rightPanelOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setRightPanelOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-64 bg-[var(--bg-primary)] border-l border-[var(--border-subtle)] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                  <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Adjustments</span>
                  <button onClick={() => setRightPanelOpen(false)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-4"><AdjustmentsPanel settings={settings} currentTier={currentTier} onUnlock={() => setKeyEntryOpen(true)} /></div>
              </div>
            </div>
          )
        ) : (
          <aside className="w-60 border-l border-[var(--border-subtle)] overflow-y-auto flex-shrink-0 p-4 bg-[var(--bg-primary)]">
            <AdjustmentsPanel settings={settings} currentTier={currentTier} onUnlock={() => setKeyEntryOpen(true)} />
          </aside>
        )}
      </div>
    </div>
  );
}

// ── Tab Panels ────────────────────────────────────────

function BasicTab({ settings, update }: { settings: GradeSettings; update: <K extends keyof GradeSettings>(k: K, v: GradeSettings[K]) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 block">LUT Presets</label>
        <div className="grid grid-cols-4 gap-2">
          {LUT_PRESETS.map((lut) => (
            <button
              key={lut.id}
              onClick={() => update("lutPreset", lut.id as GradeSettings["lutPreset"])}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${settings.lutPreset === lut.id ? "border-[var(--accent-teal)] shadow-lg shadow-[var(--accent-teal)]/20" : "border-transparent hover:border-[var(--border-medium)]"}`}
              title={lut.name}
            >
              <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${lut.colors[0]}, ${lut.colors[1]}, ${lut.colors[2]})` }} />
            </button>
          ))}
        </div>
      </div>
      <div className="h-px bg-[var(--border-subtle)]" />
      {[
        { key: "whiteBalance" as const, label: "White Balance", icon: SunMedium },
        { key: "exposure" as const, label: "Exposure", icon: SunMedium },
        { key: "contrast" as const, label: "Contrast", icon: Contrast },
        { key: "saturation" as const, label: "Saturation", icon: Droplets },
        { key: "brightness" as const, label: "Brightness", icon: SunMedium },
        { key: "temperature" as const, label: "Temperature", icon: Palette },
      ].map((s) => (
        <div key={s.key}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><s.icon className="w-3.5 h-3.5 text-[var(--text-muted)]" /><span className="text-xs text-[var(--text-secondary)]">{s.label}</span></div>
            <span className="text-xs text-[var(--text-ghost)] font-mono">{settings[s.key] > 0 ? "+" : ""}{settings[s.key]}</span>
          </div>
          <input type="range" min={-100} max={100} value={settings[s.key]} onChange={(e) => update(s.key, Number(e.target.value))} className="w-full touch-manipulation" />
        </div>
      ))}
    </div>
  );
}

function ThreeWayTab({ settings, update }: { settings: GradeSettings; update: <K extends keyof GradeSettings>(k: K, v: GradeSettings[K]) => void }) {
  const wheels = [
    { label: "Shadows", hueKey: "shadowsHue" as const, satKey: "shadowsSat" as const, color: "var(--accent-slate)" },
    { label: "Midtones", hueKey: "midtonesHue" as const, satKey: "midtonesSat" as const, color: "var(--accent-teal)" },
    { label: "Highlights", hueKey: "highlightsHue" as const, satKey: "highlightsSat" as const, color: "var(--accent-clay)" },
  ];

  return (
    <div className="space-y-5">
      {wheels.map((w) => (
        <div key={w.label}>
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 block">{w.label}</label>
          <div className="rounded-xl p-4" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(var(--glass-blur))" }}>
            <div className="w-full aspect-square rounded-full bg-[var(--bg-deep)] mb-3 relative overflow-hidden">
              <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, hsl(0,80%,50%), hsl(60,80%,50%), hsl(120,80%,50%), hsl(180,80%,50%), hsl(240,80%,50%), hsl(300,80%,50%), hsl(360,80%,50%))", opacity: 0.3 }} />
              <div className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg" style={{ background: w.color, top: "50%", left: "50%", transform: `translate(-50%, -50%) rotate(${settings[w.hueKey]}deg) translateY(-${settings[w.satKey] / 5}px)` }} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-xs text-[var(--text-muted)]">Hue</span><span className="text-xs text-[var(--text-ghost)] font-mono">{settings[w.hueKey]}°</span></div>
              <input type="range" min={0} max={360} value={settings[w.hueKey]} onChange={(e) => update(w.hueKey, Number(e.target.value))} className="w-full touch-manipulation" />
              <div className="flex items-center justify-between"><span className="text-xs text-[var(--text-muted)]">Saturation</span><span className="text-xs text-[var(--text-ghost)] font-mono">{settings[w.satKey]}%</span></div>
              <input type="range" min={0} max={200} value={settings[w.satKey]} onChange={(e) => update(w.satKey, Number(e.target.value))} className="w-full touch-manipulation" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HSLTab() {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 block">HSL Target Isolation</label>
        <p className="text-[11px] text-[var(--text-muted)] mb-3">Adjust hue, saturation, and luminance for specific color ranges.</p>
        {[{ label: "Reds", color: "#ef4444" }, { label: "Greens", color: "#22c55e" }, { label: "Blues", color: "#3b82f6" }].map((c) => (
          <div key={c.label} className="rounded-lg p-3 mb-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full" style={{ background: c.color }} /><span className="text-xs font-medium text-[var(--text-secondary)]">{c.label}</span></div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-[var(--text-muted)]">Hue</span>
              <input type="range" min={-180} max={180} defaultValue={0} className="w-full touch-manipulation" />
              <span className="text-[10px] text-[var(--text-muted)]">Saturation</span>
              <input type="range" min={0} max={200} defaultValue={100} className="w-full touch-manipulation" />
              <span className="text-[10px] text-[var(--text-muted)]">Luminance</span>
              <input type="range" min={0} max={200} defaultValue={100} className="w-full touch-manipulation" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EffectsTab({ settings, update }: { settings: GradeSettings; update: <K extends keyof GradeSettings>(k: K, v: GradeSettings[K]) => void }) {
  return (
    <div className="space-y-5">
      {[
        { key: "hdrStrength" as const, label: "HDR Emulation", icon: Waves },
        { key: "highlightRecovery" as const, label: "Highlight Recovery", icon: SunMedium },
        { key: "filmGrain" as const, label: "Film Grain", icon: Film },
        { key: "halation" as const, label: "Halation", icon: Sparkles },
        { key: "bloom" as const, label: "Bloom", icon: Eye },
      ].map((s) => (
        <div key={s.key}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><s.icon className="w-3.5 h-3.5 text-[var(--text-muted)]" /><span className="text-xs text-[var(--text-secondary)]">{s.label}</span></div>
            <span className="text-xs text-[var(--text-ghost)] font-mono">{settings[s.key]}%</span>
          </div>
          <input type="range" min={0} max={100} value={settings[s.key]} onChange={(e) => update(s.key, Number(e.target.value))} className="w-full touch-manipulation" />
        </div>
      ))}
    </div>
  );
}

// ── Locked Feature Panel ──────────────────────────────

function LockedPanel({ feature, tier, onUnlock }: { feature: string; tier: KeyTier; onUnlock: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-4">
      <div className="text-3xl mb-3">🔒</div>
      <p className="text-sm text-[var(--text-muted)] mb-1">{feature}</p>
      <p className="text-[10px] text-[var(--text-ghost)] mb-4">Requires {TIER_LABELS[tier]} access key</p>
      <button onClick={onUnlock} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200" style={{ background: "var(--accent-teal)", color: "#181818" }}>
        <Key className="w-3.5 h-3.5" />
        Enter Access Key
      </button>
    </div>
  );
}

// ── Adjustments Panel ─────────────────────────────────

function AdjustmentsPanel({ settings, currentTier, onUnlock }: { settings: GradeSettings; currentTier: KeyTier | null; onUnlock: () => void }) {
  const active = Object.entries(settings).filter(([_, v]) => v !== 0 && v !== "none" && v !== 100);

  return (
    <>
      <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">Active Adjustments</h3>
      <div className="space-y-3">
        {active.length > 0 ? active.map(([key, value]) => (
          <div key={key} className="rounded-lg px-3 py-2" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{key.replace(/([A-Z])/g, " $1").trim()}</div>
            <div className="text-sm text-[var(--text-primary)] font-mono">{typeof value === "number" ? (value > 0 ? `+${value}` : value) : String(value)}</div>
          </div>
        )) : (
          <p className="text-xs text-[var(--text-ghost)] text-center py-8">No adjustments yet.<br />Start tweaking.</p>
        )}
      </div>

      {!currentTier && (
        <div className="mt-8 p-4 rounded-lg" style={{ border: "1px solid var(--border-accent)" }}>
          <div className="text-2xl mb-2">🔒</div>
          <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-1">Unlock Pro Tools</h4>
          <p className="text-[10px] text-[var(--text-secondary)] mb-3">3-Way wheels, HSL, HDR, grain & more</p>
          <button onClick={onUnlock} className="w-full py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all" style={{ background: "var(--accent-teal)", color: "#181818" }}>
            <Key className="w-3 h-3" />
            Enter Access Key
          </button>
        </div>
      )}
    </>
  );
}
