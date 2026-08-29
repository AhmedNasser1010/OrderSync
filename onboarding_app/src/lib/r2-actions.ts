"use server";

import "server-only";

import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";

const WORKER_URL =
  process.env.NEXT_PUBLIC_R2_WORKER_URL ??
  "https://ordersync-r2.ahmedn-coder.workers.dev";

const UPLOAD_SECRET = process.env.R2_UPLOAD_SECRET ?? "";

const MAX_SIZE = 15 * 1024 * 1024;

async function requireVerifiedUid(idToken: string): Promise<string> {
  const app = await initAdmin();
  const decoded = await getAuth(app).verifyIdToken(idToken);
  return decoded.uid;
}

export async function uploadImageToR2Action(
  file: File,
  folder: string,
  idToken: string
): Promise<{ key: string; url: string; size: number }> {
  await requireVerifiedUid(idToken);
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

export async function deleteImageFromR2Action(
  key: string,
  idToken: string
): Promise<void> {
  await requireVerifiedUid(idToken);
  if (!UPLOAD_SECRET) {
    throw new Error("R2 upload secret is not configured.");
  }
  const res = await fetch(
    `${WORKER_URL}/delete?key=${encodeURIComponent(key)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${UPLOAD_SECRET}`,
      },
    }
  );
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Delete failed.");
  }
}