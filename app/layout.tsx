import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumber Wiz",
  description: "Handcrafted pieces that bring warmth, texture, and timeless beauty to your space.",
  icons: {
    icon: "/images/logo.jpeg?v=20260320",
    shortcut: "/images/logo.jpeg?v=20260320",
    apple: "/images/logo.jpeg?v=20260320",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <Navbar />
          <CartDrawer />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
