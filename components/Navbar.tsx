"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { categories } from "@/data/products";

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/logo.jpeg" alt="LumberWiz" className="h-10 w-10 rounded-md border border-border object-contain" />
          <span className="font-display text-xl font-bold text-foreground">LumberWiz</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Home</Link>
          {categories.map(cat => (
            <Link key={cat} href={`/category/${encodeURIComponent(cat)}`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {cat}
            </Link>
          ))}
          <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">About</Link>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-foreground hover:text-primary transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 md:hidden text-foreground">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-foreground">Home</Link>
            {categories.map(cat => (
              <Link key={cat} href={`/category/${encodeURIComponent(cat)}`} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground">
                {cat}
              </Link>
            ))}
            <Link href="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground">About</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
