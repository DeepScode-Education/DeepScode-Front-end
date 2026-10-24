import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://deepscode-backend-end.onrender.com";

export interface RevenueByBranch {
  branch: string;
  name: string;
  revenue: number;
}

export interface ConversionFunnel {
  leadsGenerated: number;
  demosConducted: number;
  enrollments: number;
  demoDropoffPct: number;
  enrollCRPct: number;
}

export interface LeadSourcePerf {
  source: string;
  count: number;
  percent: number;
}

export interface TopCounsellor {
  name: string;
  leads: number;
  admissions: number;
  revenue: number;
}

export interface BranchAudit {
  branchId: string;
  branch: string;
  counsellorCount: number;
  activeLeads: number;
  missedFollowUps: number;
  healthIndex: number;
  health: "optimal" | "warning" | "critical";
}

export interface GlobalReportsData {
  totalRevenue: number;
  totalAdmissions: number;
  overallConversion: number;
  missedFollowUpRate: number;
  revenueByBranch: RevenueByBranch[];
  conversionFunnel: ConversionFunnel;
  leadSourcePerformance: LeadSourcePerf[];
  topCounsellors: TopCounsellor[];
  branchAudit: BranchAudit[];
  priorityAlerts: { title: string; message: string }[];
}

export const useGlobalReports = (days: number = 30) => {
  const [data, setData] = useState<GlobalReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reports/global?days=${days}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.message || "Failed to load reports");
    } catch (err) {
      setError("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { data, loading, error, refetch: fetchReports };
};