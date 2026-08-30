"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

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
    // TODO: Send verification email to parent
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageVerified) {
      setStep("age");
      return;
    }
    setLoading(true);
    setError("");

    // Simulate auth (replace with real Firebase calls)
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setError("Connect Firebase credentials to enable authentication");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-sm p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-sm bg-[var(--accent-bronze)] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {step === "age" ? "Age Verification" : step === "parental" ? "Parental Consent" : mode === "signin" ? "Welcome Back" : "Create Account"}
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
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Age Verification Step */}
        {step === "age" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Date of Birth</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm bg-[var(--bg-elevated)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-bronze)] transition-colors"
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              We collect your age to comply with COPPA (Children&apos;s Online Privacy Protection Act),
              GDPR, and India&apos;s DPDP Act. Users under 13 are not permitted. Users aged 13–17 require
              verified parental/guardian consent before payment processing.
            </p>
            <button
              onClick={handleAgeCheck}
              className="w-full py-2.5 rounded-sm bg-[var(--accent-bronze)] text-[var(--bg-deep)] text-sm font-medium hover:bg-[var(--accent-umber)] transition-all"
            >
              Verify Age
            </button>
          </div>
        )}

        {/* Parental Consent Step */}
        {step === "parental" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Parent/Guardian Email</label>
              <input
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm bg-[var(--bg-elevated)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-bronze)] transition-colors"
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              A verification email will be sent to this address. Your parent/guardian must approve
              your account before you can make purchases or upload content.
            </p>
            <button
              onClick={handleParentalConsent}
              className="w-full py-2.5 rounded-sm bg-[var(--accent-bronze)] text-[var(--bg-deep)] text-sm font-medium hover:bg-[var(--accent-umber)] transition-all"
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
                  className="w-full pl-10 pr-3 py-2.5 rounded-sm bg-[var(--bg-elevated)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-bronze)] transition-colors"
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
                className="w-full pl-10 pr-3 py-2.5 rounded-sm bg-[var(--bg-elevated)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-bronze)] transition-colors"
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
                className="w-full pl-10 pr-10 py-2.5 rounded-sm bg-[var(--bg-elevated)] border border-[var(--border-medium)] text-[var(--text-primary)] text-sm placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-bronze)] transition-colors"
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
              className="w-full py-2.5 rounded-sm bg-[var(--accent-bronze)] text-[var(--bg-deep)] text-sm font-medium hover:bg-[var(--accent-umber)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[10px] text-[var(--text-ghost)] uppercase tracking-wider bg-[var(--bg-deep)]">or</span>
              </div>
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full py-2.5 rounded-sm border border-[var(--border-medium)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Toggle mode */}
            <p className="text-center text-xs text-[var(--text-muted)] mt-4">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
                className="text-[var(--accent)] hover:underline"
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
