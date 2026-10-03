
import { useEffect, useState, useCallback } from "react";
import { getToken, BASE_URL, liveClassApi, type LiveClassRecord } from "@/integrations/client";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ModuleStatus = "completed" | "in-progress" | "locked";

export interface CourseModule {
  id: string;
  order: number;
  title: string;
  status: ModuleStatus;
  progress: number;
  lastAccess: string | null;
  feedback: string | null;
}

export interface MentorInfo {
  name: string;
  rating: number;
  reviewsCount: number;
}

export interface CourseOverview {
  title: string;
  batchCode: string;
  scheduleLabel: string;
  mentor: MentorInfo;
  hoursInvested: number;
  hoursPerWeekAvg: number;
}

export interface ProgressPoint {
  week: string;
  progress: number;
}

export type ClassStatus = "upcoming" | "live" | "completed";

export interface LiveClassInfo {
  status: ClassStatus;
  batchDayPattern: string;
  batchTimeSlot: string;
  timeLabel: string;
  mentorName: string;
  nextClassDate: Date | null;
  lastCompletedDate: Date | null;
  meetingLink: string | null;
}

export interface UseCourseResult {
  overview: CourseOverview | null;
  modules: CourseModule[];
  overallProgress: number;
  progressHistory: ProgressPoint[];
  liveClass: LiveClassInfo | null;
  realLiveClass: LiveClassRecord | null; // ← NEW: real, join-capable Zoom session (from /api/live)
  isLoading: boolean;
  error: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers — unchanged signatures, MyCourse.tsx imports these
// ─────────────────────────────────────────────────────────────────────────────

export function getModuleStatusLabel(status: ModuleStatus): string {
  if (status === "completed") return "Completed";
  if (status === "in-progress") return "In Progress";
  return "Locked";
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
}

export function formatLiveClassDate(date: Date | null): string {
  if (!date) return "—";
  return formatFullDate(date);
}

export function formatLiveClassTime(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useCourse(): UseCourseResult {
  const [overview, setOverview] = useState<CourseOverview | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [progressHistory, setProgressHistory] = useState<ProgressPoint[]>([]);
  const [liveClass, setLiveClass] = useState<LiveClassInfo | null>(null);
  const [realLiveClass, setRealLiveClass] = useState<LiveClassRecord | null>(null); // ← NEW
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/student/my-course`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const response = await res.json();

      if (!response.success) {
        setError(response.message || "Could not load course data");
        setOverview(null);
        setModules([]);
        setOverallProgress(0);
        setProgressHistory([]);
        setLiveClass(null);
        setIsLoading(false);
        return;
      }

      const data = response.data;

      setOverview(data.overview);
      setModules(data.modules);
      setOverallProgress(data.overallProgress);
      setProgressHistory(data.progressHistory);

      const rawLiveClass = data.liveClass;
      setLiveClass({
        status: rawLiveClass.status,
        batchDayPattern: rawLiveClass.batchDayPattern,
        batchTimeSlot: rawLiveClass.batchTimeSlot,
        timeLabel: rawLiveClass.timeLabel,
        mentorName: rawLiveClass.mentorName,
        nextClassDate: rawLiveClass.nextClassDate ? new Date(rawLiveClass.nextClassDate) : null,
        lastCompletedDate: rawLiveClass.lastCompletedDate ? new Date(rawLiveClass.lastCompletedDate) : null,
        meetingLink: rawLiveClass.meetingLink,
      });

      setIsLoading(false);
    } catch (err) {
      setError("Something went wrong while loading your course. Please try again.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // ── NEW: poll the REAL backend live-class module (/api/live/current) ──
  // This is independent of the schedule-heuristic `liveClass` above — it tells
  // us whether a mentor has actually started a Zoom session right now, which
  // is what the "Join Live Class" button needs to be functional.
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    const pollCurrent = () => {
      liveClassApi
        .getCurrent()
        .then((res) => {
          if (!cancelled) setRealLiveClass(res.data);
        })
        .catch(() => {
          if (!cancelled) setRealLiveClass(null);
        });
    };

    pollCurrent();
    const interval = setInterval(pollCurrent, 20_000); // check every 20s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return {
    overview,
    modules,
    overallProgress,
    progressHistory,
    liveClass,
    realLiveClass, // ← NEW
    isLoading,
    error,
  };
}