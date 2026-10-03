// src/admin/components/lead-detail/ParentInfoCard.tsx
//
// Shared by LeadDetail.tsx (admin) and CounsellorLeadDetail.tsx — single
// source of truth for the Parent Information section so the two pages don't
// drift apart. Both roles can edit per the permission matrix.

import { useState, type ReactNode } from "react";
import { Pencil, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lead } from "../hooks/useLeads";

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex items-start justify-between gap-2">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="text-right font-medium">{value}</span>
  </div>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
    {children}
  </div>
);

export interface ParentInfoFormPayload {
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianMobile?: string;
}

interface ParentInfoCardProps {
  lead: Lead;
  onSave: (payload: ParentInfoFormPayload) => Promise<any>;
}

export const ParentInfoCard = ({ lead, onSave }: ParentInfoCardProps) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ParentInfoFormPayload>({
    fatherName: lead.parentInfo?.fatherName ?? "",
    motherName: lead.parentInfo?.motherName ?? "",
    guardianName: lead.parentInfo?.guardianName ?? "",
    guardianMobile: lead.parentInfo?.guardianMobile ?? "",
  });

  const startEditing = () => {
    setForm({
      fatherName: lead.parentInfo?.fatherName ?? "",
      motherName: lead.parentInfo?.motherName ?? "",
      guardianName: lead.parentInfo?.guardianName ?? "",
      guardianMobile: lead.parentInfo?.guardianMobile ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Parent Information</h3>
        {!editing ? (
          <button
            onClick={startEditing}
            className="flex items-center gap-1 text-xs text-[#0037FF] hover:underline"
          >
            <Pencil size={12} /> Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 text-xs font-semibold text-white hover:underline"
            >
              <Save size={12} /> {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="space-y-2 text-sm">
          <Row label="Father's Name" value={lead.parentInfo?.fatherName || "—"} />
          <Row label="Mother's Name" value={lead.parentInfo?.motherName || "—"} />
          <Row label="Guardian Name" value={lead.parentInfo?.guardianName || "—"} />
          <Row label="Guardian Mobile" value={lead.parentInfo?.guardianMobile || "—"} />
        </div>
      ) : (
        <div className="space-y-2.5">
          <Field label="Father's Name">
            <input
              value={form.fatherName}
              onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
          </Field>
          <Field label="Mother's Name">
            <input
              value={form.motherName}
              onChange={(e) => setForm({ ...form, motherName: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
          </Field>
          <Field label="Guardian Name">
            <input
              value={form.guardianName}
              onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
          </Field>
          <Field label="Guardian Mobile">
            <input
              value={form.guardianMobile}
              onChange={(e) => setForm({ ...form, guardianMobile: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
          </Field>
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="text-white">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentInfoCard;