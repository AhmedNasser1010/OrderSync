"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export interface R2Image {
  id: string;
  key: string;
  url: string;
  folder: string;
  fileName: string;
  size: number;
  contentType: string;
  createdBy: string;
  createdAt: number;
}

const WORKER_URL =
  process.env.NEXT_PUBLIC_R2_WORKER_URL ??
  "https://ordersync-r2.ahmedn-coder.workers.dev";

const UPLOAD_SECRET = process.env.NEXT_PUBLIC_R2_UPLOAD_SECRET ?? "";

const MAX_SIZE = 15 * 1024 * 1024;

/**
 * Uploads a file to the R2 bucket through the Cloudflare Worker.
 * Returns the public URL and object key. Does NOT persist a Firestore record.
 */
export async function uploadImageToR2(
  file: File,
  folder: string
): Promise<{ key: string; url: string; size: number }> {
  if (!UPLOAD_SECRET) {
    throw new Error("R2 upload secret is not configured.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds the 15MB limit.");
  }

  const res = await fetch(`${WORKER_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPLOAD_SECRET}`,
      "Content-Type": file.type || "application/octet-stream",
      "X-Filename": file.name,
      "X-Folder": folder,
    },
    body: file,
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    key?: string;
    url?: string;
    size?: number;
  };

  if (!res.ok || !data.url || !data.key) {
    throw new Error(data.error || "Upload failed.");
  }

  return {
    key: data.key,
    url: data.url,
    size: data.size ?? file.size,
  };
}

/**
 * Deletes an object from R2 by key, ignoring trailing extra keys.
 */
export async function deleteImageFromR2(key: string): Promise<void> {
  if (!UPLOAD_SECRET) {
    throw new Error("R2 upload secret is not configured.");
  }
  const res = await fetch(`${WORKER_URL}/delete?key=${encodeURIComponent(key)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${UPLOAD_SECRET}`,
    },
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Delete failed.");
  }
}

// ---------------------------------------------------------------------------
// Firestore index (r2Images) — mirrors the R2 objects so the gallery can
// list them and so deletions can clean up both places.
// ---------------------------------------------------------------------------

function userUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You must be signed in to upload images.");
  return uid;
}

export async function createImageRecord(image: {
  key: string;
  url: string;
  folder: string;
  fileName: string;
  size: number;
  contentType: string;
}): Promise<R2Image> {
  const createdBy = userUid();
  const ref = doc(collection(db, "r2Images"));
  const record: R2Image = {
    id: ref.id,
    ...image,
    createdBy,
    createdAt: Date.now(),
  };
  await setDoc(ref, record);
  return record;
}

export async function deleteImageRecord(imageId: string): Promise<void> {
  await deleteDoc(doc(db, "r2Images", imageId));
}

export async function listImages(): Promise<R2Image[]> {
  const q = query(collection(db, "r2Images"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as R2Image);
}

/**
 * High-level: upload a file to R2 and index it in Firestore.
 */
export async function uploadImage(file: File, folder: string): Promise<R2Image> {
  const { key, url, size } = await uploadImageToR2(file, folder);
  return createImageRecord({
    key,
    url,
    folder,
    fileName: file.name,
    size,
    contentType: file.type,
  });
}

/**
 * High-level: delete from both R2 and the Firestore index.
 */
export async function deleteImage(image: R2Image): Promise<void> {
  await Promise.allSettled([
    deleteImageFromR2(image.key).catch(() => undefined),
    deleteImageRecord(image.id).catch(() => undefined),
  ]);
}
