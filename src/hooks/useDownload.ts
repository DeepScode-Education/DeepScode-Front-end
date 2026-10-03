/**
 * useDownload.ts
 *
 * The single, reusable download workflow for the whole app. Any component —
 * Hero, ProgramStructure, a Resources page, a Blog post CTA — imports this
 * hook and gets: pending-file tracking, lead-form gating, double-submit
 * protection, cleanup, and an analytics hook point, for free.
 *
 * Components never see fetch/blob/DOM. They only ever call requestDownload()
 * and, once their lead form succeeds, handleSuccess().
 */
import { useCallback, useRef, useState } from "react";
import { downloadFile, generateFilename } from "@/lib/downloadManager";

export interface PendingDownload {
  fileUrl: string;
  label: string;
}

export interface DownloadAnalyticsPayload extends PendingDownload {
  filename: string;
}

export interface UseDownloadOptions {
  /** Used to build the filename, e.g. the course title or page name. */
  filenamePrefix?: string;
  /** Fires the moment a download is requested, before the form opens. */
  onDownloadRequested?: (payload: PendingDownload) => void;
  /** Fires once the file has actually started downloading. Wire GA4 / Meta Pixel / Google Ads conversion events here. */
  onDownloadSuccess?: (payload: DownloadAnalyticsPayload) => void;
  /** Fires if the download itself fails after a successful lead submission. */
  onDownloadError?: (error: unknown, payload: PendingDownload) => void;
}

export interface UseDownloadReturn {
  pendingDownload: PendingDownload | null;
  isFormOpen: boolean;
  isDownloading: boolean;
  error: string | null;
  /** Call from any download button. Opens the lead form and remembers what to download. No-ops if fileUrl is falsy — this is what blocks a direct-download bypass. */
  requestDownload: (fileUrl?: string | null, label?: string) => void;
  /** Call when the user dismisses the form without converting. */
  closeForm: () => void;
  /** Call from the lead form's onSuccess callback. Downloads the pending file, then cleans up. */
  handleSuccess: () => Promise<void>;
}

export function useDownload(options: UseDownloadOptions = {}): UseDownloadReturn {
  const {
    filenamePrefix = "Download",
    onDownloadRequested,
    onDownloadSuccess,
    onDownloadError,
  } = options;

  const [pendingDownload, setPendingDownload] = useState<PendingDownload | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guards against double-submits (user double-clicks "Submit") and against
  // a second handleSuccess firing after state has already been cleared.
  const inFlightRef = useRef(false);

  const requestDownload = useCallback(
    (fileUrl?: string | null, label = "Syllabus") => {
      if (!fileUrl) return; // nothing to download — no bypass, no dead form
      setError(null);
      const payload: PendingDownload = { fileUrl, label };
      setPendingDownload(payload);
      setIsFormOpen(true);
      onDownloadRequested?.(payload);
    },
    [onDownloadRequested]
  );

  const closeForm = useCallback(() => {
    // If a download is already in flight, ignore the dismiss — otherwise a
    // backdrop click mid-download clears pendingDownload/inFlightRef while
    // handleSuccess() is still awaiting downloadFile(), and its eventual
    // finally{} block would then stomp on whatever the *next* request set up.
    if (inFlightRef.current) return;
    setIsFormOpen(false);
    setPendingDownload(null); // clears state immediately — no stale pendingDownload survives a cancel
  }, []);

  const handleSuccess = useCallback(async () => {
    if (!pendingDownload || inFlightRef.current) return; // blocks multiple submissions / race conditions
    inFlightRef.current = true;
    setIsDownloading(true);
    setError(null);

    const { fileUrl, label } = pendingDownload;
    const filename = generateFilename(filenamePrefix, label);

    try {
      const result = await downloadFile(fileUrl, filename);
      if (!result.success) throw result.error ?? new Error("Download failed");
      onDownloadSuccess?.({ fileUrl, label, filename });
    } catch (err) {
      setError("We couldn't start your download. Please try again.");
      onDownloadError?.(err, pendingDownload);
    } finally {
      // Always run — success or failure — so the modal never gets stuck open
      // and pendingDownload never lingers into the next click.
      setIsFormOpen(false);
      setPendingDownload(null);
      setIsDownloading(false);
      inFlightRef.current = false;
    }
  }, [pendingDownload, filenamePrefix, onDownloadSuccess, onDownloadError]);

  return {
    pendingDownload,
    isFormOpen,
    isDownloading,
    error,
    requestDownload,
    closeForm,
    handleSuccess,
  };
}