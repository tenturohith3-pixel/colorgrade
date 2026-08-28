"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthChange, type User } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  isTrialActive: boolean;
  trialEndsAt: Date | null;
  tokensRemaining: number;
  plan: "free" | "trial" | "basic" | "pro";
}

export function useAuth(): AuthState & { refresh: () => void } {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isTrialActive: false,
    trialEndsAt: null,
    tokensRemaining: 0,
    plan: "free",
  });

  const refresh = useCallback(() => {
    // Re-fetch user data from API
    setState((prev) => ({ ...prev }));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        // In production, fetch user profile from API
        setState({
          user,
          loading: false,
          isTrialActive: true, // TODO: Check from API
          trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          tokensRemaining: 3,
          plan: "trial",
        });
      } else {
        setState({
          user: null,
          loading: false,
          isTrialActive: false,
          trialEndsAt: null,
          tokensRemaining: 0,
          plan: "free",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return { ...state, refresh };
}
