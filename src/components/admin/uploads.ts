"use client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_RAW_IMAGE = 15 * 1024 * 1024; // before compression
const MAX_IMAGE = 5 * 1024 * 1024; // bucket limit
const MAX_PDF = 10 * 1024 * 1024;

export type ImageVariant = "photo" | "screenshot" | "og";
const VARIANT: Record<ImageVariant, { max: number; type: string; quality: number }> = {
  photo: { max: 800, type: "image/webp", quality: 0.86 },
  screenshot: { max: 1800, type: "image/webp", quality: 0.84 },
  og: { max: 1200, type: "image/jpeg", quality: 0.88 }, // JPEG is most widely accepted for link previews
};

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through */
    }
  }
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("This image couldn't be read. Try a JPG or PNG."));
    img.src = URL.createObjectURL(file);
  });
}

/** Resize + re-encode in the browser so pages stay fast. */
export async function compressImage(file: File, variant: ImageVariant): Promise<Blob> {
  const cfg = VARIANT[variant];
  const bmp = await loadBitmap(file);
  const w = "naturalWidth" in bmp ? bmp.naturalWidth : bmp.width;
  const h = "naturalHeight" in bmp ? bmp.naturalHeight : bmp.height;
  const scale = Math.min(1, cfg.max / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  if (cfg.type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, cfg.type, cfg.quality));
  if (blob && blob.type === cfg.type) return blob;
  // Browser can't encode WebP: fall back to JPEG.
  const jpg = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", cfg.quality));
  return jpg ?? file;
}

function extFor(type: string) {
  return type === "image/webp" ? "webp" : type === "image/png" ? "png" : type === "image/avif" ? "avif" : "jpg";
}

/** Uploads to the public "images" bucket. Returns "images/<path>". */
export async function uploadImage(file: File, folder: string, variant: ImageVariant): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Use a JPG, PNG, WebP or AVIF image.");
  if (file.size > MAX_RAW_IMAGE) throw new Error("That image is larger than 15 MB. Choose a smaller one.");
  const blob = await compressImage(file, variant);
  if (blob.size > MAX_IMAGE) throw new Error("The image is still over 5 MB after compression. Try a smaller image.");
  const path = `${folder}/${crypto.randomUUID()}.${extFor(blob.type)}`;
  const { error } = await getSupabaseBrowserClient()
    .storage.from("images")
    .upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(uploadError(error.message));
  return `images/${path}`;
}

/** Uploads a PDF to the public "documents" bucket. Returns "documents/<path>". */
export async function uploadPdf(file: File): Promise<string> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Choose a PDF file.");
  if (file.size > MAX_PDF) throw new Error("The PDF is larger than 10 MB. Export a smaller version and try again.");
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...head) !== "%PDF-") throw new Error("This file isn't a valid PDF.");
  const safe = file.name.replace(/\.pdf$/i, "").replace(/[^\w\-]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "resume";
  const path = `resume/${Date.now()}-${safe}.pdf`;
  const { error } = await getSupabaseBrowserClient()
    .storage.from("documents")
    .upload(path, file, { contentType: "application/pdf", cacheControl: "3600", upsert: false });
  if (error) throw new Error(uploadError(error.message));
  return `documents/${path}`;
}

function uploadError(msg: string) {
  if (/row-level security|unauthori[sz]ed|403/i.test(msg)) return "Upload refused: your admin session may have expired. Sign in again.";
  if (/mime|type/i.test(msg)) return "This file type isn't allowed.";
  if (/size|large/i.test(msg)) return "This file is too large.";
  return `Upload failed: ${msg}`;
}
