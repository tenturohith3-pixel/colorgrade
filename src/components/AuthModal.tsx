"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "signin" | "signup";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ageVerified, setAgeVerified] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [needsParentalConsent, setNeedsParentalConsent] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [step, setStep] = useState<"form" | "age" | "parental">("form");

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const calculateAge = (dob: string): number => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleAgeCheck = () => {
    if (!birthDate) {
      setError("Please enter your date of birth");
      return;
    }
    const age = calculateAge(birthDate);
    if (age < 13) {
      setError("You must be at least 13 years old to use ColorGrade (COPPA compliance)");
      return;
    }
    if (age < 18) {
      setNeedsParentalConsent(true);
      setStep("parental");
      setError("");
    } else {
      setAgeVerified(true);
      setStep("form");
      setError("");
    }
  };

  const handleParentalConsent = () => {
    if (!parentEmail) {
      setError("Please enter a parent/guardian email");
      return;
    }
    setAgeVerified(true);
    setStep("form");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageVerified) {
      setStep("age");
      return;
    }
    setLoading(true);
    setError("");

    let result;
    if (mode === "signup") {
      result = await signUp(email, password, name, birthDate);
    } else {
      result = await signIn(email, password);
    }

    if (!result.success) {
      setError(result.error || "Authentication failed");
    } else {
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-xl p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-teal)] flex items-center justify-center mx-auto mb-3">
            <span
              className="text-lg text-[var(--bg-deep)]"
              style={{ fontFamily: "var(--font-space), Georgia, serif" }}
            >
              CG
            </span>
          </div>
          <h2
            className="text-xl text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-space), Georgia, serif" }}
          >
            {step === "age"
              ? "Age Verification"
              : step === "parental"
              ? "Parental Consent"
              : mode === "signin"
              ? "Welcome Back"
              : "Create Account"}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {step === "age"
              ? "Required for COPPA/GDPR/DPDP compliance"
              : step === "parental"
              ? "Users under 18 require guardian approval"
              : mode === "signin"
              ? "Sign in to access your color grading studio"
              : "Start your 3-day free trial — no credit card needed"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Age Verification Step */}
        {step === "age" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">
                Date of Birth
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              We collect your age to comply with COPPA, GDPR, and India&apos;s DPDP Act.
            </p>
            <button
              onClick={handleAgeCheck}
              className="w-full py-2.5 rounded-xl bg-[var(--accent-teal)] text-[var(--bg-deep)] text-sm font-medium hover:bg-[var(--accent-teal-dark)] transition-all"
            >
              Verify Age
            </button>
          </div>
        )}

        {/* Parental Consent Step */}
        {step === "parental" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">
                Parent/Guardian Email
              </label>
              <input
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-deep)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              A verification email will be sent to this address.
            </p>
            <button
              onClick={handleParentalConsent}
              className="w-full py-2.5 rounded-xl bg-[var(--accent-teal)] text-[var(--bg-deep)] text-sm font-medium hover:bg-[var(--accent-teal-dark)] transition-all"
            >
              Send Consent Request
            </button>
            <button
              onClick={() => { setStep("age"); setError(""); }}
              className="w-full py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Auth Form */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name (signup only) */}
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-ghost)]" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[var(--bg-deep)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-ghost)]" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[var(--bg-deep)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-ghost)]" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-deep)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-ghost)] hover:text-[var(--text-muted)]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[var(--accent-teal)] text-[var(--bg-deep)] text-sm font-medium hover:bg-[var(--accent-teal-dark)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account & Start Trial"
              )}
            </button>

            {/* Toggle mode */}
            <p className="text-center text-xs text-[var(--text-muted)] mt-4">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
                className="text-[var(--accent-teal)] hover:underline"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
