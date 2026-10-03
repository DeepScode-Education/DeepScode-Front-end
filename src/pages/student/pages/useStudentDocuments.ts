import { useCallback, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Briefcase,
  FileText,
  IdCard,
  ScrollText,
  UserSquare2,
} from "lucide-react";
import {
  studentDocumentApi,
  type DocumentSlotKey as ApiSlotKey,
  type StudentDocumentApiRecord,
} from "@/integrations/client";



export type DocumentSlotKey = ApiSlotKey;

export type DocumentStatus = "verified" | "under_review" | "action_required" | "empty";

export type DocumentFileType = "pdf" | "image" | "doc";

export interface StudentDocument {
  id: DocumentSlotKey;
  name: string;
  description: string;
  status: DocumentStatus;
  fileType: DocumentFileType | null;
  fileSize: string | null;
  uploadedAt: string | null; // ISO date string, null when empty
  fileUrl: string | null;
  note?: string;
}

interface UseStudentDocumentsReturn {
  documents: StudentDocument[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  uploadDocument: (id: DocumentSlotKey, file: File) => Promise<void>;
  replaceDocument: (id: DocumentSlotKey, file: File) => Promise<void>;
  downloadDocument: (id: DocumentSlotKey) => Promise<void>;
  deleteDocument: (id: DocumentSlotKey) => Promise<void>;
  busyId: DocumentSlotKey | null;
  busyAction: "upload" | "replace" | "download" | "delete" | null;
}

// 

export const SLOT_META: Record <
  DocumentSlotKey,
  { label: string; description: string; icon: LucideIcon }
> = {
  aadhaar: {
    label: "Aadhaar Card",
    description: "Government-issued identity proof",
    icon: IdCard,
  },
  pan: {
    label: "PAN Card",
    description: "Permanent Account Number card",
    icon: IdCard,
  },
  resume: {
    label: "Resume",
    description: "Your latest CV / resume",
    icon: FileText,
  },
  offer_letter: {
    label: "Offer Letter",
    description: "Placement / internship offer letter",
    icon: Briefcase,
  },
  passport_photo: {
    label: "Passport Size Photo",
    description: "Recent passport-size photograph",
    icon: UserSquare2,
  },
  course_certificate: {
    label: "Course Certificate",
    description: "Issued on successful course completion",
    icon: Award,
  },
};

export const STATUS_META: Record <
  DocumentStatus,
  { label: string; tone: "success" | "warning" | "neutral" }
> = {
  verified: { label: "Verified", tone: "success" },
  under_review: { label: "Under Review", tone: "warning" },
  action_required: { label: "Action Required", tone: "warning" },
  empty: { label: "Not Uploaded", tone: "neutral" },
};

export const DEFAULT_DOC_ICON: LucideIcon = ScrollText;

// The fixed order in which slots are always rendered, regardless of what
// order the backend returns them in.
const SLOT_ORDER: DocumentSlotKey[] = [
  "aadhaar",
  "pan",
  "resume",
  "offer_letter",
  "passport_photo",
  "course_certificate",
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatBytes = (bytes: number | null | undefined): string | null => {
  if (bytes === null || bytes === undefined) return null;
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
};

const mapApiRecord = (rec: StudentDocumentApiRecord): StudentDocument => {
  const meta = SLOT_META[rec.id];
  return {
    id: rec.id,
    name: meta?.label ?? rec.id,
    description: meta?.description ?? "",
    status: rec.status,
    fileType: rec.fileType,
    fileSize: formatBytes(rec.fileSize),
    uploadedAt: rec.uploadedAt,
    fileUrl: rec.fileUrl,
    note: rec.note || undefined,
  };
};

// Ensures every fixed slot is always present in the list, in the correct
// order, even if the backend response is missing one for some reason.
const ensureAllSlotsPresent = (docs: StudentDocument[]): StudentDocument[] => {
  const byId = new Map(docs.map((d) => [d.id, d]));
  return SLOT_ORDER.map((slotId) => {
    const existing = byId.get(slotId);
    if (existing) return existing;
    const meta = SLOT_META[slotId];
    return {
      id: slotId,
      name: meta.label,
      description: meta.description,
      status: "empty" as const,
      fileType: null,
      fileSize: null,
      uploadedAt: null,
      fileUrl: null,
      note: undefined,
    };
  });
};


const fetchDocumentsFromApi = async (): Promise<StudentDocument[]> => {
  const res = await studentDocumentApi.getMine();
  const mapped = (res.data ?? []).map(mapApiRecord);
  return ensureAllSlotsPresent(mapped);
};

const uploadDocumentToApi = async (
  id: DocumentSlotKey,
  file: File
): Promise<{ fileSize: string | null; fileType: DocumentFileType | null; uploadedAt: string | null }> => {
  const res = await studentDocumentApi.upload(id, file);
  const mapped = mapApiRecord(res.data);
  return { fileSize: mapped.fileSize, fileType: mapped.fileType, uploadedAt: mapped.uploadedAt };
};

const replaceDocumentInApi = async (
  id: DocumentSlotKey,
  file: File
): Promise<{ fileSize: string | null; fileType: DocumentFileType | null; uploadedAt: string | null }> => {
  const res = await studentDocumentApi.replace(id, file);
  const mapped = mapApiRecord(res.data);
  return { fileSize: mapped.fileSize, fileType: mapped.fileType, uploadedAt: mapped.uploadedAt };
};

// Download itself is just opening/streaming the already-known fileUrl —
// there's no separate network call needed beyond what the list already
// gave us, but we keep this as an async no-op so the busy-state UX pattern
// (spinner while "downloading") stays consistent and easy to extend later
// (e.g. if a signed/temporary URL endpoint is added).
const downloadDocumentFromApi = async (_id: DocumentSlotKey): Promise<void> => {
  return Promise.resolve();
};

const deleteDocumentFromApi = async (id: DocumentSlotKey): Promise<void> => {
  await studentDocumentApi.remove(id);
};


export const useStudentDocuments = (): UseStudentDocumentsReturn => {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<DocumentSlotKey | null>(null);
  const [busyAction, setBusyAction] = useState<UseStudentDocumentsReturn["busyAction"]>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDocumentsFromApi();
      if (!mountedRef.current) return;
      setDocuments(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(
        err instanceof Error ? err.message : "Something went wrong while loading your documents."
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => load(), [load]);

  const uploadDocument = useCallback(async (id: DocumentSlotKey, file: File) => {
    setBusyId(id);
    setBusyAction("upload");
    try {
      const result = await uploadDocumentToApi(id, file);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                fileType: result.fileType,
                fileSize: result.fileSize,
                uploadedAt: result.uploadedAt,
                fileUrl: doc.fileUrl, // refreshed below via refetch if needed
                status: "under_review",
                note: "Uploaded — awaiting verification.",
              }
            : doc
        )
      );
      // Ensure fileUrl and any other server-computed fields are fresh.
      await load();
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  }, [load]);

  const replaceDocument = useCallback(async (id: DocumentSlotKey, file: File) => {
    setBusyId(id);
    setBusyAction("replace");
    try {
      await replaceDocumentInApi(id, file);
      await load();
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  }, [load]);

  const downloadDocument = useCallback(async (id: DocumentSlotKey) => {
    setBusyId(id);
    setBusyAction("download");
    try {
      await downloadDocumentFromApi(id);
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  }, []);

  const deleteDocument = useCallback(async (id: DocumentSlotKey) => {
    setBusyId(id);
    setBusyAction("delete");
    try {
      await deleteDocumentFromApi(id);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                fileType: null,
                fileSize: null,
                uploadedAt: null,
                fileUrl: null,
                status: "empty",
                note: undefined,
              }
            : doc
        )
      );
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  }, []);

  return {
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
  };
};

export default useStudentDocuments;