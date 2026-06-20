import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Write a Review — Lumberwiz",
  description: "Share your experience with a Lumberwiz product.",
};

export default function WriteReviewLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
