"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, ImageIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

interface ProductRow {
  id: string;           // uuid
  serial: string;
  name: string;
  price: number;
  description: string;
  category: string;
  in_inventory: boolean;
  image_url: string;
}

const BUCKET = "product-images";

const CATEGORIES = [
  "Desktop Planters",
  "Terracotta Lamps",
  "Marble Lamps",
  "Terracotta Planters",
  "Terracotta Vase",
];

const emptyForm = {
  serial: "",
  name: "",
  price: 10000,
  description: "",
  category: CATEGORIES[0],
  in_inventory: true,
  imageFile: null as File | null,
  imageUrl: "",
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductRow[]>([]);

  // Add form
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ ...emptyForm });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...emptyForm });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const addImageRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLInputElement>(null);

  // Gate: check session + role on mount
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

      loadProducts();
    }
    checkAccess();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, serial, name, price, description, category, in_inventory, image_url")
      .order("serial");
    setProducts(data ?? []);
    setLoading(false);
  }

  async function uploadImage(file: File, serial: string): Promise<string> {
    const ext = file.name.split(".").pop() ?? "jpeg";
    const storagePath = `${serial}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: true });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddSaving(true);

    try {
      let imageUrl: string | null = addForm.imageUrl || null;

      if (addForm.imageFile) {
        if (!addForm.serial) throw new Error("Serial is required to upload an image.");
        imageUrl = await uploadImage(addForm.imageFile, addForm.serial);
      }

      const { error } = await supabase.from("products").insert({
        serial: addForm.serial,
        name: addForm.name,
        price: addForm.price,
        description: addForm.description,
        category: addForm.category,
        in_inventory: addForm.in_inventory,
        image_url: imageUrl,
      });

      if (error) throw new Error(error.message);

      setAddOpen(false);
      setAddForm({ ...emptyForm });
      await loadProducts();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setAddSaving(false);
    }
  }

  function startEdit(p: ProductRow) {
    setEditId(p.id);
    setEditForm({
      serial: p.serial,
      name: p.name,
      price: p.price,
      description: p.description,
      category: p.category,
      in_inventory: p.in_inventory,
      imageFile: null,
      imageUrl: p.image_url,
    });
    setEditError("");
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    setEditSaving(true);

    try {
      let imageUrl: string | null = editForm.imageUrl || null;

      if (editForm.imageFile) {
        imageUrl = await uploadImage(editForm.imageFile, editForm.serial);
      }

      const { error } = await supabase
        .from("products")
        .update({
          serial: editForm.serial,
          name: editForm.name,
          price: editForm.price,
          description: editForm.description,
          category: editForm.category,
          in_inventory: editForm.in_inventory,
          image_url: imageUrl,
        })
        .eq("id", editId!);

      if (error) throw new Error(error.message);

      setEditId(null);
      await loadProducts();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from("products").delete().eq("id", deleteId);
    setDeleteId(null);
    setDeleting(false);
    await loadProducts();
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} products</p>
        </div>
        <button
          onClick={() => { setAddOpen(true); setAddError(""); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {addOpen && (
          <ProductFormModal
            title="Add Product"
            form={addForm}
            setForm={setAddForm as (f: typeof emptyForm) => void}
            error={addError}
            saving={addSaving}
            imageRef={addImageRef}
            onSubmit={handleAdd}
            onClose={() => setAddOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editId !== null && (
          <ProductFormModal
            title="Edit Product"
            form={editForm}
            setForm={setEditForm as (f: typeof emptyForm) => void}
            error={editError}
            saving={editSaving}
            imageRef={editImageRef}
            onSubmit={handleEdit}
            onClose={() => setEditId(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
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
              className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col max-h-[90dvh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"            >
              <h3 className="font-display text-lg font-semibold text-foreground">Delete Product?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This action cannot be undone. The product will be permanently removed from the database.
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

      {/* Products Table */}
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3">
                  <img
                    src={p.image_url || "/placeholder.svg"}
                    alt={p.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.serial}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3 font-semibold text-primary">PKR {p.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    p.in_inventory
                      ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {p.in_inventory ? "In Stock" : "Sold Out"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="rounded-lg border border-destructive/30 p-1.5 text-destructive transition-colors hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Shared form modal for Add and Edit
function ProductFormModal({
  title,
  form,
  setForm,
  error,
  saving,
  imageRef,
  onSubmit,
  onClose,
}: {
  title: string;
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  error: string;
  saving: boolean;
  imageRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-lg max-h-[90dvh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-5 min-h-0"> 
           {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          <Field label="Serial *">
            <input
              required
              value={form.serial}
              onChange={(e) => setForm({ ...form, serial: e.target.value })}
              className={inputClass}
              placeholder="e.g. LA-CL-EG-001"
            />
          </Field>

          <Field label="Name *">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Product name"
            />
          </Field>

          <Field label="Price (PKR) *">
            <input
              required
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className={inputClass}
            />
          </Field>

          <Field label="Category *">
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              placeholder="Product description"
            />
          </Field>

          {/* Inventory toggle */}
          <Field label="Inventory">
            <button
              type="button"
              onClick={() => setForm({ ...form, in_inventory: !form.in_inventory })}
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              {form.in_inventory ? (
                <ToggleRight className="h-6 w-6 text-primary" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-muted-foreground" />
              )}
              {form.in_inventory ? "In Stock" : "Sold Out"}
            </button>
          </Field>

          {/* Image upload */}
          <Field label="Product Image">
            <div className="space-y-2">
              {(form.imageUrl || form.imageFile) && (
                <img
                  src={form.imageFile ? URL.createObjectURL(form.imageFile) : form.imageUrl}
                  alt="Preview"
                  className="h-24 w-24 rounded-lg object-cover border border-border"
                />
              )}
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ImageIcon className="h-4 w-4" />
                {form.imageFile ? "Change image" : "Upload image"}
              </button>
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setForm({ ...form, imageFile: file });
                }}
              />
            </div>
          </Field>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-border p-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : (
                <>
                  <Check className="h-4 w-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
