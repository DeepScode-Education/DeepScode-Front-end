import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};

// ── Types ──────────────────────────────────────────────────────────────────
export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicketUser {
  _id: string;
  fullName: string;
  email: string;
  studentId?: string;
}

export interface SupportTicketStaff {
  _id: string;
  fullName: string;
  role: string;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  user: SupportTicketUser | string | null;
  issueType: string;
  subject: string;
  description: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: SupportTicketStaff | string | null;
  adminReply: string;
  inquiry: string | { _id: string; fullName: string; leadStatus: string } | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── useSupportTickets — admin list, paginated ───────────────────────────────
interface UseSupportTicketsParams {
  page?: number;
  search?: string;
  status?: string;
  priority?: string;
  issueType?: string;
}

export const useSupportTickets = (params: UseSupportTicketsParams = {}) => {
  const { page = 1, search = "", status = "", priority = "", issueType = "" } = params;
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [pagination, setPagination] = useState<TicketPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: "50",
        ...(search && { search }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(issueType && { issueType }),
      });

      const res = await fetch(`${API_BASE}/api/support-tickets/admin?${qs}`, {
        headers: authHeaders(),
      });

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setTickets([]);
        return;
      }

      const json = await res.json();
      if (json.success) {
        setTickets(json.data);
        setPagination(json.pagination);
      } else {
        setError(json.message || "Failed to fetch support tickets");
      }
    } catch (err) {
      setError("Failed to fetch support tickets");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, issueType]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, pagination, loading, error, refetch: fetchTickets };
};

// ── useSupportTicketStats ────────────────────────────────────────────────────
// The backend has no dedicated /admin/dashboard endpoint for tickets (unlike
// Leads). Counts are derived from the existing list endpoint via limit=1
// requests per status, reading `pagination.total` — 5 lightweight calls
// instead of a purpose-built one. Respects the same filters as the list.
interface UseSupportTicketStatsParams {
  search?: string;
  priority?: string;
  issueType?: string;
}

export interface SupportTicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export const useSupportTicketStats = (params: UseSupportTicketStatsParams = {}) => {
  const { search = "", priority = "", issueType = "" } = params;
  const [stats, setStats] = useState<SupportTicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async (status?: string) => {
      const qs = new URLSearchParams({
        page: "1",
        limit: "1",
        ...(search && { search }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(issueType && { issueType }),
      });
      const res = await fetch(`${API_BASE}/api/support-tickets/admin?${qs}`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      return json?.success ? json.pagination?.total ?? 0 : 0;
    };

    setLoading(true);
    setError(null);

    Promise.all([
      fetchCount(),
      fetchCount("open"),
      fetchCount("in-progress"),
      fetchCount("resolved"),
      fetchCount("closed"),
    ])
      .then(([total, open, inProgress, resolved, closed]) => {
        if (cancelled) return;
        setStats({ total, open, inProgress, resolved, closed });
      })
      .catch(() => {
        if (!cancelled) setError("Failed to fetch ticket stats");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, priority, issueType]);

  return { stats, loading, error };
};

// ── useSupportTicketDetail ───────────────────────────────────────────────────
export const useSupportTicketDetail = (id: string) => {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/support-tickets/admin/${id}`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setTicket(json.data);
      } else {
        setError(json.message || "Failed to fetch ticket");
      }
    } catch (err) {
      setError("Failed to fetch ticket");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const updateStatus = async (status: TicketStatus) => {
    const res = await fetch(`${API_BASE}/api/support-tickets/admin/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.success) setTicket(json.data);
    return json;
  };

  const updatePriority = async (priority: TicketPriority) => {
    const res = await fetch(`${API_BASE}/api/support-tickets/admin/${id}/priority`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ priority }),
    });
    const json = await res.json();
    if (json.success) setTicket(json.data);
    return json;
  };

  const assignTicket = async (assignedTo: string | null) => {
    const res = await fetch(`${API_BASE}/api/support-tickets/admin/${id}/assign`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ assignedTo }),
    });
    const json = await res.json();
    if (json.success) setTicket(json.data);
    return json;
  };

  const replyToTicket = async (reply: string, status?: TicketStatus) => {
    const res = await fetch(`${API_BASE}/api/support-tickets/admin/${id}/reply`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ reply, ...(status && { status }) }),
    });
    const json = await res.json();
    if (json.success) setTicket(json.data);
    return json;
  };

  const convertToInquiry = async (payload: { course: string; mobileNumber?: string; remarks?: string }) => {
    const res = await fetch(`${API_BASE}/api/support-tickets/admin/${id}/convert-to-inquiry`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success && json.data?.ticket) setTicket(json.data.ticket);
    return json;
  };

  return {
    ticket,
    loading,
    error,
    refetch: fetchTicket,
    updateStatus,
    updatePriority,
    assignTicket,
    replyToTicket,
    convertToInquiry,
  };
};

// ── useAssignableStaff ────────────────────────────────────────────────────────
// Tickets can go to any staff role (admin, super_admin, counsellor, mentor,
// accountant) per the backend's ASSIGNABLE_ROLES — broader than Lead
// assignment, which is counsellor-only. Calls /api/staff with no role filter;
// if your endpoint requires ?role=, swap this for one call per role and merge.
export interface StaffOption {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const useAssignableStaff = () => {
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadStaff = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/staff`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setStaff(json.data);
    } catch (err) {
      console.error("Failed to load staff", err);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [loaded]);

  return { staff, loading, loadStaff };
};