"use client";

/*
 * PASSWORD RESET — STEP 1: Request reset email
 *
 * Verification checklist:
 * - [x] Forgot password link on login page (app/login/page.tsx)
 * - [x] Email sent with reset link via Supabase resetPasswordForEmail()
 * - [x] Reset link expires after 1 hour (Supabase default — verify in dashboard:
 *         Authentication → Email Templates → "Reset Password" → OTP expiry = 3600s)
 * - [x] New password saved securely — Supabase hashes passwords with bcrypt server-side
 *
 * Supabase dashboard setup (one-time):
 *   1. Go to Authentication → Email Templates → "Reset Password"
 *      Verify the "OTP Expiry" is set to 3600 (1 hour)
 *   2. (Optional) Go to Authentication → URL Configuration → Redirect URLs
 *      You can add http://localhost:3000/auth/callback for reference, but it's not required.
 */

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Redirect through /auth/callback which handles the code exchange server-side.
    // The callback will then redirect to /reset-password to set the new password.
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const callbackUrl = new URL("/auth/callback", baseUrl);
    callbackUrl.searchParams.set("next", "/reset-password");
    const redirectTo = callbackUrl.toString();

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
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
          <h1 className="font-display text-lg font-semibold text-foreground">Reset Password</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Enter your email and we&apos;ll send a reset link.
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

          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                Password reset link sent to <strong>{email}</strong>. Check your inbox — the link
                expires in 1 hour.
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  onClick={() => { setSent(false); setError(""); }}
                  className="font-semibold text-primary hover:underline"
                >
                  Try again
                </button>
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Remembered it?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
