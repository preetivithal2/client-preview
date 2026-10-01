import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { WorkLogEntry } from "../types";

const COLLECTION = "workLogs";

/**
 * Fetch all work logs, ordered by reportedDate descending.
 */
export const getAllWorkLogs = async (): Promise<WorkLogEntry[]> => {
  const q = query(collection(db, COLLECTION), orderBy("reportedDate", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as WorkLogEntry));
};

/**
 * Fetch a single work log by its document ID.
 */
export const getWorkLogById = async (id: string): Promise<WorkLogEntry | null> => {
  const docSnap = await getDoc(doc(db, COLLECTION, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as WorkLogEntry;
};

/**
 * Add a new work log entry with timestamps.
 * @returns The new document ID.
 */
export const addWorkLog = async (
  data: Omit<WorkLogEntry, "id">
): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Update an existing work log entry.
 * Only `updatedAt` is auto-set — `createdAt` is preserved.
 */
export const updateWorkLog = async (
  id: string,
  data: Partial<WorkLogEntry>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a work log entry by document ID.
 * Does NOT delete associated media files from Storage.
 */
export const deleteWorkLog = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};