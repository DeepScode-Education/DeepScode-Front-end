/**
 * downloadManager.ts
 *
 * Pure, framework-agnostic download utilities. This file knows nothing about
 * React, forms, or leads — it only knows how to get a file URL onto the
 * user's disk. Keeping it dependency-free is what makes it safely reusable
 * from hooks, server actions, or even a future non-React surface.
 */

export interface DownloadResult {
  success: boolean;
  method: "blob" | "fallback-new-tab";
  error?: unknown;
}

/**
 * Builds a safe, human-readable filename from a page/course title and a
 * label, e.g. ("UI/UX Design", "Curriculum PDF") -> "UI-UX-Design-Curriculum-PDF.pdf"
 *
 * Strips characters that choke on Windows/macOS filesystems or get mangled
 * by Cloudinary's Content-Disposition handling.
 */
export function generateFilename(prefix: string, label: string): string {
  const clean = (value: string) =>
    value
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const safePrefix = clean(prefix) || "Download";
  const safeLabel = clean(label) || "File";

  return `${safePrefix}-${safeLabel}.pdf`;
}

/**
 * Downloads a file, preferring a same-tab blob download (so the filename we
 * generated is respected and the page never navigates away). If the fetch
 * fails — most commonly a CORS-restricted Cloudinary/S3 URL — it falls back
 * to opening the raw URL in a new tab so the user still gets their file.
 *
 * This is the ONLY function in the codebase that should touch fetch/blob/DOM
 * for downloads. Components and hooks call this; they never reimplement it.
 */
export async function downloadFile(
  fileUrl: string,
  filename: string
): Promise<DownloadResult> {
  if (!fileUrl) {
    return {
      success: false,
      method: "fallback-new-tab",
      error: new Error("downloadFile called without a fileUrl"),
    };
  }

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoking immediately can beat the browser to starting the download in
    // some engines (notably Firefox). A short delay lets the download kick
    // off before we free the blob URL.
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);

    return { success: true, method: "blob" };
  } catch (error) {
    // Degrade gracefully instead of failing the user's download outright.
    try {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      return { success: true, method: "fallback-new-tab", error };
    } catch (fallbackError) {
      return { success: false, method: "fallback-new-tab", error: fallbackError };
    }
  }
}