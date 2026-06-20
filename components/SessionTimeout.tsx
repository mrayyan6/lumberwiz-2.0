"use client";

/*
 * Idle session timeout.
 *
 * While a user is logged in, any inactivity for IDLE_LIMIT (30 min) forces a real
 * logout via supabase.auth.signOut() — which invalidates the session, not just the UI.
 * A warning modal appears WARNING_BEFORE (2 min) before the deadline with a live
 * countdown and a "Stay logged in" button that resets the timer.
 *
 * Activity (mouse / keyboard / scroll / touch) resets the timers, but only while the
 * warning is NOT showing — once the warning is up, the user must explicitly choose.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase-browser";

const IDLE_LIMIT_MS = 30 * 60 * 1000;     // 30 minutes total
const WARNING_BEFORE_MS = 2 * 60 * 1000;  // warn 2 minutes before logout
const WARNING_SECONDS = Math.floor(WARNING_BEFORE_MS / 1000);

export default function SessionTimeout() {
  const router = useRouter();
  // Create the client once so callback identities stay stable.
  const [supabase] = useState(() => createClient());

  const [loggedIn, setLoggedIn] = useState(false);
  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_SECONDS);

  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdown = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningRef = useRef(false);
  useEffect(() => { warningRef.current = warning; }, [warning]);

  const clearTimers = useCallback(() => {
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (countdown.current) clearInterval(countdown.current);
    warnTimer.current = null;
    logoutTimer.current = null;
    countdown.current = null;
  }, []);

  const doLogout = useCallback(async () => {
    clearTimers();
    setWarning(false);
    await supabase.auth.signOut();   // invalidates the session for real
    setLoggedIn(false);
    router.replace("/login");
  }, [clearTimers, router, supabase]);

  const startTimers = useCallback(() => {
    clearTimers();
    setWarning(false);
    warnTimer.current = setTimeout(() => {
      setWarning(true);
      setSecondsLeft(WARNING_SECONDS);
      countdown.current = setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }, IDLE_LIMIT_MS - WARNING_BEFORE_MS);
    logoutTimer.current = setTimeout(doLogout, IDLE_LIMIT_MS);
  }, [clearTimers, doLogout]);

  // Track auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) =>
      setLoggedIn(!!session)
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Start/stop idle tracking based on login state
  useEffect(() => {
    if (!loggedIn) {
      clearTimers();
      setWarning(false);
      return;
    }

    startTimers();

    const onActivity = () => {
      // Don't silently reset once the warning is showing — require an explicit choice.
      if (!warningRef.current) startTimers();
    };
    const events: (keyof WindowEventMap)[] = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearTimers();
    };
  }, [loggedIn, startTimers, clearTimers]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(1, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <AnimatePresence>
      {warning && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            role="alertdialog"
            aria-modal="true"
            className="fixed left-1/2 top-1/2 z-[81] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 text-center shadow-2xl"
          >
            <h3 className="font-display text-lg font-semibold text-foreground">
              Still there?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You&apos;ve been inactive for a while. For your security you&apos;ll be signed out in{" "}
              <span className="font-semibold text-foreground">{mm}:{ss}</span>.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={doLogout}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Log out now
              </button>
              <button
                onClick={startTimers}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
              >
                Stay logged in
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
