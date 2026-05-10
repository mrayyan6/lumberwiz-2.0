import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Forgot Password — Lumberwiz",
  description: "Reset your Lumberwiz account password.",
  robots: "noindex",
};

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
