/**
 * User settings — persisted in this browser.
 *  motion   — marketing pages: momentum smooth-scroll on / off
 *  preview  — Studio preview quality (canvas long edge in px)
 */

export type MotionPref = "smooth" | "off";
export type PreviewQuality = "fast" | "balanced" | "sharp";

export interface ECSettings {
  motion: MotionPref;
  preview: PreviewQuality;
}

export const PREVIEW_LONG_MAP: Record<PreviewQuality, number> = {
  fast: 960,
  balanced: 1280,
  sharp: 1600,
};

const KEY = "ec:settings";
const EVENT = "ec:settings-changed";
export const SETTINGS_EVENT = EVENT;

const DEFAULTS: ECSettings = { motion: "smooth", preview: "balanced" };

export function loadSettings(): ECSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ECSettings>;
    return {
      motion: parsed.motion === "off" ? "off" : "smooth",
      preview:
        parsed.preview === "fast" || parsed.preview === "sharp"
          ? parsed.preview
          : "balanced",
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(patch: Partial<ECSettings>): ECSettings {
  const next = { ...loadSettings(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage disabled — settings just won't persist */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
  return next;
}
