// pages/student/Documents.tsx
//
// Student "Documents" page — a fixed set of 6 required documents
// (Aadhaar, PAN, Resume, Offer Letter, Passport Photo, Course Certificate).
// Students can Upload (when empty), View, Download, Replace, and Delete
// (when filled). All data + actions come from useStudentDocuments — this
// component only renders state and wires up interactions.

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  Eye,
  Loader2,
  RefreshCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import StudentLayout from "../components/StudentLayout";
import StatusBadge from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useStudentDocuments,
  SLOT_META,
  STATUS_META,
  DEFAULT_DOC_ICON,
  type StudentDocument,
  type DocumentSlotKey,
} from "./useStudentDocuments";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton / error views
// ─────────────────────────────────────────────────────────────────────────────

const DocumentsSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-lg bg-secondary" />
          <div className="h-5 w-20 rounded-full bg-secondary" />
        </div>
        <div className="mt-4 h-4 w-3/4 rounded bg-secondary" />
        <div className="mt-2 h-3 w-1/2 rounded bg-secondary" />
        <div className="mt-5 flex gap-2">
          <div className="h-8 flex-1 rounded-lg bg-secondary" />
          <div className="h-8 flex-1 rounded-lg bg-secondary" />
          <div className="h-8 flex-1 rounded-lg bg-secondary" />
        </div>
      </div>
    ))}
  </div>
);

const DocumentsError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50/50 px-6 py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
      <AlertTriangle size={22} />
    </div>
    <p className="mt-4 text-sm font-semibold text-foreground">Couldn't load your documents</p>
    <p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p>
    <Button size="sm" className="mt-4 text-white" onClick={onRetry}>
      <RefreshCcw size={14} className="mr-1" /> Try again
    </Button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Document card
// ─────────────────────────────────────────────────────────────────────────────

interface DocumentCardProps {
  doc: StudentDocument;
  isBusy: boolean;
  busyAction: "upload" | "replace" | "download" | "delete" | null;
  onView: (doc: StudentDocument) => void;
  onDownload: (doc: StudentDocument) => void;
  onUploadClick: (doc: StudentDocument) => void;
  onDeleteClick: (doc: StudentDocument) => void;
}

const DocumentCard = ({
  doc,
  isBusy,
  busyAction,
  onView,
  onDownload,
  onUploadClick,
  onDeleteClick,
}: DocumentCardProps) => {
  const meta = SLOT_META[doc.id];
  const Icon = meta?.icon ?? DEFAULT_DOC_ICON;
  const status = STATUS_META[doc.status];
  const isEmpty = doc.status === "empty";

  return (
    <div
      className={`flex flex-col rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm ${
        doc.status === "action_required" ? "border-amber-200" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-[#0037FF]">
          <Icon size={18} />
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </div>

      <h3 className="mt-4 text-sm font-semibold leading-snug text-foreground">{meta.label}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>

      {!isEmpty && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{doc.fileSize}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
          <span>Uploaded {formatDate(doc.uploadedAt)}</span>
        </div>
      )}

      {doc.note && (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-700">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          {doc.note}
        </p>
      )}

      <div className="mt-5 flex items-center gap-2">
        {isEmpty ? (
          <Button
            size="sm"
            className="w-full text-white"
            disabled={isBusy}
            onClick={() => onUploadClick(doc)}
          >
            {isBusy && busyAction === "upload" ? (
              <Loader2 size={13} className="mr-1 animate-spin" />
            ) : (
              <Upload size={13} className="mr-1" />
            )}
            {isBusy && busyAction === "upload" ? "Uploading..." : "Upload"}
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(doc)}>
              <Eye size={13} className="mr-1" /> View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isBusy}
              onClick={() => onDownload(doc)}
            >
              {isBusy && busyAction === "download" ? (
                <Loader2 size={13} className="mr-1 animate-spin" />
              ) : (
                <Download size={13} className="mr-1" />
              )}
              {isBusy && busyAction === "download" ? "..." : "Download"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isBusy}
              onClick={() => onUploadClick(doc)}
              title="Replace / re-upload"
            >
              {isBusy && busyAction === "replace" ? (
                <Loader2 size={13} className="mr-1 animate-spin" />
              ) : (
                <RefreshCcw size={13} className="mr-1" />
              )}
              {isBusy && busyAction === "replace" ? "..." : "Replace"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => onDeleteClick(doc)}
              title="Delete document"
              className="px-2.5 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              {isBusy && busyAction === "delete" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const Documents = () => {
  const {
    documents,
    loading,
    error,
    refetch,
    uploadDocument,
    replaceDocument,
    downloadDocument,
    deleteDocument,
    busyId,
    busyAction,
  } = useStudentDocuments();

  const [previewDoc, setPreviewDoc] = useState<StudentDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentDocument | null>(null);
  const pendingUploadDocRef = useRef<StudentDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const summary = useMemo(() => {
    const total = documents.length;
    const verified = documents.filter((d) => d.status === "verified").length;
    const pending = documents.filter(
      (d) => d.status === "under_review" || d.status === "action_required"
    ).length;
    const missing = documents.filter((d) => d.status === "empty").length;
    return { total, verified, pending, missing };
  }, [documents]);

  const handleView = (doc: StudentDocument) => setPreviewDoc(doc);

//   const handleDownload = async (doc: StudentDocument) => {
//     try {
//       await downloadDocument(doc.id);
//       toast.success(`Downloading ${SLOT_META[doc.id].label}…`);
//     } catch {
//       toast.error("Download failed. Please try again.");
//     }
//   };
const handleDownload = async (doc: StudentDocument) => {
  try {
    await downloadDocument(doc.id);
    if (doc.fileUrl) window.open(doc.fileUrl, "_blank");
    toast.success(`Opening ${SLOT_META[doc.id].label}…`);
  } catch {
    toast.error("Download failed. Please try again.");
  }
};
  const handleUploadClick = (doc: StudentDocument) => {
    pendingUploadDocRef.current = doc;
    fileInputRef.current?.click();
  };

  const handleFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    const doc = pendingUploadDocRef.current;
    pendingUploadDocRef.current = null;
    if (!file || !doc) return;

    const isReplace = doc.status !== "empty";
    try {
      if (isReplace) {
        await replaceDocument(doc.id, file);
        toast.success(`${SLOT_META[doc.id].label} re-uploaded — awaiting verification.`);
      } else {
        await uploadDocument(doc.id, file);
        toast.success(`${SLOT_META[doc.id].label} uploaded — awaiting verification.`);
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDocument(deleteTarget.id);
      toast.success(`${SLOT_META[deleteTarget.id].label} deleted.`);
    } catch {
      toast.error("Failed to delete document. Please try again.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <StudentLayout
      title="Documents"
      subtitle="Upload and manage your Aadhaar, PAN, resume, and other required documents."
    >
      {/* Hidden input reused for every Upload/Replace action */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Summary strip */}
      {!loading && !error && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-lg sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] text-muted-foreground">Total</p>
            <p className="mt-0.5 text-lg font-bold">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] text-muted-foreground">Verified</p>
            <p className="mt-0.5 text-lg font-bold text-emerald-600">{summary.verified}</p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] text-muted-foreground">Needs Action</p>
            <p className="mt-0.5 text-lg font-bold text-amber-600">{summary.pending}</p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] text-muted-foreground">Not Uploaded</p>
            <p className="mt-0.5 text-lg font-bold text-muted-foreground">{summary.missing}</p>
          </div>
        </div>
      )}

      {loading ? (
        <DocumentsSkeleton />
      ) : error ? (
        <DocumentsError message={error} onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              isBusy={busyId === doc.id}
              busyAction={busyId === doc.id ? busyAction : null}
              onView={handleView}
              onDownload={handleDownload}
              onUploadClick={handleUploadClick}
              onDeleteClick={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Preview dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3 pr-6">
              <span className="truncate">{previewDoc && SLOT_META[previewDoc.id].label}</span>
            </DialogTitle>
          </DialogHeader>

          {previewDoc && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge tone={STATUS_META[previewDoc.status].tone}>
                  {STATUS_META[previewDoc.status].label}
                </StatusBadge>
                <span className="text-xs text-muted-foreground">
                  {previewDoc.fileSize} · Uploaded {formatDate(previewDoc.uploadedAt)}
                </span>
              </div>

              <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 text-center">
                {(() => {
                  const Icon = SLOT_META[previewDoc.id]?.icon ?? DEFAULT_DOC_ICON;
                  return <Icon size={32} className="text-muted-foreground" />;
                })()}
                <p className="max-w-xs text-xs text-muted-foreground">
                  Live preview isn't available yet — connect the backend to render the actual file here.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPreviewDoc(null)}>
              <X size={14} className="mr-1" /> Close
            </Button>
            {previewDoc && (
              <Button
                className="text-white"
                disabled={busyId === previewDoc.id && busyAction === "download"}
                onClick={() => handleDownload(previewDoc)}
              >
                {busyId === previewDoc.id && busyAction === "download" ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <Download size={14} className="mr-1" />
                )}
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} /> Delete Document
            </DialogTitle>
          </DialogHeader>

          {deleteTarget && (
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{SLOT_META[deleteTarget.id].label}</span>?
              This action cannot be undone — you'll need to upload it again.
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={busyId === deleteTarget?.id && busyAction === "delete"}
              onClick={confirmDelete}
            >
              {busyId === deleteTarget?.id && busyAction === "delete" ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <Trash2 size={14} className="mr-1" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
};

export default Documents;