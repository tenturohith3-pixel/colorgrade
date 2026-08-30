"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

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

  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setState({
        user,
        loading: false,
        isTrialActive: true,
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
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    refresh();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setState({
            user: session.user,
            loading: false,
            isTrialActive: true,
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
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, refresh]);

  return { ...state, refresh };
}
