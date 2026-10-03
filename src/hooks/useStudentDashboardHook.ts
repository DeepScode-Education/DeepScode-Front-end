import { useEffect, useState, useCallback } from "react";
import { getToken, request } from "@/integrations/client";

export interface StatCard {
  label: string;
  value: string;
  note: string;
  key: "course" | "attendance" | "portfolio" | "placement" | "fees" | "nextClass";
}

export interface SnapshotStat {
  label: string;
  value: number;
  color: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "locked";
  progress: number;
  lastAccess: string | null;
  feedback: string | null;
}

export interface AttendanceTrendPoint {
  month: string;
  attendance: number;
}

export interface NextClassInfo {
  status: "upcoming" | "live" | "completed";
  dateLabel: string;
  timeLabel: string;
  moduleTitle: string;
}

export interface PortalDashboardData {
  studentName: string;
  statCards: StatCard[];
  snapshotStats: SnapshotStat[];
  streak: { days: boolean[]; currentStreak: number };
  roadmap: RoadmapItem[];
  attendanceTrend: AttendanceTrendPoint[];
  attendancePercent: number;
  nextClass: NextClassInfo | null;
  hasCourseAssigned: boolean;
}

interface UseStudentDashboardResult {
  data: PortalDashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStudentDashboardHook(): UseStudentDashboardResult {
  const token = getToken();
  const [data, setData] = useState<PortalDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await request<PortalDashboardData>("/student/portal-dashboard", {
        method: "GET",
      }, token);

      if (response && typeof response === "object" && "data" in response && response.data) {
        setData(response.data as PortalDashboardData);
      } else {
        setData(response as PortalDashboardData);
      }
    } catch (err) {
      setError("Something went wrong while loading your dashboard. Please try again.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refetch: fetchDashboard };
}