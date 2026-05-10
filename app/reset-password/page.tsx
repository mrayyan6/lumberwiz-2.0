"use client";

/*
 * PASSWORD RESET — STEP 2: Set new password
 *
 * Flow:
 *   1. User clicks the reset link in their email.
 *   2. Email link goes to /auth/callback?code=<pkce_code>&next=/reset-password
 *   3. The route handler (/auth/callback/route.ts) exchanges the code server-side.
 *   4. It redirects back to /reset-password (without code, session now in cookies).
 *   5. This page detects a valid session and shows the password form.
 *   6. User sets a new password → updateUser({ password }) commits it.
 *   7. Redirect to /login?reset=success.
 *
 * Password requirements (must match rubric):
 *   - Minimum 8 characters
 *   - At least one uppercase letter
 *   - At least one number
 *
 * Token expiry: Supabase's default OTP / recovery code TTL is 1 hour.
 * Confirm in dashboard: Authentication → Email Templates → Reset Password → OTP Expiry = 3600
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

type Stage = "verifying" | "ready" | "invalid";

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must include at least one uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must include at least one number.";
  return null;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [stage, setStage] = useState<Stage>("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    // If there's a code, redirect to the server-side callback handler to exchange it
    if (code) {
      window.location.href = `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent("/reset-password")}`;
      return;
    }

    // If there's an error (from the callback handler), display it
    if (error) {
      setError(`Unable to verify reset link: ${error}. Please request a new one.`);
      setStage("invalid");
      return;
    }

    // Check if a session exists (user was redirected back from /auth/callback after code exchange)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStage("ready");
      } else {
        setError(
          "No reset token found. Make sure you clicked the link from your password reset email."
        );
        setStage("invalid");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validatePassword(password);
    if (validationError) { setError(validationError); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Sign out so the user logs in fresh with the new password
    await supabase.auth.signOut();
    router.push("/login?reset=success");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="border-b border-border px-6 py-4">
          <h1 className="font-display text-lg font-semibold text-foreground">Set New Password</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {stage === "verifying" && !error && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Verifying reset link…
            </p>
          )}

          {stage === "invalid" && (
            <p className="text-center text-sm text-muted-foreground">
              <a href="/forgot-password" className="font-semibold text-primary hover:underline">
                Request a new reset link
              </a>
            </p>
          )}

          {stage === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  At least 8 characters, one uppercase letter, one number.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Repeat your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Saving…" : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
