/**
 * Cloudinary URL helpers.
 */

const UPLOAD_MARKER = "/upload/";

export interface CloudinaryOptions {
  /** Target display width in CSS pixels (not device pixels — dpr_auto handles that). */
  width?: number;
  /** Defaults to 'auto:good' — Cloudinary picks the smallest byte size at acceptable visual quality. */
  quality?: string | number;
  /** Defaults to 'auto' — serves AVIF/WebP to browsers that support it, falls back otherwise. */
  format?: string;
  /** Defaults to 'fill' to match the carousel's fixed aspect-ratio box. */
  crop?: string;
  /** Defaults to 'auto' — Cloudinary's content-aware cropping. */
  gravity?: string;
  /** Defaults to 'auto' — serves 2x/3x assets to high-DPI screens automatically. */
  dpr?: "auto" | number;
}

/**
 * Inserts a Cloudinary transformation string right after `/upload/`.
 * Non-Cloudinary URLs (e.g. local dev placeholders) are returned untouched.
 * A missing/empty `url` returns "" — callers MUST NOT put that on an <img src>
 * directly (see `hasCloudinaryImage` below): an empty src attribute makes the
 * browser request the current document as an image, which is the concrete bug
 * behind the reported Safari "image not loading" symptom — Safari is far more
 * visible about the resulting broken/flashing image than Chrome is.
 */
export const optimizeCloudinaryImage = (
  url?: string | null,
  options: CloudinaryOptions = {}
): string => {
  if (!url) return "";
  if (!url.includes(UPLOAD_MARKER)) return url;

  const {
    width,
    quality = "auto:good",
    format = "auto",
    crop = "fill",
    gravity = "auto",
    dpr = "auto",
  } = options;

  const transforms = [
    `f_${format}`,
    `q_${quality}`,
    `c_${crop}`,
    `g_${gravity}`,
    `dpr_${dpr}`,
    width ? `w_${width}` : null,
  ]
    .filter(Boolean)
    .join(",");

  // Guard against double-applying transforms if this ever gets called twice
  // on an already-optimized URL.
  if (url.includes(`${UPLOAD_MARKER}${transforms}/`)) return url;

  return url.replace(UPLOAD_MARKER, `${UPLOAD_MARKER}${transforms}/`);
};

/**
 * Builds a `srcSet` string across a set of target widths, so the browser
 * (not us) picks the smallest image that satisfies the rendered size.
 */
export const buildCloudinarySrcSet = (
  url?: string | null,
  widths: number[] = [480, 768, 1024, 1440, 1920]
): string => {
  if (!url) return "";

  return widths
    .map((w) => `${optimizeCloudinaryImage(url, { width: w })} ${w}w`)
    .join(", ");
};

/**
 * Use this before rendering an <img>. A value can be truthy but still be
 * unusable as an <img src> — a bare filename/public_id, a relative path,
 * or whitespace — all of which resolve against the *page's own* origin
 * and 404, producing a broken-image icon with the alt text bleeding out
 * (the exact symptom this guards against). Only accept absolute
 * (http/https or protocol-relative) URLs.
 */
export const hasCloudinaryImage = (url?: string | null): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Absolute URLs (Cloudinary etc) OR root-relative local paths.
  return /^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("/");
};