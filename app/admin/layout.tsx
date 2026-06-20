import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  robots: "noindex",
};

/**
 * Server-side authorization gate for the entire /admin area (including /admin/reviews).
 *
 * This runs on the server BEFORE any admin page renders, so it cannot be bypassed
 * by disabling JavaScript or editing client state. The client-side useEffect checks
 * inside the admin pages remain as defense-in-depth, but this is the real gate.
 *
 * Note: getUser() validates the JWT against the auth server; getSession() alone
 * would only read the cookie and is not trusted for authorization.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  return <>{children}</>;
}
