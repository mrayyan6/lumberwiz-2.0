"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus, Trash2, Send, MessageCircle, Instagram, Mail, LogIn } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

const WA_NUMBER = "923005963639";
const IG_URL = "https://instagram.com/lumberwiz";
const EMAIL = "LumberWiz.creations@gmail.com";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [shareOpen, setShareOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer" | null>(null);
  const [sessionProfile, setSessionProfile] = useState({ name: "", phone: "", address: "" });
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("name, phone, address")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setSessionProfile({
              name: data.name || "",
              phone: data.phone || "",
              address: data.address || "",
            });
          }
        });
    }
  }, [user]);

  function buildOrderMessage(method: "cod" | "bank_transfer") {
    const paymentLabel = method === "cod" ? "Cash on Delivery (COD)" : "Bank Transfer";
    const lines = items
      .map((i) => `${i.name} - Qty: ${i.quantity}`)
      .join("\n\n");
    return (
      `Hello Lumberwiz! I'd like to place an order:\n\n` +
      `Name: ${sessionProfile.name}\n\n` +
      `Phone: ${sessionProfile.phone}\n\n` +
      `Address: ${sessionProfile.address}\n\n` +
      `Order Details:\n\n${lines}\n\n` +
      `Payment Method: ${paymentLabel}`
    );
  }

  function closeAll() {
    setIsCartOpen(false);
    setShareOpen(false);
    setLoginPromptOpen(false);
    setPaymentOpen(false);
    setEditDetailsOpen(false);
  }

  function handlePlaceOrder() {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    setPaymentMethod(null);
    setEditDetailsOpen(false);
    setPaymentOpen(true);
  }

  function handleOpenEditDetails() {
    setEditName(sessionProfile.name);
    setEditPhone(sessionProfile.phone);
    setEditAddress(sessionProfile.address);
    setEditDetailsOpen(true);
  }

  function handleSaveDetails() {
    setSessionProfile({ name: editName, phone: editPhone, address: editAddress });
    setEditDetailsOpen(false);
  }

  function handleContinueToOrder() {
    if (!paymentMethod) return;
    setPaymentOpen(false);
    setShareOpen(true);
  }

  const orderActions = [
    {
      icon: MessageCircle,
      label: "Order via WhatsApp",
      sublabel: "Opens pre-filled message",
      onClick: () => {
        const msg = buildOrderMessage(paymentMethod!);
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
        setShareOpen(false);
      },
      color: "text-green-600",
      bg: "hover:bg-green-50 dark:hover:bg-green-950/30",
    },
    {
      icon: Instagram,
      label: "Order via Instagram",
      sublabel: "DM us @lumberwiz",
      onClick: () => {
        if (paymentMethod === "bank_transfer") {
          alert("Please send your order details along with payment screenshot if paying via Bank Transfer");
        }
        window.open(IG_URL, "_blank");
        setShareOpen(false);
      },
      color: "text-pink-500",
      bg: "hover:bg-pink-50 dark:hover:bg-pink-950/30",
    },
    {
      icon: Mail,
      label: "Order via Email",
      sublabel: "Opens Gmail in browser",
      onClick: () => {
        const body = buildOrderMessage(paymentMethod!);
        const subject = `New Order - ${sessionProfile.name}`;
        window.open(
          `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
          "_blank"
        );
        setShareOpen(false);
      },
      color: "text-blue-500",
      bg: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
    },
  ];

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
            onClick={closeAll}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Your Cart</h2>
              <motion.button
                onClick={closeAll}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="py-12 text-center text-muted-foreground"
                >
                  Your cart is empty
                </motion.p>
              ) : (
                <motion.div
                  variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
                      }}
                      layout
                      className="flex gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <img
                        src={item.image_url ?? "/placeholder.svg"}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate text-sm font-medium text-foreground">{item.name}</h4>
                        <p className="text-sm font-semibold text-primary">PKR {item.price.toLocaleString()}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="rounded-md bg-secondary p-1 text-secondary-foreground transition-colors hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="rounded-md bg-secondary p-1 text-secondary-foreground transition-colors hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-destructive transition-colors hover:text-destructive/70"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="border-t border-border p-4 space-y-3"
              >
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>PKR {totalPrice.toLocaleString()}</span>
                </div>

                {/* Place Order button + panels */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                    Place Order
                  </motion.button>

                  {/* Login prompt panel */}
                  <AnimatePresence>
                    {loginPromptOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                      >
                        <div className="px-4 py-4 text-center">
                          <p className="text-sm font-semibold text-foreground">Please log in to place your order</p>
                          <p className="mt-1 text-xs text-muted-foreground">Create a free account or sign in to continue.</p>
                          <Link
                            href="/login"
                            onClick={() => { setIsCartOpen(false); setLoginPromptOpen(false); }}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            <LogIn className="h-4 w-4" />
                            Log In / Sign Up
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Payment method panel */}
                  <AnimatePresence>
                    {paymentOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                      >
                        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Payment Method
                          </p>
                          <button
                            onClick={handleOpenEditDetails}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Edit Details
                          </button>
                        </div>

                        {/* Edit details inline form */}
                        <AnimatePresence>
                          {editDetailsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.18 }}
                              className="overflow-hidden border-b border-border"
                            >
                              <div className="space-y-2 px-4 py-3">
                                <p className="text-xs font-semibold text-foreground">Edit your details</p>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="Name"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <input
                                  type="tel"
                                  value={editPhone}
                                  onChange={(e) => setEditPhone(e.target.value)}
                                  placeholder="Phone"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <input
                                  type="text"
                                  value={editAddress}
                                  onChange={(e) => setEditAddress(e.target.value)}
                                  placeholder="Address"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSaveDetails}
                                    className="flex-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditDetailsOpen(false)}
                                    className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Radio options */}
                        <div className="space-y-1 px-4 py-3">
                          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={paymentMethod === "cod"}
                              onChange={() => setPaymentMethod("cod")}
                              className="accent-primary"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">Cash on Delivery</p>
                              <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                            </div>
                          </label>
                          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="bank_transfer"
                              checked={paymentMethod === "bank_transfer"}
                              onChange={() => setPaymentMethod("bank_transfer")}
                              className="accent-primary"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">Bank Transfer</p>
                              <p className="text-xs text-muted-foreground">Send payment screenshot after ordering</p>
                            </div>
                          </label>
                        </div>

                        <div className="px-4 pb-3">
                          <button
                            onClick={handleContinueToOrder}
                            disabled={!paymentMethod}
                            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Continue
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Order options panel */}
                  <AnimatePresence>
                    {shareOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                      >
                        <p className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Choose how to order
                        </p>
                        {orderActions.map(({ icon: Icon, label, sublabel, onClick, color, bg }) => (
                          <button
                            key={label}
                            onClick={onClick}
                            className={`flex w-full items-center gap-3 px-4 py-3 transition-colors ${bg}`}
                          >
                            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                            <div className="text-left">
                              <p className="text-sm font-medium text-foreground">{label}</p>
                              <p className="text-xs text-muted-foreground">{sublabel}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Clear Cart
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
