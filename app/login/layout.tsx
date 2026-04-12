import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Login — Lumberwiz",
  description: "Sign in to your Lumberwiz account to place orders and manage your profile.",
  robots: "noindex",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
