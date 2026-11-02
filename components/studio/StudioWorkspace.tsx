"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ImagePlus,
  Undo2,
  Redo2,
  RotateCcw,
  Download,
  KeyRound,
  Columns2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import {
  createStage,
  paintSource,
  renderGrade,
  type Stage,
} from "@/lib/grade/stage";
import { defaultParams, type GradeParams } from "@/lib/grade/params";
import { applyLook, getLook, LOOKS } from "@/lib/grade/looks";
import { parseCube, type CubeLut } from "@/lib/grade/cube";
import { paintSampleFrame } from "@/lib/grade/sample";
import {
  renderExportBlob,
  downloadBlob,
} from "@/lib/grade/export";
import { useLicense } from "@/hooks/useLicense";
import { TIER_LABEL, TIER_MAX_EXPORT, tierRankOf, type Tier } from "@/lib/license";
import { paramsSignature } from "@/lib/grade/params";
import { cn } from "@/lib/cn";
import {
  PrimaryPanel,
  WheelsPanel,
  HslPanel,
  FxPanel,
} from "./Inspector";
import { LooksRail } from "./LooksRail";
import { ExportPanel } from "./ExportPanel";
import { KeyEntryModal } from "./KeyEntryModal";
import { Panel } from "./ui";

const PREVIEW_LONG = 1280;
type Mode = "split" | "graded" | "original";

interface SourceState {
  img: HTMLImageElement | null;
  name: string;
  w: number;
  h: number;
  isSample: boolean;
}

type MobileTab = "looks" | "primary" | "wheels" | "hsl" | "fx";

export function StudioWorkspace() {
  const { license, hydrated } = useLicense();
  const tier: Tier = license?.tier ?? "basic";
  const rank = tierRankOf(license);

  const [source, setSource] = useState<SourceState | null>(null);
  const [params, setParams] = useState<GradeParams>(defaultParams());
  const [mode, setMode] = useState<Mode>("split");
  const [split, setSplit] = useState(50);
  const [cube, setCube] = useState<CubeLut | null>(null);
  const [cubeName, setCubeName] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [tab, setTab] = useState<MobileTab>("primary");

  // history
  const past = useRef<GradeParams[]>([]);
  const future = useRef<GradeParams[]>([]);
  const histTimer = useRef<number | null>(null);
  const [histLen, setHistLen] = useState({ p: 0, f: 0 });

  // stage + canvas for display
  const stageRef = useRef<Stage | null>(null);
  const baseRef = useRef<HTMLCanvasElement>(null);
  const gradedRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef(false);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const cubeRef = useRef(cube);
  cubeRef.current = cube;
  const sourceRef = useRef(source);
  sourceRef.current = source;

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Render pipeline (rAF-coalesced) ───────── */

  const doRender = useCallback(() => {
    rafRef.current = null;
    const stage = stageRef.current;
    if (!stage || !sourceRef.current) return;
    renderGrade(stage, paramsRef.current, { cube: cubeRef.current });
    const gctx = gradedRef.current?.getContext("2d");
    gctx?.drawImage(stage.graded, 0, 0);
  }, []);

  const schedule = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(doRender);
  }, [doRender]);

  useEffect(() => {
    schedule();
  }, [params, cube, schedule]);

  /* ── Source loading ───────────────────────── */

  const buildStageFor = useCallback(
    (src: SourceState): Stage | null => {
      const long = Math.max(src.w, src.h) || 1;
      const scale = Math.min(1, PREVIEW_LONG / long);
      const w = Math.max(2, Math.round(src.w * scale));
      const h = Math.max(2, Math.round(src.h * scale));
      const stage = createStage(w, h);
      if (!stage) return null;
      if (src.img) {
        paintSource(stage, src.img);
      } else {
        // synthetic sample
        stage.sourceCtx.fillStyle = "#0b0b0e";
        stage.sourceCtx.fillRect(0, 0, w, h);
        paintSampleFrame(stage.sourceCtx, w, h);
        stage.sourceData = stage.sourceCtx.getImageData(0, 0, w, h);
        stage.outData = stage.gradedCtx.createImageData(w, h);
      }
      if (baseRef.current) {
        const bctx = baseRef.current.getContext("2d");
        bctx?.clearRect(0, 0, w, h);
        bctx?.drawImage(stage.source, 0, 0);
      }
      stageRef.current = stage;
      // draw bases at new dims
      if (gradedRef.current) {
        const img = gradedRef.current;
        img.width = w;
        img.height = h;
      }
      if (baseRef.current) {
        baseRef.current.width = w;
        baseRef.current.height = h;
      }
      const bctx2 = baseRef.current?.getContext("2d");
      bctx2?.drawImage(stage.source, 0, 0);
      return stage;
    },
    [],
  );

  const pushHistory = useCallback((snap: GradeParams) => {
    const last = past.current[past.current.length - 1];
    if (last && paramsSignature(last) === paramsSignature(snap)) return;
    past.current.push(snap);
    if (past.current.length > 60) past.current.shift();
    future.current = [];
    setHistLen({ p: past.current.length, f: 0 });
  }, [paramsSignature]);

  /* ── Misc actions ─────────────────────────── */

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(paramsRef.current);
    setParams(prev);
    setHistLen({ p: past.current.length, f: future.current.length });
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(paramsRef.current);
    setParams(next);
    setHistLen({ p: past.current.length, f: future.current.length });
  }, []);

  const resetAll = useCallback(() => {
    pushHistory(paramsRef.current);
    setParams(defaultParams());
  }, [pushHistory]);

  const patch = useCallback(
    (p: Partial<GradeParams>) => {
      const prev = paramsRef.current;
      const next: GradeParams = { ...prev, ...p };
      if (p.hsl) next.hsl = p.hsl;
      if (rank < 3) {
        next.filmGrain = 0;
        next.halation = 0;
        next.bloom = 0;
        next.hdr = 0;
        next.highlightRecovery = 0;
      }
      pushHistory(prev);
      setParams(next);
    },
    [pushHistory, rank],
  );

  const loadSource = useCallback(
    (file: File) => {
      if (file.type && !file.type.startsWith("image/")) {
        setStatus({ kind: "err", msg: "Drop an image file (PNG / JPEG / WEBP)." });
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const src: SourceState = {
          img,
          name: file.name,
          w: img.naturalWidth || img.width,
          h: img.naturalHeight || img.height,
          isSample: false,
        };
        setSource(src);
        setParams(defaultParams());
        past.current = [];
        future.current = [];
        setHistLen({ p: 0, f: 0 });
        buildStageFor(src);
        schedule();
        setStatus({ kind: "ok", msg: `${file.name} loaded — grade away.` });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setStatus({ kind: "err", msg: "That image could not be decoded." });
      };
      img.src = url;
    },
    [buildStageFor, schedule],
  );

  const loadSample = useCallback(() => {
    const src: SourceState = {
      img: null,
      name: "Sample — synthetic dusk",
      w: 1920,
      h: 1080,
      isSample: true,
    };
    setSource(src);
    setParams(defaultParams());
    past.current = [];
    future.current = [];
    setHistLen({ p: 0, f: 0 });
    const stage = buildStageFor(src);
    if (!stage) return;
    schedule();
  }, [buildStageFor, schedule]);

  /* Initial: paint the synthetic frame immediately so Studio is never empty */
  useEffect(() => {
    loadSample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Demo-paint after source set (cover the graded path once) */
  useEffect(() => {
    if (!source) return;
    paintSourceIntoDisplay(source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const paintSourceIntoDisplay = useCallback((s: SourceState | null) => {
    const stage = stageRef.current;
    if (!stage || !s) return;
    if (baseRef.current) {
      baseRef.current.width = stage.w;
      baseRef.current.height = stage.h;
      const bctx = baseRef.current.getContext("2d");
      bctx?.drawImage(stage.source, 0, 0);
    }
  }, []);

  /* ── Misc actions ─────────────────────────── */


  const pickLook = useCallback(
    (id: string) => {
      const look = getLook(id);
      if (!look) return;
      pushHistory(paramsRef.current);
      const next = defaultParams();
      applyLook(next, look, paramsRef.current.lookIntensity / 100);
      setParams(next);
    },
    [pushHistory],
  );

  const intensity = useCallback(
    (v: number) => {
      const lookId = paramsRef.current.look;
      patch({ lookIntensity: v });
      if (!lookId) return;
      const look = getLook(lookId);
      if (!look) return;
      const next = defaultParams();
      applyLook(next, look, v / 100);
      setParams(next);
    },
    [patch],
  );

  const importCube = useCallback(
    (file: File) => {
      void file.text().then((text) => {
        const res = parseCube(text);
        if (!res.ok || !res.cube) {
          setStatus({ kind: "err", msg: res.error ?? "Cube parse failed." });
          return;
        }
        setCube(res.cube);
        setCubeName(res.cube.title || file.name);
        setStatus({ kind: "ok", msg: `3D LUT "${res.cube.title}" mounted.` });
      });
    },
    [],
  );

  const runExport = useCallback(
    async (t: { format: "png" | "jpeg"; quality: number; maxLongEdge: number }) => {
      const src = sourceRef.current;
      if (!src) throw new Error("No source frame loaded.");
      let renderable: HTMLImageElement | HTMLCanvasElement | null = src.img;
      if (!renderable) {
        // synthetic sample → rasterize a full-res sample stage
        const full = createStage(1920, 1080);
        if (full) {
          full.sourceCtx.fillStyle = "#0b0b0e";
          full.sourceCtx.fillRect(0, 0, 1920, 1080);
          paintSampleFrame(full.sourceCtx, 1920, 1080);
          renderable = full.source;
        }
      }
      if (!renderable) throw new Error("No renderable source.");
      const { blob, filename } = await renderExportBlob({
        img: renderable,
        params: paramsRef.current,
        cube: cubeRef.current,
        format: t.format,
        quality: t.quality,
        maxLongEdge: Math.min(t.maxLongEdge, TIER_MAX_EXPORT[tier] ?? 1920),
        filenameBase: "effectcraft",
      });
      downloadBlob(blob, filename);
    },
    [tier],
  );

  /* Keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if ((e.key === "z" || e.key === "Z") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "e" || e.key === "E") {
        if (sourceRef.current) setExportOpen(true);
      } else if (e.key === "b" || e.key === "B") {
        setMode((m) =>
          m === "split" ? "graded" : m === "graded" ? "original" : "split",
        );
      } else if (e.key === "r" || e.key === "R") {
        resetAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, resetAll]);

  const clipStyle =
    mode === "split"
      ? { clipPath: `inset(0 0 0 ${split}%)` }
      : mode === "graded"
        ? undefined
        : { opacity: 0 };

  const previewLong = source ? Math.max(source.w, source.h) : 1;
  const previewScale = Math.min(1, PREVIEW_LONG / previewLong);
  const dispW = source ? Math.round(source.w * previewScale) : 0;
  const dispH = source ? Math.round(source.h * previewScale) : 0;

  return (
    <div className="pt-14 min-h-screen flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadSource(f);
          e.target.value = "";
        }}
      />

      {/* ── Top bar ── */}
      <div className="h-12 shrink-0 border-b border-line flex items-center justify-between px-4 md:px-6 gap-3 bg-bg/80 backdrop-blur-xl fixed top-0 inset-x-0 z-40">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="text-ink-muted hover:text-ink shrink-0" aria-label="Back to platform">
            <ArrowLeft className="size-4" />
          </Link>
          <span className="mono-label !text-[10px] shrink-0">STUDIO</span>
          {source ? (
            <span className="hidden md:block mono-num text-[11px] text-ink-faint truncate max-w-[220px]">
              {source.name} — {source.w}×{source.h}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex rounded-lg border border-line overflow-hidden">
            {(
              [
                ["original", EyeOff, "Original"],
                ["split", Columns2, "Split"],
                ["graded", Eye, "Graded"],
              ] as [Mode, typeof Eye, string][]
            ).map(([m, Icon, label]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                title={`${label} (B)`}
                className={cn(
                  "px-3 py-2 flex items-center gap-1.5 text-[12px]",
                  mode === m ? "bg-bronze/15 text-bronze-bright" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
          <button onClick={undo} disabled={histLen.p === 0} className="p-2 text-ink-muted disabled:opacity-30 hover:text-ink" title="Undo (⌘Z)">
            <Undo2 className="size-4" />
          </button>
          <button onClick={redo} disabled={histLen.f === 0} className="p-2 text-ink-muted disabled:opacity-30 hover:text-ink" title="Redo (⌘⇧Z)">
            <Redo2 className="size-4" />
          </button>
          <button onClick={resetAll} className="p-2 text-ink-muted hover:text-ink" title="Reset (R)">
            <RotateCcw className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setKeyOpen(true)}
            className={cn(
              "pill-badge !py-1.5 !px-3 !text-[9px] hover:border-bronze/40 transition-colors",
              hydrated && license ? "border-bronze/40 text-bronze-bright" : "",
            )}
          >
            <KeyRound className="size-3" />
            {hydrated && license ? TIER_LABEL[license.tier] : "Free — add key"}
          </button>
          <button
            onClick={() => source && setExportOpen(true)}
            disabled={!source}
            className="btn-primary !py-2 !px-4 text-[13px] gap-2 hidden sm:inline-flex disabled:opacity-40"
          >
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 lg:grid lg:grid-cols-[260px_1fr_330px] min-h-[calc(100vh-7rem)]">
        {/* Left rail */}
        <aside className="hidden lg:block border-r border-line overflow-y-auto max-h-[calc(100vh-7rem)]">
          <LooksRail
            activeLook={params.look}
            lookIntensity={params.lookIntensity}
            onSelect={pickLook}
            onIntensity={intensity}
            tier={tier}
          />
        </aside>

        {/* Canvas */}
        <div
          className="relative flex flex-col"
          onDragOver={(e: DragEvent) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e: DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) loadSource(f);
          }}
        >
          {status ? (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
              <button
                onClick={() => setStatus(null)}
                className={cn(
                  "mono-num text-[11px] px-4 py-2 rounded-lg border backdrop-blur-md",
                  status.kind === "ok"
                    ? "border-[#68c96a]/40 bg-[#68c96a]/10 text-[#68c96a]"
                    : "border-[#f05545]/40 bg-[#f05545]/10 text-[#f05545]",
                )}
              >
                {status.msg} — dismiss
              </button>
            </div>
          ) : null}

          <div className="flex-1 grid place-items-center p-4 md:p-8">
            <div
              className={cn(
                "relative w-full rounded-2xl border bg-bg-raised overflow-hidden transition-colors",
                dragOver ? "border-bronze/60" : "border-line",
                "shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)]",
              )}
              style={{ aspectRatio: dispW && dispH ? `${dispW} / ${dispH}` : "16 / 9" }}
            >
              {source ? (
                <>
                  <canvas
                    ref={baseRef}
                    width={dispW}
                    height={dispH}
                    className="absolute inset-0 w-full h-full block"
                  />
                  <canvas
                    ref={gradedRef}
                    width={dispW}
                    height={dispH}
                    className="absolute inset-0 w-full h-full block"
                    style={{ ...clipStyle, transition: "clip-path 160ms ease" }}
                  />
                  {mode === "split" ? (
                    <>
                      <div
                        className="absolute top-0 bottom-0 w-px"
                        style={{
                          left: `${split}%`,
                          background:
                            "linear-gradient(to bottom, transparent, rgba(232,207,162,0.9), transparent)",
                          boxShadow: "0 0 18px rgba(232,207,162,0.5)",
                        }}
                      >
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-8 rounded-full border border-bronze-bright/60 bg-black/60 backdrop-blur grid place-items-center"
                          style={{ left: "50%" }}
                        >
                          <Columns2 className="size-3.5 text-bronze-bright" />
                        </div>
                      </div>
                      <span className="absolute left-3 bottom-3 pill-badge !bg-black/50 !text-[8px]">
                        ORIG
                      </span>
                      <span className="absolute right-3 bottom-3 pill-badge !bg-black/50 !text-[8px] !text-bronze-bright">
                        GRADED
                      </span>
                    </>
                  ) : null}
                  {/* split drag surface */}
                  <div
                    className={cn("absolute inset-0", mode === "split" && "cursor-ew-resize")}
                    onPointerDown={(e) => {
                      if (mode !== "split") return;
                      e.currentTarget.setPointerCapture(e.pointerId);
                      dragRef.current = true;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setSplit(Math.min(95, Math.max(5, ((e.clientX - rect.left) / rect.width) * 100)));
                    }}
                    onPointerMove={(e) => {
                      if (!dragRef.current) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setSplit(Math.min(95, Math.max(5, ((e.clientX - rect.left) / rect.width) * 100)));
                    }}
                    onPointerUp={() => { dragRef.current = false; }}
                    onPointerCancel={() => { dragRef.current = false; }}
                    title={mode === "split" ? "Drag to compare" : undefined}
                  />
                </>
              ) : (
                <div className="absolute inset-0 grid place-items-center p-8">
                  <div className="text-center max-w-sm">
                    <ImagePlus className="size-8 text-bronze-bright mx-auto" strokeWidth={1.5} />
                    <p className="display text-xl mt-4">Drop a frame anywhere</p>
                    <p className="mono-label mt-2 !text-[9px]">
                      PNG · JPEG · WEBP — OR START WITH THE SAMPLE
                    </p>
                    <div className="flex gap-2 justify-center mt-6">
                      <button onClick={() => fileInputRef.current?.click()} className="btn-primary !py-2.5 !px-5 text-[13px]">
                        Open image
                      </button>
                      <button onClick={loadSample} className="btn-ghost !py-2.5 !px-5 text-[13px]">
                        Sample frame
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* status bar */}
          <div className="shrink-0 border-t border-line px-4 md:px-6 h-9 flex items-center justify-between">
            <span className="mono-label !text-[9px]">
              {LOOKS.find((l) => l.id === params.look)?.name ?? "No look"} · SEED 11
            </span>
            <div className="flex items-center gap-3">
              <span className="mono-label !text-[9px] hidden sm:block">
                B SPLIT · E EXPORT · ⌘Z UNDO
              </span>
              <span className="mono-label !text-[9px] text-bronze-bright">
                MAX {(TIER_MAX_EXPORT[tier] ?? 1920) >= 7680 ? "SOURCE" : `${TIER_MAX_EXPORT[tier] ?? 1920}PX`}
              </span>
              <button onClick={() => setExportOpen(true)} disabled={!source} className="sm:hidden p-1 text-bronze-bright disabled:opacity-40">
                <Download className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right rail (desktop) */}
        <aside className="hidden lg:block border-l border-line overflow-y-auto max-h-[calc(100vh-7rem)]">
          <PrimaryPanel params={params} patch={patch} />
          <WheelsPanel params={params} patch={patch} hasKey={rank >= 2} />
          <HslPanel params={params} patch={patch} hasKey={rank >= 2} />
          <FxPanel
            params={params}
            patch={patch}
            tier={tier}
            hasKey={rank >= 2}
            cubeName={cubeName}
            onCubeFile={importCube}
            clearCube={() => {
              setCube(null);
              setCubeName(null);
            }}
          />
          <div className="px-5 py-5">
            <button onClick={() => setKeyOpen(true)} className="btn-ghost w-full justify-center !py-2.5 text-[13px] gap-2">
              <Sparkles className="size-4 text-bronze-bright" />
              Manage key
            </button>
          </div>
        </aside>

        {/* Mobile panel tabs */}
        <div className="lg:hidden border-t border-line">
          <div className="flex overflow-x-auto">
            {(
              [
                ["looks", "Looks"],
                ["primary", "Primary"],
                ["wheels", "Wheels"],
                ["hsl", "HSL"],
                ["fx", "FX"],
              ] as [MobileTab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "shrink-0 px-5 py-3 text-[12px] border-b-2",
                  tab === id ? "border-bronze text-ink" : "border-transparent text-ink-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="max-h-[52vh] overflow-y-auto">
            {tab === "looks" ? (
              <LooksRail
                activeLook={params.look}
                lookIntensity={params.lookIntensity}
                onSelect={pickLook}
                onIntensity={intensity}
                tier={tier}
              />
            ) : null}
            {tab === "primary" ? <PrimaryPanel params={params} patch={patch} /> : null}
            {tab === "wheels" ? <WheelsPanel params={params} patch={patch} hasKey={rank >= 2} /> : null}
            {tab === "hsl" ? <HslPanel params={params} patch={patch} hasKey={rank >= 2} /> : null}
            {tab === "fx" ? (
              <FxPanel
                params={params}
                patch={patch}
                tier={tier}
                hasKey={rank >= 2}
                cubeName={cubeName}
                onCubeFile={importCube}
                clearCube={() => {
                  setCube(null);
                  setCubeName(null);
                }}
              />
            ) : null}
            {tab === "fx" ? (
              <Panel title="Key">
                <button onClick={() => setKeyOpen(true)} className="btn-ghost w-full justify-center !py-2.5 text-[13px] gap-2">
                  <Sparkles className="size-4 text-bronze-bright" />
                  {hydrated && license ? `${TIER_LABEL[license.tier]} active — manage` : "Add a key"}
                </button>
              </Panel>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {exportOpen && source ? (
        <ExportPanel
          sourceDims={{ w: source.w, h: source.h }}
          tier={tier}
          onClose={() => setExportOpen(false)}
          onExport={runExport}
        />
      ) : null}
      {keyOpen ? <KeyEntryModal onClose={() => setKeyOpen(false)} /> : null}
    </div>
  );
}
