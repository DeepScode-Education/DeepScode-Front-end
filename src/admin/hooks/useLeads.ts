import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};

// ── Types ──────────────────────────────────────────────────────────────────────
export interface LeadFees {
  min?: number;
  max?: number;
  originalFee?: number | null;       // NEW — "Original Course Fee"
  negotiatedAmount?: number | null;
}

export interface LeadParentInfo {
  // NEW expanded fields (per spec: Father / Mother / Guardian Name / Guardian Mobile)
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianMobile?: string;
  // legacy fields — kept for backward compat with old leads
  name?: string;
  relation?: string;
}

// NEW — structured, append-only fee negotiation history entry
export interface LeadFeeHistoryEntry {
  previousAmount: number | null;
  newAmount: number;
  changedBy?: { _id: string; fullName: string; email?: string; role?: string } | string;
  role: string;
  reason?: string;
  remarks?: string;
  createdAt: string;
}

export interface LeadDocument {
  _id?: string;
  name: string;
  url: string;
  type?: string;
  uploadedAt: string;
}

export interface LeadPaymentPlan {
  mode?: "full" | "emi" | null;
  emiMonths?: number | null;
  downPayment?: number | null;
  notes?: string;
}

export interface LeadConversionRequest {
  status: "none" | "pending" | "approved" | "rejected";
  requestedBy?: { _id: string; fullName: string; email: string; role: string } | string | null;
  requestedAt?: string | null;
  requestNote?: string;
  finalFee?: number | null;
  approvedBy?: { _id: string; fullName: string } | string | null;
  approvedAt?: string | null;
  rejectedBy?: { _id: string; fullName: string } | string | null;
  rejectedAt?: string | null;
  rejectionReason?: string;
}

export interface Lead {
  _id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  // course: string;
  course: string | { _id: string; title: string; slug?: string; category?: string };
  leadStatus: "new" | "contacted" | "interested" | "follow-up" | "converted" | "lost";
  assignedTo: string | null;
  source: string;
  remarks: string;
  lastContactedAt: string | number | null;
  nextFollowUpDate: string | number | null;
  createdAt: string;
  branch?: string | null;
  fees?: LeadFees;
  parentInfo?: LeadParentInfo;
  paymentPlan?: LeadPaymentPlan;
  feeHistory?: LeadFeeHistoryEntry[];   // NEW
  conversionRequest?: LeadConversionRequest;
  demoCompleted?: boolean;
  demoCompletedAt?: string | null;
  priority?: "low" | "medium" | "high" | "urgent";
  leadHealth?: string;
  demoScheduledAt?: string | null;
  demoMode?: "online" | "offline" | null;
  demoFeedback?: string | null;
  demoRating?: number | null;
  lostReason?: string | null;
  competitor?: string | null;
  documents?: LeadDocument[];
  objections?: string[];
  // ── NEW: independent fee-collection counsellor assignment ──────────────────
  // Separate from `assignedTo` (the lead/demo/follow-up counsellor).
  // Set by admin only, and propagated onto the student record after
  // conversion so fee-collection dashboards can scope by this field.
  feeCollectionCounsellor?: string | null;
  feeCollectionCounsellorId?: string | null;
}

export interface LeadPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// interface UseLeadsParams {
//   page?: number;
//   search?: string;
//   status?: string;
//   course?: string;
// }


interface UseLeadsParams {
  page?: number;
  search?: string;
  status?: string;
  course?: string;
  leadHealth?: string;
}

// ── useLeads ───────────────────────────────────────────────────────────────────
// export const useLeads = (params: UseLeadsParams = {}) => {
//   const { page = 1, search = "", status = "", course = "" } = params;
//   const [leads, setLeads] = useState<Lead[]>([]);
//   const [pagination, setPagination] = useState<LeadPagination | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchLeads = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const qs = new URLSearchParams({
//         page: String(page),
//         limit: "20",
//         ...(search && { search }),
//         ...(status && { status }),
//         ...(course && { course }),
//       });

//       const res = await fetch(`${API_BASE}/api/leads?${qs}`, {
//         headers: authHeaders(),
//       });

//       if (res.status === 401) {
//         setError("Session expired. Please log in again.");
//         setLeads([]);
//         return;
//       }

//       const json = await res.json();
//       if (json.success) {
//   const sorted = [...json.data].sort(
//     (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//   );

//   setLeads(sorted);
//   setPagination(json.pagination);
// }else {
//         setError(json.message || "Failed to fetch leads");
//       }
//     } catch (err) {
//       setError("Failed to fetch leads");
//     } finally {
//       setLoading(false);
//     }
//   }, [page, search, status, course]);

//   useEffect(() => {
//     fetchLeads();
//   }, [fetchLeads]);

//   return { leads, pagination, loading, error, refetch: fetchLeads };
// };


export const useLeads = (params: UseLeadsParams = {}) => {
  const { page = 1, search = "", status = "", course = "", leadHealth = "" } = params;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<LeadPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: "50",
        ...(search && { search }),
        ...(status && { status }),
        ...(course && { course }),
        ...(leadHealth && { leadHealth }),
      });

      const res = await fetch(`${API_BASE}/api/leads?${qs}`, { headers: authHeaders() });

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setLeads([]);
        return;
      }

      const json = await res.json();
      if (json.success) {
        const sorted = [...json.data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setLeads(sorted);
        setPagination(json.pagination);
      } else {
        setError(json.message || "Failed to fetch leads");
      }
    } catch (err) {
      setError("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, course, leadHealth]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return { leads, pagination, loading, error, refetch: fetchLeads };
};


// ── useLeadDashboard ───────────────────────────────────────────────────────────
interface UseLeadDashboardParams {
  search?: string;
  status?: string;
  course?: string;
  leadHealth?: string;
}

export const useLeadDashboard = (params: UseLeadDashboardParams = {}) => {
  const { search = "", status = "", course = "", leadHealth = "" } = params;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qs = new URLSearchParams({
      ...(search && { search }),
      ...(status && { status }),
      ...(course && { course }),
      ...(leadHealth && { leadHealth }),
    });

    setLoading(true);
    fetch(`${API_BASE}/api/leads/dashboard?${qs}`, { headers: authHeaders() })
      .then((r) => {
        if (r.status === 401) { setError("Unauthorized"); return null; }
        return r.json();
      })
      .then((json) => { if (json?.success) setStats(json.data); })
      .catch(() => setError("Failed to fetch dashboard stats"))
      .finally(() => setLoading(false));
  }, [search, status, course, leadHealth]);

  return { stats, loading, error };
};

// ── usePendingConversions ───────────────────────────────────────────────────────
// Admin / Super Admin only — feeds the "Pending Conversion Requests" page.
export const usePendingConversions = () => {
  const [requests, setRequests] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/leads/conversion-requests/pending`, {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setRequests([]);
        return;
      }
      if (res.status === 403) {
        setError("You don't have permission to view conversion requests.");
        setRequests([]);
        return;
      }
      const json = await res.json();
      if (json.success) setRequests(json.data);
      else setError(json.message || "Failed to fetch conversion requests");
    } catch (err) {
      setError("Failed to fetch conversion requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const approve = async (leadId: string) => {
    const res = await fetch(`${API_BASE}/api/leads/${leadId}/conversion-request/approve`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    const json = await res.json();
    if (json.success) setRequests((prev) => prev.filter((l) => l._id !== leadId));
    return json;
  };

  const reject = async (leadId: string, rejectionReason: string) => {
    const res = await fetch(`${API_BASE}/api/leads/${leadId}/conversion-request/reject`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ rejectionReason }),
    });
    const json = await res.json();
    if (json.success) setRequests((prev) => prev.filter((l) => l._id !== leadId));
    return json;
  };

  return { requests, loading, error, refetch: fetchPending, approve, reject };
};

// ── createLead ─────────────────────────────────────────────────────────────────
// Used by both admin and counsellor "Add Lead" forms. Backend enforces:
//   - counsellor → assignedToId/assignedTo forced to self, createdBy/createdByRole set
//   - admin/super_admin → assignedToId optional, createdBy/createdByRole still recorded
export interface CreateLeadPayload {
  fullName: string;
  mobileNumber: string;
  email?: string;
  course: string;
  source?: string;
  remarks?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  assignedToId?: string; // ignored by backend for counsellor role
}

export const createLead = async (payload: CreateLeadPayload) => {
  const res = await fetch(`${API_BASE}/api/leads`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json;
};


export const bulkDeleteLeads = async (ids: string[]) => {
  const res = await fetch(`${API_BASE}/api/leads/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
  return res.json();
};

export const bulkAssignLeads = async (ids: string[], assignedToId: string | null) => {
  const res = await fetch(`${API_BASE}/api/leads/bulk-assign`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ ids, assignedToId }),
  });
  return res.json();
};

export interface Counsellor {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

// Dynamically loads counsellors from the staff API — no hardcoded data.
export const useCounsellors = () => {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/staff?role=counsellor&isActive=true&limit=200`, {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) setCounsellors(json.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { counsellors, loading };
};