import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Set New Password — Lumberwiz",
  description: "Choose a new password for your Lumberwiz account.",
  robots: "noindex",
};

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
