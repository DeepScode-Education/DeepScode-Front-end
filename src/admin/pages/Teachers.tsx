import { useEffect, useState, useRef, type ChangeEvent } from "react";
import {
  Plus, Linkedin, Instagram, Star, Users, Edit2, Trash2,
  X, Upload, Loader2, AlertTriangle, UserCog, LayoutTemplate,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE;

const authHeaders = (includeContentType = false): HeadersInit => {
  const token = localStorage.getItem("token");
  const h: Record<string, string> = {};
  if (includeContentType) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

// ─── Types ────────────────────────────────────────────────────────────────────
// The API maps User → Mentor shape via mapUserToMentor in the controller.
// _id here is the User._id — same record Staff Management uses.
type Mentor = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  company?: string;
  bio?: string;
  photoUrl?: string;
  expertise: string[];
  linkedinUrl?: string;
  instagramUrl?: string;
  rating: number;
  studentsCount: number;
  isActive: boolean;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  designation: string;
  company: string;
  bio: string;
  photoUrl: string;
  expertiseInput: string;
  linkedinUrl: string;
  instagramUrl: string;
  rating: string;
  studentsCount: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  designation: "",
  company: "",
  bio: "",
  photoUrl: "",
  expertiseInput: "",
  linkedinUrl: "",
  instagramUrl: "",
  rating: "5",
  studentsCount: "0",
};

const mentorToForm = (m: Mentor): FormState => ({
  name: m.name,
  email: m.email,
  phone: m.phone ?? "",
  designation: m.designation ?? "",
  company: m.company ?? "",
  bio: m.bio ?? "",
  photoUrl: m.photoUrl ?? "",
  expertiseInput: m.expertise.join(", "),
  linkedinUrl: m.linkedinUrl ?? "",
  instagramUrl: m.instagramUrl ?? "",
  rating: String(m.rating),
  studentsCount: String(m.studentsCount),
});

// ─── Visual helpers ───────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#0037FF", "#7C3AED", "#0891B2", "#059669", "#DC2626", "#D97706",
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");

// ─── Mentor Card ──────────────────────────────────────────────────────────────
const MentorCard = ({
  mentor,
  onEdit,
  onDelete,
  deleting,
  onManageProfile,
}: {
  mentor: Mentor;
  onEdit: () => void;
  onDelete: () => void;
  onManageProfile: () => void;  
  deleting: boolean;
}) => {
  const color = avatarColor(mentor.name);
  const subtitle =
    mentor.designation && mentor.company
      ? `${mentor.designation} · ${mentor.company}`
      : mentor.designation || mentor.company || mentor.email;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3">
        {mentor.photoUrl ? (
          <img
            src={mentor.photoUrl}
            alt={mentor.name}
            className="h-14 w-14 rounded-full object-cover flex-shrink-0 ring-2 ring-border"
          />
        ) : (
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {getInitials(mentor.name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-snug truncate">{mentor.name}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {subtitle}
            </div>
          )}
          {/* Badge: linked to Staff account */}
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary/60 border border-border px-2 py-0.5">
            <UserCog size={10} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Staff account</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {mentor.linkedinUrl && (
            <a
              href={mentor.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#0037FF] transition-colors"
              title="LinkedIn"
            >
              <Linkedin size={15} />
            </a>
          )}
          {mentor.instagramUrl && (
            <a
              href={mentor.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#E1306C] transition-colors"
              title="Instagram"
            >
              <Instagram size={15} />
            </a>
          )}
        </div>
      </div>

      {/* Expertise tags */}
      {mentor.expertise.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {mentor.expertise.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Detail-page CMS entry point */}
<Button
  type="button"
  variant="secondary"
  size="sm"
  className="w-full h-8 text-xs -mt-1"
  onClick={onManageProfile}
>
  <LayoutTemplate size={12} className="mr-1" />
  Manage Detail Page
</Button>

      {/* Stats row */}
      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <div className="flex items-center gap-1">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold">{mentor.rating}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users size={12} />
          <span className="text-xs">
            {mentor.studentsCount > 0
              ? `${mentor.studentsCount.toLocaleString()} learners`
              : "—"}
          </span>
        </div>
      </div>

      {/* LinkedIn CTA */}
      {mentor.linkedinUrl ? (
        <a
          href={mentor.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#0037FF] text-white text-sm font-medium py-2.5 hover:bg-blue-700 transition-colors"
        >
          <Linkedin size={15} />
          LinkedIn
        </a>
      ) : (
        <div className="h-[42px]" />
      )}

      {/* Admin actions */}
      <div className="flex gap-2 -mt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={onEdit}
        >
          <Edit2 size={12} className="mr-1" />
          Edit profile
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 size={12} className="animate-spin mr-1" />
          ) : (
            <Trash2 size={12} className="mr-1" />
          )}
          {deleting ? "Removing…" : "Remove"}
        </Button>
      </div>
    </div>
  );
};



// ─── Form field component ─────────────────────────────────────────────────────
const Field = ({
  label,
  id,
  required,
  hint,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs font-medium">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
// On CREATE: POST /api/mentors  → creates User with role:"mentor" + hashed default password
// On EDIT:   PUT  /api/mentors/:id → updates profile fields on the same User record
// Staff Management can also see/edit this user (same _id, role:"mentor")
const MentorModal = ({
  editing,
  onClose,
  onSaved,
}: {
  editing: Mentor | null;
  onClose: () => void;
  onSaved: (mentor: Mentor) => void;
}) => {
  const isEdit = !!editing;
  const [form, setForm] = useState<FormState>(
    editing ? mentorToForm(editing) : EMPTY_FORM
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(
    editing?.photoUrl ?? ""
  );
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    set("photoUrl", "");
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview("");
    set("photoUrl", "");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("phone", form.phone.trim());
      fd.append("designation", form.designation.trim());
      fd.append("company", form.company.trim());
      fd.append("bio", form.bio.trim());
      fd.append("linkedinUrl", form.linkedinUrl.trim());
      fd.append("instagramUrl", form.instagramUrl.trim());
      fd.append("rating", form.rating);
      fd.append("studentsCount", form.studentsCount);

      const tags = form.expertiseInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      fd.append("expertise", JSON.stringify(tags));

      if (photoFile) {
        fd.append("photo", photoFile);
      } else if (form.photoUrl.trim()) {
        fd.append("photoUrl", form.photoUrl.trim());
      } else if (photoPreview === "" && editing?.photoUrl) {
        fd.append("photoUrl", "");
      }

      const url = isEdit
        ? `${API_BASE}/api/mentors/${editing!._id}`
        : `${API_BASE}/api/mentors`;
      const method = isEdit ? "PUT" : "POST";

      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(url, { method, headers, body: fd });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to save mentor");
        return;
      }

      toast.success(
        isEdit
          ? "Teacher profile updated"
          : "Teacher created — they can log in via Staff Management with the default password (Slate@1234)"
      );
      onSaved(data.data);
      onClose();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold">
              {isEdit ? "Edit teacher profile" : "Add new teacher"}
            </h2>
            {!isEdit && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Creates a staff account with role: mentor. Default password: <code className="bg-secondary/60 px-1 rounded text-[11px]">Slate@1234</code>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          {/* Sync notice for edit */}
          {isEdit && (
            <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
              <UserCog size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                This updates profile fields only. To change email, password, or active status, use <strong>Staff Management</strong>.
              </p>
            </div>
          )}

          {/* Photo */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Photo</Label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-secondary/60 border border-dashed border-border flex items-center justify-center text-muted-foreground">
                  <Upload size={18} />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-8 text-xs"
                >
                  Upload photo
                </Button>
                <Input
                  placeholder="Or paste image URL"
                  value={form.photoUrl}
                  onChange={(e) => {
                    set("photoUrl", e.target.value);
                    setPhotoPreview(e.target.value);
                    setPhotoFile(null);
                  }}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name" id="name" required>
              <Input
                id="name"
                autoFocus
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Sunny Sir"
                className="h-9 text-sm"
              />
            </Field>
            <Field
              label="Email"
              id="email"
              required
              hint={isEdit ? "Change email in Staff Management" : undefined}
            >
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="sunny@slate.com"
                className="h-9 text-sm"
                // Email on edit still goes through PUT /api/mentors/:id which
                // calls User.findByIdAndUpdate — so it works, but we hint
                // that Staff Mgmt is the canonical place for credential changes.
                readOnly={isEdit}
              />
            </Field>
          </div>

          {/* Designation & Company */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Designation" id="designation">
              <Input
                id="designation"
                value={form.designation}
                onChange={(e) => set("designation", e.target.value)}
                placeholder="Senior 3D Artist"
                className="h-9 text-sm"
              />
            </Field>
            <Field label="Company" id="company">
              <Input
                id="company"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="deepScode Education"
                className="h-9 text-sm"
              />
            </Field>
          </div>

          {/* Expertise */}
          <Field
            label="Expertise"
            id="expertise"
            hint="Comma-separated tags — e.g. Blender, 3D Modeling, Animation"
          >
            <Input
              id="expertise"
              value={form.expertiseInput}
              onChange={(e) => set("expertiseInput", e.target.value)}
              placeholder="Blender, 3D Modeling, Texturing, Animation"
              className="h-9 text-sm"
            />
          </Field>

          {/* LinkedIn & Instagram */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="LinkedIn URL" id="linkedin">
              <Input
                id="linkedin"
                value={form.linkedinUrl}
                onChange={(e) => set("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/…"
                className="h-9 text-sm"
              />
            </Field>
            {/* <Field label="Instagram URL" id="instagram">
              <Input
                id="instagram"
                value={form.instagramUrl}
                onChange={(e) => set("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/…"
                className="h-9 text-sm"
              />
            </Field> */}
          </div>

          {/* Rating & Students */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rating (1–5)" id="rating">
              <Input
                id="rating"
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
                className="h-9 text-sm"
              />
            </Field>
            <Field label="Learners count" id="students">
              <Input
                id="students"
                type="number"
                min={0}
                value={form.studentsCount}
                onChange={(e) => set("studentsCount", e.target.value)}
                placeholder="1200"
                className="h-9 text-sm"
              />
            </Field>
          </div>

          {/* Phone */}
          <Field label="Phone (optional)" id="phone">
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="10-digit mobile"
              className="h-9 text-sm"
            />
          </Field>

          {/* Bio */}
          <Field label="Bio (optional)" id="bio">
            <textarea
              id="bio"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Short bio shown on the profile card…"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-border flex-shrink-0">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 text-white"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                Saving…
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Add teacher"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
// DELETE /api/mentors/:id → soft-deletes (sets isActive:false on User record)
// The user can still be seen (inactive) in Staff Management
const DeleteModal = ({
  mentor,
  onClose,
  onDeleted,
}: {
  mentor: Mentor;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) => {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/mentors/${mentor._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to remove mentor");
        return;
      }
      toast.success("Teacher removed from public listing. Their staff account is now inactive.");
      onDeleted(mentor._id);
      onClose();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-destructive">Remove teacher</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
              <p>
                This will hide <strong>{mentor.name}</strong> from the teachers listing and deactivate their staff account login.
              </p>
              <p className="text-xs opacity-80">
                Their account remains in Staff Management and can be reactivated there.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirm}
              disabled={deleting}
            >
              {deleting ? (
                <><Loader2 size={13} className="animate-spin mr-2" />Removing…</>
              ) : (
                "Remove"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Teachers = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Mentor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

const navigate = useNavigate();
  const fetchMentors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/mentors`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setMentors(data.data ?? []);
      } else {
        setError(data.message || "Failed to load mentors.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMentors(); }, []);

  const handleSaved = (mentor: Mentor) => {
    setMentors((prev) => {
      const idx = prev.findIndex((m) => m._id === mentor._id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = mentor;
        return next;
      }
      return [mentor, ...prev];
    });
  };

  const handleDeleted = (id: string) => {
    setMentors((prev) => prev.filter((m) => m._id !== id));
  };

  const openAdd = () => { setEditingMentor(null); setModalOpen(true); };
  const openEdit = (m: Mentor) => { setEditingMentor(m); setModalOpen(true); };

  return (
    <>
      {modalOpen && (
        <MentorModal
          editing={editingMentor}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          mentor={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      <AdminLayout
        title="Teachers / Mentors"
        subtitle="Manage faculty profile — photo, designation, expertise, social links. Account credentials are managed in Staff Management."
        actions={
          <Button type="button" size="sm" onClick={openAdd} className="gap-1.5 text-white">
            <Plus size={14} />
            Add teacher
          </Button>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <AlertTriangle size={28} className="text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchMentors}>
              Try again
            </Button>
          </div>
        ) : mentors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center text-muted-foreground">
            <Users size={40} strokeWidth={1.2} />
            <div>
              <p className="text-sm font-medium text-foreground">No teachers yet</p>
              <p className="text-xs mt-1">
                Click "Add teacher" to create one, or add a mentor from Staff Management.
              </p>
            </div>
            <Button size="sm" onClick={openAdd} className="gap-1.5">
              <Plus size={13} /> Add first teacher
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor._id}
                mentor={mentor}
                onEdit={() => openEdit(mentor)}
                onDelete={() => setDeleteTarget(mentor)}
                onManageProfile={() => navigate(`/admin/mentor-profile/${mentor._id}`)} 
                deleting={deletingId === mentor._id}
              />
            ))}
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default Teachers;