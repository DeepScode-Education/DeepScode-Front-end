

import { BASE_URL, getAdminToken, getToken } from "@/integrations/client";

// ── Core fetch helper (mirrors the one in client.ts) ─────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const t = token !== undefined ? token : getToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json() as Promise<T>;
}

const authToken = () => getAdminToken() ?? getToken();

// ── Type definitions ──────────────────────────────────────────────────────────

export type FeeStatus = "pending" | "partial" | "paid" | "overdue" | "no-plan";
export type PaymentMode = "full" | "emi";
export type CallStatus =
  | "Connected"
  | "Busy"
  | "Switched Off"
  | "Parent Talked"
  | "Student Talked"
  | "No Response";

export interface FeeListItem {
  _id: string;
  totalFees: number;
  discount: number;
  finalFee: number;
  totalPaid: number;
  remainingAmount: number;
  feeStatus: FeeStatus;
  nextDueDate: string | null;
  paymentMode: PaymentMode;
  emiMonths: number | null;
  createdAt: string;
  studentData: {
    _id: string;
    fullName: string;
    studentId: string;
    email: string;
    createdAt?: string;
  };
  courseData?: { _id: string; title: string };
  branchData?: { _id: string; name: string };
  counsellorData?: { _id: string; fullName: string };
}

export interface FeeDashboard {
  todayCollection: number;
  monthlyCollection: number;
  totalCollection: number;
  pendingCollection: number;
  overdueStudents: number;
  overdueAmount: number;
  collectionPercent: number;
  statusBreakdown: {
    paid: number;
    partial: number;
    overdue: number;
    pending: number;
    total: number;
  };
}

export interface FeeRecord {
  _id?: string;
  student?: string;
  totalFees: number;
  discount: number;
  finalFee: number;
  paymentMode: PaymentMode;
  emiMonths?: number | null;
  monthlyEmiAmount?: number | null;
  totalPaid: number;
  remainingAmount: number;
  feeStatus: FeeStatus;
  nextDueDate?: string | null;
  receiptPrefix?: string;
  lastReceiptNumber?: number;
  course?: { _id: string; title: string; price?: number } | string | null;
  branch?: { _id: string; name: string } | string | null;
  counsellor?: { _id: string; fullName: string; email?: string } | string | null;
  createdBy?: { _id: string; fullName: string } | string | null;
  createdAt?: string;
}

export interface PaymentRecord {
  _id: string;
  student?: string;
  fee?: string;
  course?: { _id: string; title: string } | string | null;
  paymentNumber: number;
  amount: number;
  paymentMethod: string;
  transactionId?: string | null;
  paymentStatus: "pending" | "success" | "failed";
  paidAt: string;
  recordedBy?: { _id: string; fullName: string } | string | null;
  receiptNumber?: string | null;
  notes?: string;
  branch?: { _id: string; name: string } | string | null;
  createdAt?: string;
}

export interface FeeInstallment {
  _id: string;
  fee: string;
  student: string;
  installmentNumber: number;
  dueDate: string;
  paidDate?: string | null;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "pending" | "partial" | "paid" | "overdue";
  payments: PaymentRecord[];
  notes?: string;
  computedStatus?: string;
}

export interface FeeFollowUp {
  _id: string;
  fee: string;
  student: string;
  callStatus: CallStatus;
  nextFollowUpDate?: string | null;
  expectedPaymentDate?: string | null;
  expectedAmount?: number | null;
  remarks?: string;
  status: "pending" | "completed" | "cancelled";
  completedAt?: string | null;
  createdBy: { _id: string; fullName: string; role?: string };
  updatedBy?: { _id: string; fullName: string } | null;
  createdAt: string;
  updatedAt?: string;
}

export interface FeeNote {
  _id: string;
  fee: string;
  student: string;
  note: string;
  addedBy: { _id: string; fullName: string; role?: string };
  createdAt: string;
}

export interface StudentFeeDetails {
  student: {
    _id: string;
    fullName: string;
    email: string;
    studentId?: string;
    branch?: { _id: string; name: string; code: string } | null;
    createdAt?: string;
  };
  fee: FeeRecord | null;
  payments: PaymentRecord[];
  installments: FeeInstallment[];
  recentFollowUps: FeeFollowUp[];
  recentNotes: FeeNote[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const feeCollectionApi = {
  // ── List ─────────────────────────────────────────────────────────────────────
  getList: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    branch?: string;
    counsellor?: string;
    course?: string;
    status?: string;
  } = {}): Promise<{ data: FeeListItem[]; pagination: Pagination }> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.append(k, String(v));
    });
    const res = await request<{
      success: boolean;
      data: FeeListItem[];
      pagination: Pagination;
    }>(`/api/fee-collection?${qs}`, {}, authToken());
    return { data: res.data, pagination: res.pagination };
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  getDashboard: async (): Promise<FeeDashboard> => {
    const res = await request<{ success: boolean; data: FeeDashboard }>(
      "/api/fee-collection/dashboard",
      {},
      authToken()
    );
    return res.data;
  },

  // ── Recent payments ───────────────────────────────────────────────────────────
  getRecentPayments: async (
    page = 1,
    limit = 10
  ): Promise<{ data: PaymentRecord[]; pagination: Pagination }> => {
    const res = await request<{
      success: boolean;
      data: PaymentRecord[];
      pagination: Pagination;
    }>(`/api/fee-collection/recent-payments?page=${page}&limit=${limit}`, {}, authToken());
    return { data: res.data, pagination: res.pagination };
  },

  // ── Overdue ───────────────────────────────────────────────────────────────────
  getOverdue: async (): Promise<FeeListItem[]> => {
    const res = await request<{
      success: boolean;
      data: FeeListItem[];
    }>("/api/fee-collection/overdue", {}, authToken());
    return res.data;
  },

  // ── Student fee details ───────────────────────────────────────────────────────
  getStudentDetails: async (studentId: string): Promise<StudentFeeDetails> => {
    const res = await request<{ success: boolean; data: StudentFeeDetails }>(
      `/api/fee-collection/${studentId}`,
      {},
      authToken()
    );
    return res.data;
  },

  // ── Fee setup ─────────────────────────────────────────────────────────────────
  setupFee: async (
    studentId: string,
    payload: {
      totalFees: number;
      discount?: number;
      paymentMode: PaymentMode;
      emiMonths?: number;
      course?: string;
      counsellor?: string;
      branch?: string;
      startDate?: string;
    }
  ): Promise<FeeRecord> => {
    const res = await request<{ success: boolean; data: FeeRecord }>(
      `/api/fee-collection/${studentId}/fee-setup`,
      { method: "POST", body: JSON.stringify(payload) },
      authToken()
    );
    return res.data;
  },

  // ── Add payment ───────────────────────────────────────────────────────────────
  // addPayment: async (
  //   studentId: string,
  //   payload: {
  //     amount: number;
  //     paymentMethod?: string;
  //     transactionId?: string;
  //     paidAt?: string;
  //     notes?: string;
  //   }
  // ): Promise<{ payment: PaymentRecord; fee: FeeRecord }> => {
  //   const res = await request<{
  //     success: boolean;
  //     data: { payment: PaymentRecord; fee: FeeRecord };
  //   }>(
  //     `/api/fee-collection/${studentId}/payment`,
  //     { method: "POST", body: JSON.stringify(payload) },
  //     authToken()
  //   );
  //   return res.data;
  // },



  addPayment: async (
  studentId: string,
  payload: {
    amount: number;
    paymentMethod?: string;
    transactionId?: string;
    paidAt?: string;
    notes?: string;
    installmentId?: string; // NEW
  }
): Promise<{ payment: PaymentRecord; fee: FeeRecord }> => {
  const res = await request<{
    success: boolean;
    data: { payment: PaymentRecord; fee: FeeRecord };
  }>(
    `/api/fee-collection/${studentId}/payment`,
    { method: "POST", body: JSON.stringify(payload) },
    authToken()
  );
  return res.data;
},

  // ── Installments ──────────────────────────────────────────────────────────────
  getInstallments: async (studentId: string): Promise<FeeInstallment[]> => {
    const res = await request<{ success: boolean; data: FeeInstallment[] }>(
      `/api/fee-collection/${studentId}/installments`,
      {},
      authToken()
    );
    return res.data;
  },

  // ── Follow-ups ────────────────────────────────────────────────────────────────
  getFollowUps: async (studentId: string): Promise<FeeFollowUp[]> => {
    const res = await request<{ success: boolean; data: FeeFollowUp[] }>(
      `/api/fee-collection/${studentId}/follow-ups`,
      {},
      authToken()
    );
    return res.data;
  },

  addFollowUp: async (
    studentId: string,
    payload: {
      callStatus: CallStatus;
      nextFollowUpDate?: string;
      expectedPaymentDate?: string;
      expectedAmount?: number;
      remarks?: string;
    }
  ): Promise<FeeFollowUp> => {
    const res = await request<{ success: boolean; data: FeeFollowUp }>(
      `/api/fee-collection/${studentId}/follow-ups`,
      { method: "POST", body: JSON.stringify(payload) },
      authToken()
    );
    return res.data;
  },

  updateFollowUp: async (
    studentId: string,
    followUpId: string,
    payload: Partial<{
      callStatus: CallStatus;
      nextFollowUpDate: string;
      expectedPaymentDate: string;
      expectedAmount: number;
      remarks: string;
      status: "completed";
    }>
  ): Promise<FeeFollowUp> => {
    const res = await request<{ success: boolean; data: FeeFollowUp }>(
      `/api/fee-collection/${studentId}/follow-ups/${followUpId}`,
      { method: "PUT", body: JSON.stringify(payload) },
      authToken()
    );
    return res.data;
  },

  // ── Notes ─────────────────────────────────────────────────────────────────────
  getNotes: async (studentId: string): Promise<FeeNote[]> => {
    const res = await request<{ success: boolean; data: FeeNote[] }>(
      `/api/fee-collection/${studentId}/notes`,
      {},
      authToken()
    );
    return res.data;
  },

  addNote: async (studentId: string, note: string): Promise<FeeNote> => {
    const res = await request<{ success: boolean; data: FeeNote }>(
      `/api/fee-collection/${studentId}/notes`,
      { method: "POST", body: JSON.stringify({ note }) },
      authToken()
    );
    return res.data;
  },
};


// ── Fee Collection Reports ────────────────────────────────────────────────────

export interface FeeReportsOverview {
  totalFeesGenerated: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectionRate: number;
  totalStudentsWithFee: number;
  overdueStudentCount: number;
}

export interface FeeReportsMonthlyPoint {
  month: string;
  collected: number;
  generated: number;
}

export interface FeeReportsCourseRow {
  courseId: string | null;
  course: string;
  totalFees: number;
  collected: number;
  pending: number;
  students: number;
  collectionRate: number;
}

export interface FeeReportsCounsellorRow {
  counsellorId: string | null;
  counsellor: string;
  totalFees: number;
  collected: number;
  pending: number;
  students: number;
  collectionRate: number;
}

export interface FeeReportsInstallmentBucket {
  count: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface FeeCollectionReports {
  overview: FeeReportsOverview;
  monthlyTrend: FeeReportsMonthlyPoint[];
  courseWise: FeeReportsCourseRow[];
  counsellorWise: FeeReportsCounsellorRow[];
  installmentSummary: {
    paid: FeeReportsInstallmentBucket;
    partial: FeeReportsInstallmentBucket;
    pending: FeeReportsInstallmentBucket;
    overdue: FeeReportsInstallmentBucket;
  };
  recentPayments: PaymentRecord[];
}

export const feeReportsApi = {
  getReports: async (): Promise<FeeCollectionReports> => {
    const res = await request<{ success: boolean; data: FeeCollectionReports }>(
      "/api/fee-reports",
      {},
      authToken()
    );
    return res.data;
  },
};