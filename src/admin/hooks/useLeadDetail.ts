import { useState, useEffect, useCallback } from "react";
import type { Lead, LeadFees, LeadParentInfo } from "./useLeads";

const API_BASE = import.meta.env.VITE_API_BASE || "https://deepscode-backend-end.onrender.com";

const authHeaders = (includeJson = true): HeadersInit => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (includeJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export interface FollowUp {
  _id: string;
  leadId: string;
  contactedBy: string;
  communicationType: "call" | "whatsapp" | "email" | "meeting";
  note: string;
  nextFollowUpDate: string | null;
  createdAt: string;
}

export interface TimelineEntry {
  _id: string;
  leadId: string;
  action: string;
  description: string;
  meta?: Record<string, any>;
  performedBy?: { fullName?: string; role?: string } | string;
  createdAt: string;
}

// ── Conversion request result shapes ────────────────────────────────────────────
export interface ConvertResult {
  success: boolean;
  message: string;
  data?: {
    student?: {
      _id: string;
      fullName: string;
      email: string;
      studentId: string;
    };
    studentUserId?: string;
    enrollmentId?: string | null;
    tempPassword?: string;
    linkedExisting?: boolean;
    conversionRequest?: {
      status: "none" | "pending" | "approved" | "rejected";
      requestedAt?: string;
      rejectionReason?: string;
    };
  };
}

// ── Fee collection counsellor assignment result shape ──────────────────────────
export interface FeeCollectionAssignResult {
  success: boolean;
  message: string;
  data?: Lead;
}

export const useLeadDetail = (id: string) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${id}`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) {
        setLead(json.data.lead);
        setFollowUps(json.data.followUps);
      } else {
        setError(json.message || "Failed to load lead");
      }
    } catch (err) {
      console.error("useLeadDetail fetch error:", err);
      setError("Failed to fetch lead detail");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const fetchTimeline = useCallback(async () => {
    if (!id) return;
    setTimelineLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${id}/timeline`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setTimeline(json.data.timeline || []);
    } catch (err) {
      console.error("fetchTimeline error:", err);
    } finally {
      setTimelineLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const updateStatus = async (
    leadStatus: "new" | "contacted" | "interested" | "follow-up" | "lost"
  ) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ leadStatus }),
    });
    const json = await res.json();
    if (json.success) setLead(json.data);
    return json;
  };

  const assignCounselor = async (assignedToId: string, reason?: string) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/assign`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ assignedToId, reason }),
    });
    const json = await res.json();
    if (json.success) setLead(json.data);
    return json;
  };

  // ── NEW: Assign a separate counsellor for fee collection / installment
  // follow-ups. Independent of assignCounselor (the lead/demo counsellor).
  // Pass `null` as feeCollectionCounsellorId to unassign.
  const assignFeeCollectionCounsellor = async (
    feeCollectionCounsellorId: string | null,
    reason?: string
  ): Promise<FeeCollectionAssignResult> => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/assign-fee-collection`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ feeCollectionCounsellorId, reason }),
    });
    const json = await res.json();
    if (json.success) setLead(json.data);
    return json;
  };

  // ── Request-based conversion ───────────────────────────────────────────────
  // Counsellor → creates a pending request (no student is created yet).
  // Admin / Super Admin → backend auto-approves and converts immediately.
  const requestConversion = async (payload?: {
    note?: string;
    finalFee?: number;
  }): Promise<ConvertResult> => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/conversion-request`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload || {}),
    });
    const json = await res.json();
    if (json.success) await fetchDetail();
    return json;
  };

  // Backward-compat name used by older components
  const convertLead = requestConversion;

  const approveConversion = async (): Promise<ConvertResult> => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/conversion-request/approve`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    const json = await res.json();
    if (json.success) await fetchDetail();
    return json;
  };



  const rejectConversion = async (rejectionReason: string): Promise<ConvertResult> => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/conversion-request/reject`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ rejectionReason }),
    });
    const json = await res.json();
    if (json.success) await fetchDetail();
    return json;
  };

  const updateLeadInfo = async (payload: { fees?: LeadFees; parentInfo?: LeadParentInfo }) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/info`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) setLead(json.data);
    return json;
  };

  // ── Payment plan / fee negotiation (counsellor editable) ────────────────────
  // UPDATED: now also accepts originalFee, reason, remarks — backend appends a
  // feeHistory entry whenever negotiatedAmount actually changes.
  const updatePaymentPlan = async (payload: {
    mode?: "full" | "emi";
    emiMonths?: number;
    downPayment?: number;
    notes?: string;
    negotiatedAmount?: number;
    originalFee?: number;
    reason?: string;
    remarks?: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/payment-plan`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      setLead(json.data);
      fetchTimeline();
    }
    return json;
  };

  // ── NEW: parent / guardian info ──────────────────────────────────────────────
  const updateParentInfo = async (payload: {
    fatherName?: string;
    motherName?: string;
    guardianName?: string;
    guardianMobile?: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/parent-info`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      setLead(json.data);
      fetchTimeline();
    }
    return json;
  };

  const updateObjections = async (objections: string[]) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/objections`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ objections }),
    });
    const json = await res.json();
    if (json.success) setLead(json.data);
    return json;
  };

  const addDocument = async (doc: { name: string; url: string; type?: string }) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/documents`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(doc),
    });
    const json = await res.json();
    if (json.success) setLead(json.data);
    return json;
  };

  const removeDocument = async (docId: string) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/documents/${docId}`, {
      method: "DELETE",
      headers: authHeaders(false),
    });
    const json = await res.json();
    if (json.success) setLead(json.data);
    return json;
  };

  const addFollowUp = async (payload: {
    contactedBy: string;
    communicationType: string;
    note: string;
    nextFollowUpDate?: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/followups`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success && lead) {
      setFollowUps((prev) => [json.data, ...prev]);
      setLead({
        ...lead,
        leadStatus: "follow-up",
        lastContactedAt: new Date().toISOString(),
        ...(payload.nextFollowUpDate && { nextFollowUpDate: payload.nextFollowUpDate }),
      });
    }
    return json;
  };

  const updateLeadDetails = async (payload: {
    fullName?: string; mobileNumber?: string; email?: string;
    course?: string; source?: string; remarks?: string;
    leadHealth?: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/details`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      setLead(json.data);
      fetchTimeline();
    }
    return json;
  };

  const updatePriority = async (priority: "low" | "medium" | "high" | "urgent") => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/priority`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ priority }),
    });
    const json = await res.json();
    if (json.success) {
      setLead(json.data);
      fetchTimeline();
    }
    return json;
  };

  const updateDemo = async (payload: {
    demoScheduledAt?: string | null;
    demoMode?: string;
    demoCompleted?: boolean;
    demoFeedback?: string;
    demoRating?: number;
  }) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/demo`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      setLead(json.data);
      fetchTimeline();
    }
    return json;
  };

  const markLost = async (payload: { lostReason?: string; competitor?: string; remarks?: string }) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}/lost`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      setLead(json.data);
      fetchTimeline();
    }
    return json;
  };

  

  return {
    lead,
    followUps,
    loading,
    error,
    fetchDetail,
    updateStatus,
    assignCounselor,
    assignFeeCollectionCounsellor, // NEW
    convertLead,           // backward-compat alias → requestConversion
    requestConversion,
    approveConversion,
    rejectConversion,
    updateLeadInfo,
    updatePaymentPlan,
    updateParentInfo,      // NEW
    updateObjections,
    addDocument,
    removeDocument,
    addFollowUp,
    timeline,
    timelineLoading,
    updateLeadDetails,
    updatePriority,
    updateDemo,
    markLost,
  };
};