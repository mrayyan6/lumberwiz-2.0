"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import StarRating from "@/components/StarRating";

type PickerProduct = {
  id: string;          // products.id (uuid) — this is the reviews.product_id FK
  name: string;
  image_url: string | null;
  category: string;
};

type Step = "loading" | "pick" | "form" | "done";

export default function WriteReviewPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("loading");
  const [products, setProducts] = useState<PickerProduct[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PickerProduct | null>(null);

  // Form fields
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Gate + initial data load
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      // Pre-fill name from the user's profile (fallback to email prefix)
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", session.user.id)
        .single();
      setCustomerName(profile?.name || session.user.email?.split("@")[0] || "");

      const { data } = await supabase
        .from("products")
        .select("id, name, image_url, category")
        .not("image_url", "is", null)
        .neq("image_url", "")
        .order("name");
      setProducts((data ?? []) as PickerProduct[]);
      setStep("pick");
    }
    init();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  function pickProduct(p: PickerProduct) {
    setSelected(p);
    setError("");
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation (server re-validates identically)
    if (!selected) { setError("Please select a product."); return; }
    if (rating < 1 || rating > 5) { setError("Please select a star rating."); return; }
    if (comment.trim().length < 10) { setError("Your comment must be at least 10 characters."); return; }
    if (!customerName.trim()) { setError("Please enter your name."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selected.id,
          customer_name: customerName.trim(),
          rating,
          comment: comment.trim(),
          category: selected.category,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function writeAnother() {
    setSelected(null);
    setRating(0);
    setComment("");
    setError("");
    setSearch("");
    setStep("pick");
  }

  if (step === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Write a Review</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          {step === "pick" && "Choose the product you'd like to review."}
          {step === "form" && "Tell us what you think — your feedback helps other shoppers."}
          {step === "done" && "Your review has been submitted."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Product picker ── */}
        {step === "pick" && (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="relative mx-auto mb-6 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or categories…"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No products found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => pickProduct(p)}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="aspect-square overflow-hidden bg-secondary/30">
                      <img
                        src={p.image_url || "/placeholder.svg"}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: Review form ── */}
        {step === "form" && selected && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-auto max-w-lg"
          >
            <button
              onClick={() => setStep("pick")}
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Choose a different product
            </button>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              {/* Selected product header */}
              <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
                <img
                  src={selected.image_url || "/placeholder.svg"}
                  alt={selected.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.category}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Your Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Your Rating</label>
                  <StarRating rating={rating} onChange={setRating} size="lg" />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Your Review</label>
                  <textarea
                    required
                    minLength={10}
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="What did you like? (at least 10 characters)"
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{comment.trim().length} / 10 min</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10"
            >
              <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-foreground">Thanks for your review!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We appreciate you taking the time to share your experience.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={writeAnother}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                Write Another
              </button>
              <Link
                href="/"
                className="flex-1 rounded-lg border border-border py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Go Home
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
