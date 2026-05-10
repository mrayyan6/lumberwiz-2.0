import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Route handler for Supabase PKCE callback.
 *
 * Supabase redirects here with ?code=xxx after:
 *   - Password reset email link clicked
 *   - OAuth flow completes
 *   - Any other auth flow that uses PKCE
 *
 * This handler:
 *   1. Exchanges the code for a session SERVER-SIDE (no client-side storage issues)
 *   2. Sets the session in cookies via the response
 *   3. Redirects to the ?next= page (or /reset-password for password reset)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/reset-password";

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/forgot-password?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  // Redirect to the destination page (session is now in cookies)
  return NextResponse.redirect(new URL(next, request.url));
}
