"use client";

/*
 * ADMIN — Manage Reviews (/admin/reviews)
 *
 * Same access gate as the main admin dashboard: must be logged in AND have
 * profiles.role === "admin", otherwise redirect home. Admins can read every
 * review and delete ones that are wrong/abusive. (Delete is also enforced by
 * RLS on the `reviews` table — this UI is the convenient front door.)
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowLeft, Star } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

interface ReviewRow {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  category: string;
  created_at: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.role !== "admin") { router.replace("/"); return; }

      loadReviews();
    }
    checkAccess();
  }, []);

  async function loadReviews() {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, product_id, customer_name, rating, comment, category, created_at")
      .order("created_at", { ascending: false });
    setReviews((data ?? []) as ReviewRow[]);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from("reviews").delete().eq("id", deleteId);
    setDeleteId(null);
    setDeleting(false);
    await loadReviews();
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          href="/admin"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold text-foreground">Manage Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">{reviews.length} reviews</p>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteId !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <h3 className="font-display text-lg font-semibold text-foreground">Delete Review?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This action cannot be undone. The review will be permanently removed.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-destructive py-2 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-3">
                  <p className="font-semibold text-foreground">{r.customer_name}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <Star
                        key={v}
                        className={`h-3.5 w-3.5 ${
                          v <= r.rating ? "fill-primary text-primary" : "fill-transparent text-muted-foreground/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {r.category} · {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setDeleteId(r.id)}
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                title="Delete review"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
