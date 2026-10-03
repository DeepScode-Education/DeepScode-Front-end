import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useCareers } from "@/hooks/useCareers";
import type { CareerPayload, WorkMode, EmploymentType, CareerStatus } from "@/types/career";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Plus,
  X,
  ChevronLeft,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

/* ──────────────────────────────────────── constants ── */

const DEPARTMENTS = [
  "Engineering", "Design", "Marketing", "Sales",
  "HR", "Operations", "Finance", "Support", "Other",
];

const WORK_MODES: WorkMode[] = ["Remote", "Hybrid", "Onsite"];

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "Full Time", "Part Time", "Internship", "Contract", "Freelance",
];

const STATUSES: CareerStatus[] = ["Draft", "Published", "Closed"];

/* ──────────────────────────────────── initial state ── */

const EMPTY_PAYLOAD: CareerPayload = {
  title: "",
  department: "",
  location: "",
  workMode: "Onsite",
  employmentType: "Full Time",
  experience: { min: 0, max: 2 },
  salary: { min: 0, max: 0 },
  openings: 1,
  description: "",
  responsibilities: [],
  requirements: [],
  skills: [],
  benefits: [],
  featured: false,
  status: "Draft",
  applicationDeadline: "",
};

/* ──────────────────────────────── validation ── */

type Errors = Partial<Record<keyof CareerPayload | "experience" | "salary", string>>;

function validate(form: CareerPayload): Errors {
  const e: Errors = {};
  if (!form.title.trim()) e.title = "Job title is required";
  else if (form.title.length < 3) e.title = "Must be at least 3 characters";
  if (!form.department) e.department = "Department is required";
  if (!form.location.trim()) e.location = "Location is required";
  if (!form.description.trim()) e.description = "Description is required";
  if (form.experience.min < 0) e.experience = "Min experience can't be negative";
  if (form.experience.max < form.experience.min)
    e.experience = "Max experience must be ≥ min";
  if (form.openings < 1) e.openings = "At least 1 opening required";
  return e;
}

/* ────────────────────────────── array tag field ── */

const TagField = ({
  label,
  hint,
  items,
  onChange,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (next: string[]) => void;
}) => {
  const [draft, setDraft] = useState("");

  const add = () => {
    const val = draft.trim();
    if (!val || items.includes(val)) return;
    onChange([...items, val]);
    setDraft("");
  };

  const remove = (i: number) =>
    onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      {hint && (
        <p className="text-xs text-muted-foreground -mt-1">{hint}</p>
      )}

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Type and press Enter or Add"
          className="text-sm h-9"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="shrink-0 h-9"
        >
          <Plus size={14} />
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {items.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-1 rounded-full bg-secondary border border-border px-2.5 py-0.5 text-xs font-medium text-foreground"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────── section wrapper ── */

const Section = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-xl border border-border bg-card px-5 py-5",
      className
    )}
  >
    <h2 className="mb-4 text-sm font-semibold text-gray-800 uppercase tracking-wider">
      {title}
    </h2>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

/* ──────────────────────────── row helper ── */

const Row = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
    {children}
  </div>
);

/* ──────────────────────────────────── field ── */

const Field = ({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <Label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </Label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500">
        <AlertCircle size={11} />
        {error}
      </p>
    )}
  </div>
);

/* ──────────────────────────────── page ── */

export default function CareerFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { getCareer, createCareer, updateCareer, saving } = useCareers();

  const [form, setForm] = useState<CareerPayload>(EMPTY_PAYLOAD);
  const [errors, setErrors] = useState<Errors>({});
  const [fetchError, setFetchError] = useState("");
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  /* load existing career */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const career = await getCareer(id);
        if (!career) {
          setFetchError("Career not found.");
          return;
        }
        setForm({
          title: career.title,
          department: career.department,
          location: career.location,
          workMode: career.workMode,
          employmentType: career.employmentType,
          experience: career.experience,
          salary: { min: career.salary?.min ?? 0, max: career.salary?.max ?? 0 },
          openings: career.openings,
          description: career.description,
          responsibilities: career.responsibilities ?? [],
          requirements: career.requirements ?? [],
          skills: career.skills ?? [],
          benefits: career.benefits ?? [],
          featured: career.featured,
          status: career.status,
          applicationDeadline: career.applicationDeadline?.slice(0, 10) ?? "",
        });
      } catch (err: any) {
        setFetchError(err.message || "Failed to load career.");
      } finally {
        setFetchLoading(false);
      }
    })();
  }, [id]);

  /* helpers */
  const set = <K extends keyof CareerPayload>(key: K, value: CareerPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const payload: CareerPayload = {
        ...form,
        applicationDeadline: form.applicationDeadline || undefined,
      };

      if (isEdit && id) {
        await updateCareer(id, payload);
      } else {
        await createCareer(payload);
      }
      navigate("/admin/careers");
    } catch (err: any) {
      setFetchError(err.message || "Save failed. Please try again.");
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout title={isEdit ? "Edit Position" : "New Position"}>
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={22} className="animate-spin text-[#0037FF]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? "Edit Position" : "New Position"}
      subtitle={
        isEdit
          ? "Update the job opening details"
          : "Fill in the details to post a new job opening"
      }
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => navigate("/admin/careers")}
        >
          <ChevronLeft size={15} />
          Back to Careers
        </Button>
      }
    >
      {fetchError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={15} />
          {fetchError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* ── left column (2/3) ── */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Section title="Basic Info">
              <Field label="Job Title" error={errors.title} required>
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className={cn(
                    "text-sm",
                    errors.title && "border-red-400 focus-visible:ring-red-300"
                  )}
                />
              </Field>

              <Row>
                <Field label="Department" error={errors.department} required>
                  <Select
                    value={form.department}
                    onValueChange={(v) => set("department", v)}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-9 text-sm",
                        errors.department && "border-red-400"
                      )}
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Location" error={errors.location} required>
                  <Input
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="e.g. Bengaluru / Remote"
                    className={cn(
                      "text-sm",
                      errors.location && "border-red-400"
                    )}
                  />
                </Field>
              </Row>

              <Row>
                <Field label="Work Mode">
                  <Select
                    value={form.workMode}
                    onValueChange={(v) => set("workMode", v as WorkMode)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_MODES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Employment Type">
                  <Select
                    value={form.employmentType}
                    onValueChange={(v) =>
                      set("employmentType", v as EmploymentType)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </Row>

              <Field label="Job Description" error={errors.description} required>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the role, team, and what success looks like…"
                  rows={5}
                  className={cn(
                    "text-sm resize-none",
                    errors.description && "border-red-400"
                  )}
                />
              </Field>
            </Section>

            <Section title="Requirements & Skills">
              <TagField
                label="Responsibilities"
                hint="Key day-to-day tasks for this role"
                items={form.responsibilities}
                onChange={(v) => set("responsibilities", v)}
              />
              <TagField
                label="Requirements"
                hint="Must-have qualifications and experience"
                items={form.requirements}
                onChange={(v) => set("requirements", v)}
              />
              <TagField
                label="Skills"
                hint="Technical and soft skills"
                items={form.skills}
                onChange={(v) => set("skills", v)}
              />
              <TagField
                label="Benefits"
                hint="Perks and benefits offered"
                items={form.benefits}
                onChange={(v) => set("benefits", v)}
              />
            </Section>
          </div>

          {/* ── right column (1/3) ── */}
          <div className="flex flex-col gap-4">
            <Section title="Publish">
              <Field label="Status">
                <Select
                  value={form.status}
                  onValueChange={(v) => set("status", v as CareerStatus)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Application Deadline">
                <Input
                  type="date"
                  value={form.applicationDeadline ?? ""}
                  onChange={(e) =>
                    set("applicationDeadline", e.target.value)
                  }
                  className="text-sm h-9"
                />
              </Field>

              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Featured</p>
                  <p className="text-xs text-muted-foreground">
                    Pinned at the top of the listing
                  </p>
                </div>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => set("featured", v)}
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-[#0037FF] hover:bg-[#0030e0] text-white gap-2"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {saving
                  ? "Saving…"
                  : isEdit
                  ? "Save Changes"
                  : "Create Position"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/admin/careers")}
              >
                Cancel
              </Button>
            </Section>

            <Section title="Compensation">
              <Field label="Number of Openings" error={errors.openings as string}>
                <Input
                  type="number"
                  min={1}
                  value={form.openings}
                  onChange={(e) =>
                    set("openings", Number(e.target.value))
                  }
                  className="text-sm h-9"
                />
              </Field>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Experience (years)
                </Label>
                {errors.experience && (
                  <p className="mb-1.5 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={11} />
                    {errors.experience}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Min</span>
                    <Input
                      type="number"
                      min={0}
                      value={form.experience.min}
                      onChange={(e) =>
                        set("experience", {
                          ...form.experience,
                          min: Number(e.target.value),
                        })
                      }
                      className="text-sm h-9"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Max</span>
                    <Input
                      type="number"
                      min={0}
                      value={form.experience.max}
                      onChange={(e) =>
                        set("experience", {
                          ...form.experience,
                          max: Number(e.target.value),
                        })
                      }
                      className="text-sm h-9"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Salary Range (INR / yr)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Min</span>
                    <Input
                      type="number"
                      min={0}
                      value={form.salary.min}
                      onChange={(e) =>
                        set("salary", {
                          ...form.salary,
                          min: Number(e.target.value),
                        })
                      }
                      className="text-sm h-9"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Max</span>
                    <Input
                      type="number"
                      min={0}
                      value={form.salary.max}
                      onChange={(e) =>
                        set("salary", {
                          ...form.salary,
                          max: Number(e.target.value),
                        })
                      }
                      className="text-sm h-9"
                    />
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}