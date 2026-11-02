"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearLicense,
  LICENSE_CHANGE_EVENT,
  loadLicense,
  saveLicense,
  validateKeyRemote,
  type StoredLicense,
  type KeyValidation,
  type Tier,
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

  const activate = useCallback(async (input: string): Promise<KeyValidation> => {
    const result = await validateKeyRemote(input);
    if (!result.ok || !result.key) return result;
    const tier = result.tier as Exclude<Tier, "basic">;
    saveLicense({
      key: result.key,
      tier,
      issuedAt: result.issuedAt ?? Date.now(),
      expiresAt: result.expiresAt ?? null,
    });
    return result;
  }, []);

  const deactivate = useCallback(() => {
    clearLicense();
  }, []);

  return { license, hydrated, activate, deactivate };
}
