"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useAdmin } from "@/context/AdminContext";
import { fetchCategories } from "@/lib/products";

const BUCKET = "product-images";

export default function AdminProductModal() {
  const { modalState, closeModal } = useAdmin();

  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  // Form fields
  const [name, setName] = useState("");
  const [serial, setSerial] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [inInventory, setInInventory] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing categories for datalist suggestions
  useEffect(() => {
    fetchCategories().then(setExistingCategories);
  }, []);

  // Populate form when modal opens / mode changes
  useEffect(() => {
    if (!modalState) return;
    setError(null);
    setConfirmDelete(false);
    setImageFile(null);

    if (modalState.mode === "edit" && modalState.product) {
      const p = modalState.product;
      setName(p.name);
      setSerial(p.id);
      setPrice(String(p.price));
      setDescription(p.description ?? "");
      setCategory(p.category);
      setInInventory(p.in_inventory);
      setImagePreview(p.image_url || "");
    } else {
      setName("");
      setSerial("");
      setPrice("");
      setDescription("");
      setCategory(modalState.initialCategory ?? "");
      setInInventory(true);
      setImagePreview("");
    }
  }, [modalState]);

  // Escape key + body scroll lock
  useEffect(() => {
    if (!modalState) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [modalState, closeModal]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setError(null);
    if (!name.trim()) return setError("Name is required.");
    if (!serial.trim()) return setError("Serial / SKU is required.");
    if (!price || isNaN(Number(price)) || Number(price) < 0)
      return setError("A valid price is required.");
    if (!category.trim()) return setError("Category is required.");

    const isEdit = modalState?.mode === "edit";
    const existingImageUrl =
      isEdit && modalState?.product ? modalState.product.image_url : "";

    if (!imageFile && !existingImageUrl) {
      return setError("An image is required.");
    }

    setSaving(true);

    try {
      const supabase = createClient();
      let imageUrl = existingImageUrl;
      const serialValue = String(serial).trim();

      const confirmed = window.confirm(
        isEdit
          ? "Are you sure you want to save these product changes?"
          : "Are you sure you want to add this new product?"
      );
      if (!confirmed) return;

      if (imageFile) {
        const ext =
          imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const storagePath = `${serialValue}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, imageFile, {
            contentType: imageFile.type || `image/${ext}`,
            upsert: true,
          });

        if (uploadErr) {
          setError(`Image upload failed: ${uploadErr.message}`);
          return;
        }

        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(storagePath);
        imageUrl = urlData.publicUrl;
      }

      const row = {
        serial: serialValue,
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        category: category.trim(),
        in_inventory: inInventory,
        image_url: imageUrl,
      };

      if (isEdit && modalState?.product) {
        const { error: updateErr } = await supabase
          .from("products")
          .update(row)
          .eq("serial", modalState.product.id);

        if (updateErr) {
          setError(`Save failed: ${updateErr.message}`);
          return;
        }
      } else {
        const { error: insertErr } = await supabase
          .from("products")
          .insert(row);

        if (insertErr) {
          setError(`Save failed: ${insertErr.message}`);
          return;
        }
      }

      modalState?.onSuccess?.();
      closeModal();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!modalState?.product) return;
    const confirmed = window.confirm("Are you sure? This cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    const serialVal = modalState.product.id;

    try {
      const supabase = createClient();

      const { error: deleteErr } = await supabase
        .from("products")
        .delete()
        .eq("serial", serialVal);

      if (deleteErr) {
        setError(`Delete failed: ${deleteErr.message}`);
        return;
      }

      // Best-effort storage cleanup
      if (modalState.product.image_url) {
        const filename = modalState.product.image_url.split("/").pop();
        if (filename) {
          await supabase.storage.from(BUCKET).remove([filename]);
        }
      }

      modalState?.onSuccess?.();
      closeModal();
    } catch {
      setError("An unexpected error occurred during deletion.");
    } finally {
      setDeleting(false);
    }
  }

  const isEdit = modalState?.mode === "edit";

  return (
    <AnimatePresence>
      {modalState && (
        <>
          {/* Backdrop */}
          <motion.div
            key="admin-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[61] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
           <motion.div
             key="admin-panel"
               initial={{ opacity: 0, scale: 0.94, y: 24 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.94, y: 24 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="w-full max-w-lg max-h-[90dvh] flex flex-col rounded-2xl bg-card shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
            {/* Header (FIXED) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display text-lg font-bold text-foreground">
                {isEdit ? "Edit Product" : "Add Product"}
              </h2>

              <button
                onClick={closeModal}
                className="rounded-full bg-secondary p-1.5 text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Image upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-primary/50 hover:bg-secondary/50"
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Upload className="h-5 w-5 text-white" />
                      <span className="text-sm text-white font-medium">Change image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs">PNG, JPG, JPEG, WEBP</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Serial */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Serial / SKU
                </label>
                <input
                  type="text"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="e.g. DP-001"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Price (PKR)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="10000"
                  min="0"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Terracotta Planters"
                  list="admin-modal-categories"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <datalist id="admin-modal-categories">
                  {existingCategories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* In Inventory toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">In Inventory</p>
                  <p className="text-xs text-muted-foreground">
                    Show as available for purchase
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInInventory((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    inInventory ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      inInventory ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border px-6 py-4">
              {isEdit && confirmDelete ? (
                <div className="flex items-center gap-3">
                  <p className="flex-1 text-sm text-muted-foreground">
                    Delete this product permanently?
                  </p>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-opacity disabled:opacity-60"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {isEdit && (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="mr-auto inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
            </div>
        </>
      )}
    </AnimatePresence>
  );
}
