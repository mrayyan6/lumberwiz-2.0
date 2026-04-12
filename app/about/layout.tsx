import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Us — Lumberwiz",
  description:
    "Learn about Lumberwiz, our story, and our commitment to quality timber and wood products in Pakistan.",
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
