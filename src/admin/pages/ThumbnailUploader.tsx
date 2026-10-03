/**
 * ThumbnailUploader.tsx
 * 
 * Drop-in replacement for the thumbnail section in AdminCourses.tsx Tab 0.
 * Supports:
 *   1. File upload from system  → sent as multipart to backend → Cloudinary
 *   2. URL paste                → saved directly as thumbnail string
 * 
 * Usage inside CourseModal (Tab 0):
 *   <ThumbnailUploader
 *     preview={preview}
 *     onFile={(file, objectUrl) => { setThumb(file); setPreview(objectUrl); }}
 *     onUrl={(url) => { setPreview(url); setThumb(null); set("thumbnail", url); }}
 *     onClear={() => { setPreview(null); setThumb(null); set("thumbnail", ""); }}
 *     gradient={grad}
 *   />
 */

import { useRef, useState } from "react";
import { Upload, ImageIcon, Link, X } from "lucide-react";

interface ThumbnailUploaderProps {
  preview  : string | null;
  gradient : string;                               // tailwind gradient classes
  onFile   : (file: File, objectUrl: string) => void;
  onUrl    : (url: string) => void;
  onClear  : () => void;
}

export function ThumbnailUploader({
  preview, gradient, onFile, onUrl, onClear,
}: ThumbnailUploaderProps) {
  const fileRef            = useRef<HTMLInputElement>(null);
  const [mode, setMode]    = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");

  // ── File picked from system ────────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const objectUrl = URL.createObjectURL(f);
    onFile(f, objectUrl);
    setUrlInput("");
  };

  // ── URL submitted ──────────────────────────────────────────────────────────
  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { setUrlError("URL cannot be empty"); return; }
    try {
      new URL(trimmed); // basic validation
    } catch {
      setUrlError("Enter a valid URL (https://...)");
      return;
    }
    setUrlError("");
    onUrl(trimmed);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        Thumbnail image
      </label>

      {/* ── Mode toggle ── */}
      <div className="flex gap-1 mb-3 p-1 bg-secondary rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={[
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
            mode === "upload"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Upload size={12} /> Upload file
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={[
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
            mode === "url"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Link size={12} /> Paste URL
        </button>
      </div>

      {/* ── Preview box ── */}
      <div
        onClick={() => mode === "upload" && fileRef.current?.click()}
        className={[
          "relative h-44 w-full rounded-xl overflow-hidden border-2 border-dashed border-border transition-colors",
          mode === "upload" ? "cursor-pointer hover:border-primary" : "cursor-default",
        ].join(" ")}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
            <ImageIcon size={28} className="text-white/60" />
            <span className="text-sm text-white/60">
              {mode === "upload" ? "Click to upload" : "Preview will appear here"}
            </span>
          </div>
        )}

        {/* Hover overlay — only in upload mode */}
        {mode === "upload" && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Upload size={20} className="text-white" />
            <span className="ml-2 text-white text-sm">
              {preview ? "Change image" : "Upload image"}
            </span>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      {/* ── URL input (shown only in url mode) ── */}
      {mode === "url" && (
        <div className="mt-3 flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            placeholder="https://res.cloudinary.com/... or any image URL"
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 rounded-lg bg-[#0037FF] text-[#0037FF]-foreground text-sm font-medium hover:bg-[#0037FF]/90 transition-colors"
          >
            Use
          </button>
        </div>
      )}

      {urlError && (
        <p className="mt-1 text-xs text-destructive">{urlError}</p>
      )}

      {/* ── Clear button ── */}
      {preview && (
        <button
          type="button"
          onClick={() => { onClear(); setUrlInput(""); setUrlError(""); }}
          className="mt-2 flex items-center gap-1 text-xs text-destructive hover:underline"
        >
          <X size={11} /> Remove image
        </button>
      )}
    </div>
  );
}