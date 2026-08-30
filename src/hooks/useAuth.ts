"use client";

import { useState, useEffect, useCallback } from "react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  plan: string;
  clips_remaining: number;
  age_verified: number;
  created_at: string;
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isTrialActive: boolean;
  trialEndsAt: Date | null;
  tokensRemaining: number;
  plan: string;
}

export function useAuth(): AuthState & {
  signUp: (email: string, password: string, fullName?: string, birthDate?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isTrialActive: false,
    trialEndsAt: null,
    tokensRemaining: 0,
    plan: "free",
  });

  const updateUserState = useCallback((user: UserProfile | null) => {
    if (user) {
      setState({
        user,
        loading: false,
        isTrialActive: user.plan === "trial",
        trialEndsAt: null,
        tokensRemaining: user.clips_remaining,
        plan: user.plan,
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
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      updateUserState(data.user);
    } catch {
      updateUserState(null);
    }
  }, [updateUserState]);

  const signUp = useCallback(async (email: string, password: string, fullName?: string, birthDate?: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signup", email, password, fullName, birthDate }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error };
    }

    updateUserState(data.user);
    return { success: true };
  }, [updateUserState]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signin", email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error };
    }

    updateUserState(data.user);
    return { success: true };
  }, [updateUserState]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signout" }),
    });
    updateUserState(null);
  }, [updateUserState]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, signUp, signIn, signOut, refresh };
}
