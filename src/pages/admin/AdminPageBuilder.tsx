import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Save,
  X,
  Bold,
  Italic,
  UnderlineIcon,
  List,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Type,
  Layout,
  Eye,
  Pencil,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────
interface PageSection {
  id: string;
  page: string;
  section: string;
  type: "text" | "image" | "hero" | "banner" | "html";
  content: {
    html?: string;
    text?: string;
    imageUrl?: string;
    imageAlt?: string;
    bgColor?: string;
    textColor?: string;
    align?: "left" | "center" | "right";
    subtitle?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  order_index: number;
}

type PageKey = "home" | "courses" | "portfolio" | "support";

const PAGES: { key: PageKey; label: string }[] = [
  { key: "home",      label: "Home Page" },
  { key: "courses",   label: "Courses Page" },
  { key: "portfolio", label: "Portfolio Page" },
  { key: "support",   label: "Support Page" },
];

const SECTION_TYPES = [
  { type: "hero",   label: "Hero Banner",   icon: Layout,    desc: "Full-width hero with heading and button" },
  { type: "text",   label: "Text Section",  icon: Type,      desc: "Rich text content block" },
  { type: "image",  label: "Image Section", icon: ImageIcon, desc: "Image with optional caption" },
  { type: "banner", label: "Banner",        icon: AlignCenter, desc: "Highlighted banner section" },
];

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ── Tiptap Toolbar ─────────────────────────────────────────────
const EditorToolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const colors = [
    "#000000", "#374151", "#1d4ed8", "#7c3aed",
    "#dc2626", "#d97706", "#059669", "#db2777",
    "#ffffff", "#f3f4f6", "#dbeafe", "#ede9fe",
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded text-sm transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-blue-100 text-blue-700"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded text-sm transition-colors ${
          editor.isActive("heading", { level: 3 })
            ? "bg-blue-100 text-blue-700"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* Bold, Italic, Underline */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive("bold")
            ? "bg-blue-100 text-blue-700"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive("italic")
            ? "bg-blue-100 text-blue-700"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive("underline")
            ? "bg-blue-100 text-blue-700"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* List */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive("bulletList")
            ? "bg-blue-100 text-blue-700"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* Color Picker */}
      <div className="relative group">
        <button
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 flex items-center gap-1"
          title="Text Color"
        >
          <Palette className="w-4 h-4" />
        </button>
        <div className="absolute top-8 left-0 z-10 hidden group-hover:grid grid-cols-6 gap-1 p-2 bg-white border border-gray-200 rounded-xl shadow-lg w-36">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => editor.chain().focus().setColor(color).run()}
              className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="col-span-2 text-xs text-gray-500 hover:text-gray-700 mt-1"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Section Editor Modal ───────────────────────────────────────
const SectionEditorModal = ({
  section,
  onSave,
  onClose,
}: {
  section: PageSection;
  onSave: (section: PageSection) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState({ ...section });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, Underline],
    content: form.content.html || "",
    onUpdate: ({ editor }) => {
      setForm((p) => ({
        ...p,
        content: { ...p.content, html: editor.getHTML() },
      }));
    },
  });

  // ── Image Upload ─────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      alert("Cloudinary not configured.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "bloom-skills/pages");

      const data = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
          else reject(new Error("Upload failed"));
        });
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.open("POST", `[api.cloudinary.com](https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload)`);
        xhr.send(formData);
      });

      setForm((p) => ({
        ...p,
        content: { ...p.content, imageUrl: data.secure_url },
      }));

      // Save to media library
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("media_library").insert({
        name: file.name,
        url: data.secure_url,
        public_id: data.public_id,
        type: "image",
        size: file.size,
        format: file.type,
        uploaded_by: user?.id,
      });
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const updateContent = (key: string, value: string) => {
    setForm((p) => ({ ...p, content: { ...p.content, [key]: value } }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Edit Section
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">
              {form.type} · {form.section}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* HERO TYPE */}
          {form.type === "hero" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hero Heading
                </label>
                <input
                  type="text"
                  value={form.content.text || ""}
                  onChange={(e) => updateContent("text", e.target.value)}
                  placeholder="e.g. Learn Skills That Matter"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <textarea
                  value={form.content.subtitle || ""}
                  onChange={(e) => updateContent("subtitle", e.target.value)}
                  rows={2}
                  placeholder="Supporting text below the heading"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={form.content.buttonText || ""}
                    onChange={(e) => updateContent("buttonText", e.target.value)}
                    placeholder="e.g. Get Started"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button URL
                  </label>
                  <input
                    type="text"
                    value={form.content.buttonUrl || ""}
                    onChange={(e) => updateContent("buttonUrl", e.target.value)}
                    placeholder="/courses"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* TEXT TYPE */}
          {form.type === "text" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <EditorToolbar editor={editor} />
                <EditorContent
                  editor={editor}
                  className="min-h-[200px] p-4 text-sm prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[180px]"
                />
              </div>
            </div>
          )}

          {/* IMAGE TYPE */}
          {form.type === "image" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                {form.content.imageUrl ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden h-48">
                      <img
                        src={form.content.imageUrl}
                        alt={form.content.imageAlt || ""}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-800">
                          <Upload className="w-4 h-4 inline mr-1" />
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={form.content.imageAlt || ""}
                      onChange={(e) => updateContent("imageAlt", e.target.value)}
                      placeholder="Image alt text / caption"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {uploading ? (
                      <div className="text-center px-6 w-full">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadProgress}%
                        </p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Click to upload image
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </>
          )}

          {/* BANNER TYPE */}
          {form.type === "banner" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Text
                </label>
                <input
                  type="text"
                  value={form.content.text || ""}
                  onChange={(e) => updateContent("text", e.target.value)}
                  placeholder="e.g. 🎉 New courses available now!"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Shared: Background Color, Text Color, Alignment */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.content.bgColor || "#ffffff"}
                  onChange={(e) => updateContent("bgColor", e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={form.content.bgColor || "#ffffff"}
                  onChange={(e) => updateContent("bgColor", e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.content.textColor || "#000000"}
                  onChange={(e) => updateContent("textColor", e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={form.content.textColor || "#000000"}
                  onChange={(e) => updateContent("textColor", e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alignment
              </label>
              <div className="flex items-center gap-1">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateContent("align", align)}
                    className={`p-1.5 rounded transition-colors ${
                      (form.content.align || "left") === align
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    {align === "left" && <AlignLeft className="w-4 h-4" />}
                    {align === "center" && <AlignCenter className="w-4 h-4" />}
                    {align === "right" && <AlignRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Save Section
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Sortable Section Card ──────────────────────────────────────
const SortableSectionCard = ({
  section,
  onEdit,
  onDelete,
}: {
  section: PageSection;
  onEdit: (section: PageSection) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const typeColors: Record<string, string> = {
    hero:   "bg-blue-50 text-blue-700 border-blue-200",
    text:   "bg-green-50 text-green-700 border-green-200",
    image:  "bg-purple-50 text-purple-700 border-purple-200",
    banner: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border shadow-sm transition-shadow ${
        isDragging ? "shadow-xl border-blue-300" : "border-gray-100 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${
                typeColors[section.type] || typeColors.text
              }`}
            >
              {section.type}
            </span>
            <span className="text-sm font-medium text-gray-800 capitalize">
              {section.section.replace(/-/g, " ")}
            </span>
          </div>

          {/* Content Preview */}
          <div className="text-xs text-gray-400 truncate">
            {section.type === "text" && section.content.html && (
              <span
                dangerouslySetInnerHTML={{
                  __html: section.content.html
                    .replace(/<[^>]*>/g, " ")
                    .slice(0, 80) + "...",
                }}
              />
            )}
            {(section.type === "hero" || section.type === "banner") &&
              section.content.text && (
                <span>{section.content.text.slice(0, 80)}</span>
              )}
            {section.type === "image" && section.content.imageUrl && (
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {section.content.imageAlt || "Image uploaded"}
              </span>
            )}
          </div>
        </div>

        {/* Style Preview Dots */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {section.content.bgColor && (
            <div
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: section.content.bgColor }}
              title={`BG: ${section.content.bgColor}`}
            />
          )}
          {section.content.textColor && (
            <div
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: section.content.textColor }}
              title={`Text: ${section.content.textColor}`}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(section)}
            className="p-1.5 text-gray-400 hover:text-[#0037FF] hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Add Section Modal ──────────────────────────────────────────
const AddSectionModal = ({
  onAdd,
  onClose,
  existingSections,
}: {
  onAdd: (type: string, sectionName: string) => void;
  onClose: () => void;
  existingSections: PageSection[];
}) => {
  const [selectedType, setSelectedType] = useState("text");
  const [sectionName, setSectionName] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add New Section</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Section Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Section Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SECTION_TYPES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => setSelectedType(t.type)}
                  className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left ${
                    selectedType === t.type
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      selectedType === t.type
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Name (unique identifier)
            </label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) =>
                setSectionName(
                  e.target.value.toLowerCase().replace(/\s+/g, "-")
                )
              }
              placeholder="e.g. hero, about, features"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Lowercase, hyphens only. Must be unique per page.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!sectionName.trim()) {
                alert("Section name is required.");
                return;
              }
              const exists = existingSections.some(
                (s) => s.section === sectionName.trim()
              );
              if (exists) {
                alert("A section with this name already exists on this page.");
                return;
              }
              onAdd(selectedType, sectionName.trim());
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page Preview ───────────────────────────────────────────────
const PagePreview = ({
  sections,
  onClose,
}: {
  sections: PageSection[];
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
      <h2 className="font-bold text-gray-900">Page Preview</h2>
      <button
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
      >
        <X className="w-4 h-4" />
        Close Preview
      </button>
    </div>

    <div>
      {sections
        .sort((a, b) => a.order_index - b.order_index)
        .map((section) => (
          <div
            key={section.id}
            style={{
              backgroundColor: section.content.bgColor || "transparent",
              color: section.content.textColor || "inherit",
              textAlign: section.content.align || "left",
            }}
            className="px-8 py-12"
          >
            {section.type === "hero" && (
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">
                  {section.content.text || "Hero Heading"}
                </h1>
                {section.content.subtitle && (
                  <p className="text-xl opacity-80 mb-6">
                    {section.content.subtitle}
                  </p>
                )}
                {section.content.buttonText && (
                  <a
                    href={section.content.buttonUrl || "#"}
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                  >
                    {section.content.buttonText}
                  </a>
                )}
              </div>
            )}

            {section.type === "text" && (
              <div
                className="max-w-4xl mx-auto prose prose-lg"
                dangerouslySetInnerHTML={{
                  __html: section.content.html || "<p>Empty text section</p>",
                }}
              />
            )}

            {section.type === "image" && section.content.imageUrl && (
              <div className="max-w-4xl mx-auto">
                <img
                  src={section.content.imageUrl}
                  alt={section.content.imageAlt || ""}
                  className="w-full rounded-2xl shadow-lg"
                />
                {section.content.imageAlt && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {section.content.imageAlt}
                  </p>
                )}
              </div>
            )}

            {section.type === "banner" && (
              <div className="max-w-4xl mx-auto text-center">
                <p className="text-lg font-medium">
                  {section.content.text || "Banner text"}
                </p>
              </div>
            )}
          </div>
        ))}
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────
const AdminPageBuilder = () => {
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ── Fetch Sections ───────────────────────────────────────────
  const fetchSections = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .eq("page", activePage)
      .order("order_index", { ascending: true });

    if (error) console.error("Fetch sections error:", error);
    else setSections((data as PageSection[]) || []);
    setLoading(false);
  }, [activePage]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // ── Add Section ──────────────────────────────────────────────
  const handleAddSection = async (type: string, sectionName: string) => {
    const newSection: Omit<PageSection, "id"> = {
      page: activePage,
      section: sectionName,
      type: type as PageSection["type"],
      content: {},
      order_index: sections.length + 1,
    };

    const { data, error } = await supabase
      .from("site_content")
      .insert(newSection)
      .select()
      .single();

    if (error) {
      alert("Failed to add section: " + error.message);
      return;
    }

    setSections((prev) => [...prev, data as PageSection]);
    setShowAddModal(false);

    // Auto-open editor for new section
    setEditingSection(data as PageSection);
  };

  // ── Save Section ─────────────────────────────────────────────
  const handleSaveSection = async (updated: PageSection) => {
    setSaving(true);
    const { error } = await supabase
      .from("site_content")
      .update({
        content: updated.content,
        type: updated.type,
      })
      .eq("id", updated.id);

    if (error) {
      alert("Save failed: " + error.message);
    } else {
      setSections((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setEditingSection(null);
    }
    setSaving(false);
  };

  // ── Delete Section ───────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("site_content")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      setSections((prev) => prev.filter((s) => s.id !== id));
    }
    setDeleteConfirm(null);
  };

  // ── Drag End ─────────────────────────────────────────────────
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);

    setSections(reordered);

    // Save new order
    const updates = reordered.map((section, index) =>
      supabase
        .from("site_content")
        .update({ order_index: index + 1 })
        .eq("id", section.id)
    );
    await Promise.all(updates);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
            <p className="text-gray-500 text-sm mt-1">
              Edit content for each page of your website
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>
        </div>

        {/* Page Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
          {PAGES.map((page) => (
            <button
              key={page.key}
              onClick={() => setActivePage(page.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePage === page.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>

        {/* Sections List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <Layout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No sections yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Add your first section to start building this page
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Add First Section
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">
              {sections.length} section{sections.length > 1 ? "s" : ""} · Drag to reorder
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sections.map((section) => (
                    <SortableSectionCard
                      key={section.id}
                      section={section}
                      onEdit={setEditingSection}
                      onDelete={setDeleteConfirm}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </main>

      {/* ── Edit Modal ── */}
      {editingSection && (
        <SectionEditorModal
          section={editingSection}
          onSave={handleSaveSection}
          onClose={() => setEditingSection(null)}
        />
      )}

      {/* ── Add Section Modal ── */}
      {showAddModal && (
        <AddSectionModal
          onAdd={handleAddSection}
          onClose={() => setShowAddModal(false)}
          existingSections={sections}
        />
      )}

      {/* ── Preview ── */}
      {showPreview && (
        <PagePreview
          sections={sections}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              Delete Section?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This section and all its content will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPageBuilder;
