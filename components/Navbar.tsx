"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAdmin } from "@/context/AdminContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase-browser";
import { fetchCategories } from "@/lib/products";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { isAdmin, openAdd } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navCategories, setNavCategories] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch categories for nav links
  useEffect(() => {
    fetchCategories().then(setNavCategories);
  }, []);

  // Fetch session + profile name on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfileName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();
    if (data) setProfileName(data.name || null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.refresh();
  }

  const displayName = profileName || user?.email?.split("@")[0] || "Account";

  const navLinks = [
    { href: "/", label: "Home" },
    ...navCategories.map((cat) => ({ href: `/category/${encodeURIComponent(cat)}`, label: cat })),
    { href: "/about", label: "About" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <img
            src="/images/logo.jpeg"
            alt="LumberWiz"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
            className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-display text-xl font-bold text-foreground">LumberWiz</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative pb-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground
                after:absolute after:bottom-0 after:left-0 after:h-px after:w-full
                after:origin-left after:scale-x-0 after:bg-foreground
                after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Auth button */}
          {user ? (
            <div className="relative">
              <motion.button
                onClick={() => setUserMenuOpen((v) => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <User className="h-4 w-4 text-primary" />
                <span className="max-w-[120px] truncate">{displayName}</span>
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                  >
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                        >
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                          Admin Dashboard
                        </Link>
                        <button
                          onClick={() => { openAdd(); setUserMenuOpen(false); }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                        >
                          <Plus className="h-4 w-4 text-primary" />
                          Add Product
                        </button>
                        <div className="mx-4 border-t border-border" />
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                    >
                      <LogOut className="h-4 w-4 text-muted-foreground" />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <User className="h-4 w-4" />
              Login
            </Link>
          )}

          {/* Cart button */}
          <motion.button
            onClick={() => setIsCartOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            className="relative p-2 text-foreground hover:text-primary transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={menuOpen ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <motion.div
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.045 } },
              }}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-1 px-4 py-4"
            >
              {navLinks.map(({ href, label }) => (
                <motion.div
                  key={href}
                  variants={{
                    hidden: { opacity: 0, x: -14 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.22 } },
                  }}
                >
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile auth */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -14 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.22 } },
                }}
                className="mt-2 border-t border-border pt-3"
              >
                {user ? (
                  <div className="space-y-1">
                    <p className="py-1 text-xs text-muted-foreground">
                      Signed in as <span className="font-semibold text-foreground">{displayName}</span>
                    </p>
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="block py-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                          Admin Dashboard
                        </Link>
                        <button
                          onClick={() => { openAdd(); setMenuOpen(false); }}
                          className="block py-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                          Add Product
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
