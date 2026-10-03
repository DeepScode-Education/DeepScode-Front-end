import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Globe, EyeOff, ImageIcon, X, Upload, CheckCircle2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useHeroSlides } from "../../hooks/useHeroSlides";

/* ─────────── types ─────────── */
interface SlideItem {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  order: number;
  isActive: boolean;
}

/* ─────────── helpers ─────────── */
const emptyForm = { title: "", subtitle: "", order: 1 };

export default function HeroSectionAdmin() {
  const { slides, loading, saveSlide, deleteSlide, toggleActive } =
    useHeroSlides();

  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  /* ── toast helper ── */
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── reset form ── */
  const resetForm = () => {
    setForm(emptyForm);
    setImage(null);
    setImagePreview(null);
    setEditId(null);
    setShowForm(false);
  };

  /* ── open "add new" ── */
  const openAdd = () => {
    resetForm();
    setForm({ ...emptyForm, order: slides.length + 1 });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  /* ── open "edit" ── */
  const openEdit = (item: SlideItem) => {
    setForm({ title: item.title, subtitle: item.subtitle, order: item.order });
    setImagePreview(item.image || null);
    setImage(null);
    setEditId(item._id);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  /* ── image pick ── */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  /* ── submit (draft or publish) ── */
  const handleSubmit = async (publish: boolean) => {
    if (!form.title.trim()) {
      showToast("Title is required.", "error");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("subtitle", form.subtitle.trim());
      fd.append("order", String(form.order));
      fd.append("isActive", String(publish));
      if (image) fd.append("image", image);

      await saveSlide(fd, editId);
      showToast(editId ? "Slide updated." : publish ? "Slide published." : "Slide saved as draft.");
      resetForm();
    } catch {
      showToast("Something went wrong. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide? This cannot be undone.")) return;
    try {
      await deleteSlide(id);
      showToast("Slide deleted.");
      if (editId === id) resetForm();
    } catch {
      showToast("Could not delete. Try again.", "error");
    }
  };

  /* ── toggle publish ── */
  const handleToggle = async (item: SlideItem) => {
    try {
      await toggleActive(item._id, !item.isActive);
      showToast(item.isActive ? "Moved to draft." : "Slide published.");
    } catch {
      showToast("Could not update status.", "error");
    }
  };

  /* ── sorted slides ── */
  const sorted = [...slides].sort((a, b) => a.order - b.order);

  const actions = (
    <Button size="sm" onClick={openAdd} className="flex items-center gap-2 text-white">
      <Plus size={14} />
      New slide
    </Button>
  );

  return (
    <AdminLayout
      title="Hero CMS"
      subtitle="Manage homepage hero slides — title, image, order, and publish status."
      actions={actions}
    >
      {/* ── TOAST ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm shadow-lg
            ${toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"}`}
        >
          <CheckCircle2 size={15} />
          {toast.msg}
        </div>
      )}

      {/* ── FORM PANEL ── */}
      {showForm && (
        <div
          ref={formRef}
          className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm"
        >
          {/* form header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                {editId ? <Pencil size={15} /> : <Plus size={15} />}
                {editId ? "Edit slide" : "New slide"}
              </h2>
              {editId && (
                <span className="mt-1 inline-block text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full px-3 py-0.5">
                  Editing mode — changes only save on button click
                </span>
              )}
            </div>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              aria-label="Close form"
            >
              <X size={16} />
            </button>
          </div>

          {/* fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* title */}
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title *</label>
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                placeholder="e.g. Learn Beyond the Classroom"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* order */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order</label>
              <input
                type="number"
                min={1}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>

            {/* subtitle */}
            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subtitle</label>
              <textarea
                rows={2}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                placeholder="Short tagline shown below the title on the hero"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>

            {/* image upload */}
            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Image</label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition group"
                onClick={() => fileRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative w-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-44 object-cover rounded-lg"
                    />
                    <button
                      className="absolute top-2 right-2 bg-white border border-gray-200 rounded-full p-1 text-gray-500 hover:text-red-500 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage(null);
                        setImagePreview(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      aria-label="Remove image"
                    >
                      <X size={12} />
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-2">Click to change image</p>
                  </div>
                ) : (
                  <>
                    <Upload size={22} className="group-hover:text-blue-400 transition" />
                    <p className="text-sm">Click to upload image</p>
                    <p className="text-xs">PNG, JPG, WEBP — recommended 1440×600px</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={() => handleSubmit(false)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50 transition disabled:opacity-50"
            >
              <EyeOff size={14} />
              {editId ? "Save as draft" : "Save draft"}
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Globe size={14} />
              {saving ? "Saving…" : editId ? "Save & publish" : "Add & publish"}
            </button>
            <button
              onClick={resetForm}
              className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── SLIDES COUNT + GRID ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
          {slides.length} slide{slides.length !== 1 ? "s" : ""} total
          {" · "}
          {slides.filter((s) => s.isActive).length} published
        </p>
      </div>

      {loading ? (
        /* loading skeleton */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        /* empty state */
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <ImageIcon size={36} className="mb-3" />
          <p className="text-sm font-medium text-gray-500">No slides yet</p>
          <p className="text-xs mt-1">Add your first hero slide to get started</p>
          <button
            onClick={openAdd}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={14} /> New slide
          </button>
        </div>
      ) : (
        /* slide cards grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((item) => (
            <div
              key={item._id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition
                ${editId === item._id ? "ring-2 ring-blue-400 border-blue-200" : "border-gray-200 hover:border-gray-300"}`}
            >
              {/* image */}
              <div className="relative h-40 bg-gray-50">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={32} />
                  </div>
                )}
                {/* status pill overlaid on image */}
                <span
                  className={`absolute top-2 left-2 text-xs px-2.5 py-0.5 rounded-full font-medium
                    ${item.isActive
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"}`}
                >
                  {item.isActive ? "Published" : "Draft"}
                </span>
                {/* order pill */}
                <span className="absolute top-2 right-2 text-xs bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                  #{item.order}
                </span>
              </div>

              {/* content */}
              <div className="p-4 pb-2">
                <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate">{item.title || "Untitled"}</h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.subtitle || "No subtitle"}
                </p>
              </div>

              {/* actions */}
              <div className="flex gap-2 p-3 pt-2">
                <button
                  onClick={() => openEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                >
                  <Pencil size={12} /> Edit
                </button>

                <button
                  onClick={() => handleToggle(item)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg transition
                    ${item.isActive
                      ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
                      : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"}`}
                >
                  {item.isActive ? <EyeOff size={12} /> : <Globe size={12} />}
                  {item.isActive ? "Draft" : "Publish"}
                </button>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition"
                  aria-label="Delete slide"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}