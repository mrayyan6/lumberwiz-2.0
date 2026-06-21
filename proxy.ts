import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Global auth proxy (Next.js 16's replacement for middleware.ts).
 *
 *  1. Validates + refreshes the Supabase session on every request, writing
 *     refreshed cookies to the response. This also clears stale/invalid refresh
 *     tokens before they reach the client ("Invalid Refresh Token" console error).
 *
 *  2. Server-side gate: blocks UNAUTHENTICATED access to any /admin route and
 *     redirects to /login. The admin ROLE check (admin vs. customer) is enforced
 *     in app/admin/layout.tsx, which can query the profiles table.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() validates the JWT with the auth server (not just the cookie)
  // and refreshes the session. Do not remove.
  const { data: { user } } = await supabase.auth.getUser();

  // Require authentication for the admin area (role is checked in the admin layout)
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
