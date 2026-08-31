"use client";

import { useState, useEffect, useCallback } from "react";
import { Cookie, ChevronDown, ChevronUp, Shield, Check } from "lucide-react";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const STORAGE_KEY = "colorgrade-cookie-consent";

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

export function hasConsented(): boolean {
  return getCookiePreferences() !== null;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const existing = getCookiePreferences();
    if (!existing) {
      const timer = setTimeout(() => setVisible(true), 2800);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = useCallback((prefs: typeof preferences) => {
    const data: CookiePreferences = {
      ...prefs,
      necessary: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setVisible(false);
  }, []);

  const handleAcceptAll = () => {
    savePreferences({ necessary: true, analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    savePreferences({ necessary: true, analytics: false, marketing: false });
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] px-4 pb-4 md:px-6 md:pb-6">
      <div
        className="mx-auto max-w-[900px] relative"
        style={{
          background: "var(--glass-bg-heavy)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(0,0,0,0.2)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          animation: "slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-6 right-6 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, var(--accent-teal), transparent)",
            opacity: 0.3,
          }}
        />

        <div className="p-5 md:p-7">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: "rgba(6, 148, 148, 0.08)",
                border: "1px solid rgba(6, 148, 148, 0.12)",
              }}
            >
              <Shield className="w-4 h-4 text-[var(--accent-teal)]" />
            </div>
            <div className="flex-1">
              <h3
                className="text-sm md:text-base text-[var(--text-primary)] mb-1"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Your Privacy Matters
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                We use cookies to enhance your experience and analyze site traffic.
                By clicking &ldquo;Accept All&rdquo;, you consent to our use of cookies.
              </p>
            </div>
          </div>

          {/* Expandable preferences */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4 group"
          >
            <Cookie className="w-3 h-3 text-[var(--accent-teal)] opacity-60 group-hover:opacity-100 transition-opacity" />
            <span className="tracking-wide">
              {expanded ? "Hide" : "Customize"} cookie preferences
            </span>
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {/* Expanded preferences panel */}
          <div
            className="overflow-hidden transition-all duration-300 ease-[var(--ease-smooth)]"
            style={{
              maxHeight: expanded ? "300px" : "0",
              opacity: expanded ? 1 : 0,
            }}
          >
            <div
              className="p-4 mb-4 space-y-3"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {/* Necessary */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[var(--text-primary)]">
                    Strictly Necessary
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Required for the site to function. Cannot be disabled.
                  </div>
                </div>
                <div
                  className="w-9 h-5 rounded-full flex items-center justify-end px-0.5 flex-shrink-0"
                  style={{ background: "var(--accent-teal)", opacity: 0.5 }}
                >
                  <div className="w-4 h-4 rounded-full bg-[var(--bg-deep)] shadow-sm" />
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[var(--text-primary)]">
                    Analytics & Performance
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Help us understand how visitors interact with the site.
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPreferences((p) => ({ ...p, analytics: !p.analytics }))
                  }
                  className="w-9 h-5 rounded-full flex items-center flex-shrink-0 px-0.5 transition-all duration-200"
                  style={{
                    background: preferences.analytics
                      ? "var(--accent-teal)"
                      : "var(--border-medium)",
                    justifyContent: preferences.analytics ? "flex-end" : "flex-start",
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-[var(--bg-deep)] shadow-sm transition-transform duration-200" />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[var(--text-primary)]">
                    Marketing & Advertising
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Used to deliver relevant ads and measure campaign effectiveness.
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPreferences((p) => ({ ...p, marketing: !p.marketing }))
                  }
                  className="w-9 h-5 rounded-full flex items-center flex-shrink-0 px-0.5 transition-all duration-200"
                  style={{
                    background: preferences.marketing
                      ? "var(--accent-teal)"
                      : "var(--border-medium)",
                    justifyContent: preferences.marketing ? "flex-end" : "flex-start",
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-[var(--bg-deep)] shadow-sm transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAcceptAll}
              className="editorial-btn editorial-btn-primary !py-2.5 !px-5 !text-[10px]"
            >
              <Check className="w-3 h-3" />
              Accept All
            </button>
            <button
              onClick={handleRejectAll}
              className="editorial-btn editorial-btn-secondary !py-2.5 !px-5 !text-[10px]"
            >
              Reject All
            </button>
            {expanded && (
              <button
                onClick={handleSaveCustom}
                className="editorial-btn editorial-btn-secondary !py-2.5 !px-5 !text-[10px] !border-[var(--border-accent)]"
              >
                Save Preferences
              </button>
            )}
            <div className="flex-1" />
            <a
              href="/privacy"
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors tracking-wide underline underline-offset-2"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
