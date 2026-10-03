import { useCallback, useEffect, useState } from "react";
import { liveClassApi } from "../api/liveClass.api";
import type { LiveClass, StartClassPayload } from "../types/liveClass.types";

export function useCurrentLiveClass() {
  const [current, setCurrent] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await liveClassApi.getCurrent();
      setCurrent(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load live class");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleLiveClassEnded = () => refresh();
    window.addEventListener("slate-live-class-ended", handleLiveClassEnded);
    return () => window.removeEventListener("slate-live-class-ended", handleLiveClassEnded);
  }, [refresh]);

  return { current, loading, error, refresh };
}

export function useUpcomingLiveClasses() {
  const [upcoming, setUpcoming] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await liveClassApi.getUpcoming();
      setUpcoming(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load upcoming classes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { upcoming, loading, error, refresh };
}

export function useLiveClassHistory() {
  const [history, setHistory] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await liveClassApi.getHistory();
      setHistory(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load class history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { history, loading, error, refresh };
}

export function useStartClass() {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startClass = useCallback(async (payload: StartClassPayload) => {
    try {
      setStarting(true);
      setError(null);
      const res = await liveClassApi.startClass(payload);
      return res.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start class";
      setError(message);
      throw err;
    } finally {
      setStarting(false);
    }
  }, []);

  return { startClass, starting, error };
}

export function useEndClass() {
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endClass = useCallback(async (liveClassId: string) => {
    try {
      setEnding(true);
      setError(null);
      const res = await liveClassApi.endClass(liveClassId);
      if (!res.success) {
        throw new Error(res.message || "Failed to end class");
      }
      return res.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to end class";
      setError(message);
      throw err;
    } finally {
      setEnding(false);
    }
  }, []);

  return { endClass, ending, error };
}