"use client";

import { useState } from "react";
import { X, Plus, Minus, Trash2, Send, MessageCircle, Instagram, Mail } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const WA_NUMBER = "923005963639";
const IG_URL = "https://instagram.com/lumberwiz";
const EMAIL = "LumberWiz.creations@gmail.com";

function buildWhatsAppLink(items: { name: string; quantity: number; price: number }[], total: number) {
  const lines = items
    .map((i) => `• ${i.name} × ${i.quantity} — PKR ${(i.price * i.quantity).toLocaleString()}`)
    .join("\n");
  const msg = `Hello Lumberwiz! I'd like to place an order:\n${lines}\nTotal: PKR ${total.toLocaleString()}`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function buildGmailLink(items: { name: string; quantity: number; price: number }[], total: number) {
  const lines = items
    .map((i) => `- ${i.name} x${i.quantity}  PKR ${(i.price * i.quantity).toLocaleString()}`)
    .join("\n");
  const body = `Hello Lumberwiz,\n\nI'd like to place the following order:\n\n${lines}\n\nTotal: PKR ${total.toLocaleString()}\n\nPlease confirm availability. Thank you!`;
  return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent("New Order")}&body=${encodeURIComponent(body)}`;
}

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [shareOpen, setShareOpen] = useState(false);

  const orderOptions = [
    {
      icon: MessageCircle,
      label: "Order via WhatsApp",
      sublabel: "Opens pre-filled message",
      href: () => buildWhatsAppLink(items, totalPrice),
      color: "text-green-600",
      bg: "hover:bg-green-50 dark:hover:bg-green-950/30",
    },
    {
      icon: Instagram,
      label: "Order via Instagram",
      sublabel: "DM us @lumberwiz",
      href: () => IG_URL,
      color: "text-pink-500",
      bg: "hover:bg-pink-50 dark:hover:bg-pink-950/30",
    },
    {
      icon: Mail,
      label: "Order via Email",
      sublabel: "Opens Gmail in browser",
      href: () => buildGmailLink(items, totalPrice),
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
            onClick={() => { setIsCartOpen(false); setShareOpen(false); }}
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
                onClick={() => { setIsCartOpen(false); setShareOpen(false); }}
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
                        src={item.image}
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

                {/* Place Order button + share panel */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShareOpen((v) => !v)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                    Place Order
                  </motion.button>

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
                        {orderOptions.map(({ icon: Icon, label, sublabel, href, color, bg }) => (
                          <a
                            key={label}
                            href={href()}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShareOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${bg}`}
                          >
                            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                            <div>
                              <p className="text-sm font-medium text-foreground">{label}</p>
                              <p className="text-xs text-muted-foreground">{sublabel}</p>
                            </div>
                          </a>
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
