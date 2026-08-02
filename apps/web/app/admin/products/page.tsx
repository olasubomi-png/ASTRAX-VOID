"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  ServerCrash,
  Loader2,
  X,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  FileArchive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/constants";

interface ApiProduct extends Omit<Product, "category"> {
  category?: { name: string; slug: string } | null;
  categoryId?: string;
  isActive?: boolean;
}

/* ─── Form fields (no price) ─────────────────────────── */
interface ProductForm {
  name: string;
  description: string;
  shortDescription: string;
  categorySlug: string;
  imageUrl: string;
  fileUrl: string;
  tags: string;
  features: string;
  isFeatured: boolean;
  isTrending: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  shortDescription: "",
  categorySlug: "",
  imageUrl: "",
  fileUrl: "",
  tags: "",
  features: "",
  isFeatured: false,
  isTrending: false,
};

function formToPayload(f: ProductForm) {
  return {
    name: f.name.trim(),
    description: f.description.trim(),
    shortDescription: f.shortDescription.trim() || undefined,
    slug: f.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    images: f.imageUrl ? [f.imageUrl.trim()] : [],
    fileKey: f.fileUrl.trim() || undefined,
    tags: f.tags ? f.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    features: f.features ? f.features.split("\n").map((t) => t.trim()).filter(Boolean) : [],
    isFeatured: f.isFeatured,
    isTrending: f.isTrending,
    price: 0,          // required by DB schema; platform is free
    currency: "USD",
    isActive: true,
  };
}

/* ─── Product Modal ──────────────────────────────────── */
function ProductModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: "add" | "edit";
  initial?: ProductForm;
  onClose: () => void;
  onSave: (form: ProductForm) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductForm>(initial ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial?.imageUrl || null
  );

  const set = (k: keyof ProductForm, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  /** Resolve Authorization value: admin session token preferred, else user JWT */
  function getUploadAuthHeader(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const admin = localStorage.getItem("adminToken");
    if (admin) return { Authorization: `Bearer admin:${admin}` };
    const jwt = localStorage.getItem("token");
    if (jwt) return { Authorization: `Bearer ${jwt}` };
    return {};
  }

  /** Upload a file from the phone/PC to the API and return the public URL */
  async function uploadFile(file: File): Promise<string> {
    const base = api.baseUrl || "/api-proxy";
    const fd = new FormData();
    fd.append("file", file);

    const authHeaders = getUploadAuthHeader();
    if (!authHeaders.Authorization) {
      throw new Error(
        "Not authenticated. Please log in again as admin, then retry the upload."
      );
    }

    let res: Response;
    try {
      res = await fetch(`${base}/admin/upload`, {
        method: "POST",
        // Only Authorization — never set Content-Type so the browser
        // generates the correct multipart boundary for FormData.
        headers: authHeaders,
        body: fd,
      });
    } catch {
      throw new Error(
        "Could not reach the upload server. Check your connection and try again."
      );
    }

    if (!res.ok) {
      let backendMsg = "";
      try {
        const j = (await res.json()) as { error?: string; message?: string };
        backendMsg = (j.error ?? j.message ?? "").trim();
      } catch {
        /* ignore non-JSON */
      }

      if (res.status === 401) {
        throw new Error(
          backendMsg ||
            "Unauthorized (401). Your session may have expired — please log in again."
        );
      }
      if (res.status === 403) {
        throw new Error(
          backendMsg ||
            "Forbidden (403). Admin access is required for uploads."
        );
      }
      if (res.status === 413) {
        throw new Error(backendMsg || "File too large.");
      }
      if (res.status === 400) {
        throw new Error(backendMsg || "Invalid file or upload request.");
      }
      throw new Error(
        backendMsg || `Upload failed (HTTP ${res.status}).`
      );
    }

    const data = (await res.json()) as { url: string; success?: boolean };
    if (!data.url) throw new Error("Upload succeeded but no file URL was returned");
    return data.url;
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so the same file can be re-selected
    e.target.value = "";
    if (!file) return;

    // Validate type (gallery only — no camera force)
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP, GIF)");
      return;
    }
    // Max 10 MB for product images
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 10 MB.");
      return;
    }

    // Local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setUploadingImage(true);
    try {
      const url = await uploadFile(file);
      set("imageUrl", url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
      setImagePreview(form.imageUrl || null);
      URL.revokeObjectURL(previewUrl);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    // Max 50 MB for download packs
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 50 MB.");
      return;
    }

    setSelectedFileName(file.name);
    setUploadingFile(true);
    try {
      const url = await uploadFile(file);
      set("fileUrl", url);
      toast.success(`File uploaded: ${file.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "File upload failed";
      // Never surface raw network TypeError text
      if (/failed to fetch|networkerror|load failed/i.test(msg)) {
        toast.error("Upload failed — could not reach the server. Check your connection and try again.");
      } else {
        toast.error(msg);
      }
      setSelectedFileName(null);
    } finally {
      setUploadingFile(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (uploadingImage || uploadingFile) {
      toast.error("Please wait for uploads to finish");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-primary/30 bg-[#0a0a0f] shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-white/10 bg-[#0a0a0f] z-10">
          <h2 className="font-display text-lg font-bold">
            {mode === "add" ? "Add Product" : "Edit Product"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Product name" required />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
            <textarea
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y min-h-[80px]"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Full product description"
              required
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Short Description</label>
            <Input value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="Brief tagline" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary pr-8"
                value={form.categorySlug}
                onChange={(e) => set("categorySlug", e.target.value)}
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* ── Product Image (pick from phone/PC) ── */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Product Image</label>
            <div className="flex items-start gap-3">
              <div className="relative h-20 w-20 shrink-0 rounded-xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-7 w-7 text-white/20" />
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-3 text-sm text-primary cursor-pointer hover:bg-primary/10 transition-colors">
                  <Upload className="h-4 w-4" />
                  {uploadingImage ? "Uploading…" : "Choose image from gallery"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={handleImagePick}
                  />
                </label>
                {form.imageUrl && (
                  <p className="text-[10px] text-muted-foreground truncate">{form.imageUrl}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Download File (pick from phone/PC) ── */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Download File</label>
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-3.5 text-sm text-primary cursor-pointer hover:bg-primary/10 transition-colors">
              {uploadingFile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileArchive className="h-4 w-4" />
              )}
              {uploadingFile
                ? "Uploading…"
                : form.fileUrl
                  ? "Replace file"
                  : "Choose download file"}
              <input
                type="file"
                accept=".zip,.rar,.7z,.cfg,.txt,.json,.pdf,image/*,*/*"
                className="hidden"
                disabled={uploadingFile}
                onChange={handleFilePick}
              />
            </label>
            {(selectedFileName || form.fileUrl) && (
              <p className="mt-1.5 text-[10px] text-muted-foreground truncate flex items-center gap-1">
                <Check className="h-3 w-3 text-green-400 shrink-0" />
                {selectedFileName || form.fileUrl}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Features (one per line)</label>
            <textarea
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y min-h-[64px]"
              value={form.features}
              onChange={(e) => set("features", e.target.value)}
              placeholder={"Feature 1\nFeature 2"}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tags (comma-separated)</label>
            <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="vip, codm, elite" />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <button
                type="button"
                onClick={() => set("isFeatured", !form.isFeatured)}
                className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${form.isFeatured ? "bg-primary border-primary" : "border-white/20 bg-white/5"}`}
              >
                {form.isFeatured && <Check className="h-3 w-3 text-white" />}
              </button>
              Featured
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <button
                type="button"
                onClick={() => set("isTrending", !form.isTrending)}
                className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${form.isTrending ? "bg-primary border-primary" : "border-white/20 bg-white/5"}`}
              >
                {form.isTrending && <Check className="h-3 w-3 text-white" />}
              </button>
              Trending
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "add" ? "Add Product" : "Save Changes"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Delete Confirm ────────────────────────────────── */
function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#0a0a0f] p-6 text-center shadow-2xl"
      >
        <Trash2 className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h3 className="font-semibold text-lg mb-1">Delete Product?</h3>
        <p className="text-sm text-muted-foreground mb-6">
          &ldquo;{name}&rdquo; will be unpublished. This can be reversed.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────── */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const [deleteId, setDeleteId] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; products: ApiProduct[] }>("/admin/products");
      setProducts(res.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (form: ProductForm) => {
    const payload = formToPayload(form);
    await api.post("/admin/products", payload);
    toast.success("Product added!");
    setShowAdd(false);
    load();
  };

  const handleEdit = async (form: ProductForm) => {
    if (!editProduct) return;
    const payload = formToPayload(form);
    await api.patch(`/admin/products/${editProduct.id}`, payload);
    toast.success("Product updated!");
    setEditProduct(null);
    load();
  };

  const handleToggleActive = async (p: ApiProduct) => {
    await api.patch(`/admin/products/${p.id}`, { isActive: !p.isActive });
    toast.success(p.isActive ? "Product unpublished" : "Product published");
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/admin/products/${deleteId.id}`);
    toast.success("Product deleted.");
    setDeleteId(null);
    load();
  };

  const productToForm = (p: ApiProduct): ProductForm => ({
    name: p.name ?? "",
    description: p.description ?? "",
    shortDescription: p.shortDescription ?? "",
    categorySlug: p.category?.slug ?? "",
    imageUrl: p.images?.[0] ?? "",
    fileUrl: p.fileKey ?? "",
    tags: p.tags?.join(", ") ?? "",
    features: p.features?.join("\n") ?? "",
    isFeatured: p.isFeatured ?? false,
    isTrending: p.isTrending ?? false,
  });

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && p.isActive !== false) ||
      (filterStatus === "inactive" && p.isActive === false);
    return matchSearch && matchStatus;
  });

  return (
    <>
      <AnimatePresence>
        {showAdd && (
          <ProductModal mode="add" onClose={() => setShowAdd(false)} onSave={handleAdd} />
        )}
        {editProduct && (
          <ProductModal
            mode="edit"
            initial={productToForm(editProduct)}
            onClose={() => setEditProduct(null)}
            onSave={handleEdit}
          />
        )}
        {deleteId && (
          <DeleteConfirm
            name={deleteId.name}
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </AnimatePresence>

      <div className="section-padding">
        <div className="container-max">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">
                Manage <span className="neon-text">Products</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {products.length} product{products.length !== 1 ? "s" : ""} total
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin">
                <Button variant="ghost" size="sm">← Admin</Button>
              </Link>
              <Button size="sm" className="gap-2" onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 flex items-center gap-3">
              <ServerCrash className="h-5 w-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-400 flex-1">Unable to reach server — {error}</p>
              <button onClick={load} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1.5 hover:bg-red-500/10">
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "active", "inactive"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={filterStatus === s ? "default" : "ghost"}
                  onClick={() => setFilterStatus(s)}
                  className="capitalize"
                >
                  {s}
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={load} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="card-glow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                {products.length === 0
                  ? "No products yet. Click \"Add Product\" to get started."
                  : "No products match your search."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-muted-foreground">
                      <th className="p-4 font-medium">Product</th>
                      <th className="p-4 font-medium hidden md:table-cell">Category</th>
                      <th className="p-4 font-medium hidden sm:table-cell">Status</th>
                      <th className="p-4 font-medium hidden lg:table-cell">Flags</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-white line-clamp-1">{p.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {p.category?.name ?? "—"}
                          </span>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${p.isActive !== false ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
                            {p.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="flex gap-1">
                            {p.isFeatured && (
                              <span className="rounded-lg bg-primary/10 text-primary px-2 py-0.5 text-xs">Featured</span>
                            )}
                            {p.isTrending && (
                              <span className="rounded-lg bg-orange-400/10 text-orange-400 px-2 py-0.5 text-xs">Hot</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleActive(p)}
                              title={p.isActive !== false ? "Unpublish" : "Publish"}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                            >
                              {p.isActive !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => setEditProduct(p)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId({ id: p.id, name: p.name })}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
