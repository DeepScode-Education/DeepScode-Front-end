// src/lib/portfolioUpload.ts
//
// Uploads thumbnail/gallery files through YOUR backend
// (POST /api/student/portfolio/upload), which then does a signed upload
// to Cloudinary using your existing CLOUDINARY_API_KEY/SECRET — the
// frontend never touches Cloudinary directly, so no preset or exposed
// secret is needed.
//
// Function names match what PortfolioForm.tsx already imports, so no
// changes needed there — just make sure this file replaces the old
// cloudinaryUpload.ts.

import { BASE_URL, getToken } from "@/integrations/client";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export type UploadProgressHandler = (percent: number) => void;

/**
 * Uploads a single file to POST /api/student/portfolio/upload and
 * returns { url, publicId } from the backend's Cloudinary response.
 */
export function uploadToCloudinary(
  file: File,
  onProgress?: UploadProgressHandler,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/api/student/portfolio/upload`);

    const token = getToken();
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          resolve({ url: data.data.url, publicId: data.data.publicId });
        } else {
          reject(new Error(data?.message || "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed — could not parse response"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}

/** Uploads multiple files (sequentially reused single-upload calls), reporting overall % progress. */
export async function uploadManyToCloudinary(
  files: File[],
  onProgress?: UploadProgressHandler,
): Promise<CloudinaryUploadResult[]> {
  if (files.length === 0) return [];

  const progressMap = new Array(files.length).fill(0);
  const notify = () => {
    if (!onProgress) return;
    const total = progressMap.reduce((a, b) => a + b, 0) / files.length;
    onProgress(Math.round(total));
  };

  return Promise.all(
    files.map((file, i) =>
      uploadToCloudinary(file, (pct) => {
        progressMap[i] = pct;
        notify();
      }),
    ),
  );
}