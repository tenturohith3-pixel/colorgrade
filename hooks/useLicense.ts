"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildLicense,
  clearLicense,
  LICENSE_CHANGE_EVENT,
  loadLicense,
  saveLicense,
  validateKey,
  type StoredLicense,
  type KeyValidation,
} from "@/lib/license";

export function useLicense() {
  const [license, setLicense] = useState<StoredLicense | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => {
      setLicense(loadLicense());
      setHydrated(true);
    };
    sync();
    window.addEventListener(LICENSE_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(LICENSE_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const activate = useCallback((input: string): KeyValidation => {
    const result = validateKey(input);
    if (!result.ok || !result.key) return result;
    const tier = result.tier as Exclude<StoredLicense["tier"], "basic">;
    saveLicense(buildLicense(tier, result.key));
    return result;
  }, []);

  const deactivate = useCallback(() => {
    clearLicense();
  }, []);

  return { license, hydrated, activate, deactivate };
}
