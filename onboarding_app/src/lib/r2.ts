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
import {
  uploadImageToR2Action,
  deleteImageFromR2Action,
} from "@/lib/r2-actions";

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

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to upload images.");
  return user.getIdToken();
}

/**
 * Uploads a file to the R2 bucket through a server action (keeps the
 * upload secret server-side). Returns the public URL and object key.
 * Does NOT persist a Firestore record.
 */
export async function uploadImageToR2(
  file: File,
  folder: string
): Promise<{ key: string; url: string; size: number }> {
  return uploadImageToR2Action(file, folder, await getAuthToken());
}

/**
 * Deletes an object from R2 by key through a server action.
 */
export async function deleteImageFromR2(key: string): Promise<void> {
  await deleteImageFromR2Action(key, await getAuthToken());
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
