import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Equipment } from "../types";

const COLLECTION = "equipment";

/**
 * Fetch all equipment, ordered by name ascending.
 */
export const getAllEquipment = async (): Promise<Equipment[]> => {
  const q = query(collection(db, COLLECTION), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Equipment));
};

/**
 * Fetch a single equipment document by ID.
 */
export const getEquipmentById = async (id: string): Promise<Equipment | null> => {
  const docSnap = await getDoc(doc(db, COLLECTION, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Equipment;
};

/**
 * Add new equipment with timestamps.
 */
export const addEquipment = async (data: Omit<Equipment, "id">): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Update existing equipment.
 */
export const updateEquipment = async (id: string, data: Partial<Equipment>): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete equipment by document ID.
 */
export const deleteEquipment = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};
