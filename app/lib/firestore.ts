// lib/firestore.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';
import { Equipment, Regulation, WorkLogEntry, DropdownDoc } from './types';

// ---------- DROPDOWNS ----------
export const getDropdown = async (key: string): Promise<DropdownDoc | null> => {
  const docSnap = await getDoc(doc(db, 'dropdowns', key));
  return docSnap.exists() ? (docSnap.data() as DropdownDoc) : null;
};

export const updateDropdownOptions = async (key: string, options: string[], label?: string, placeholder?: string) => {
  // Use setDoc with merge so it creates the doc if missing, updates if it exists
  const data: Record<string, any> = {
    options,
    updatedAt: serverTimestamp(),
  };
  if (label) data.label = label;
  if (placeholder) data.placeholder = placeholder;
  await setDoc(doc(db, 'dropdowns', key), data, { merge: true });
};

// ---------- EQUIPMENT ----------
export const getAllEquipment = async (): Promise<Equipment[]> => {
  const q = query(collection(db, 'equipment'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment));
};

export const addEquipment = async (data: Omit<Equipment, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'equipment'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateEquipment = async (id: string, data: Partial<Equipment>) => {
  await updateDoc(doc(db, 'equipment', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteEquipment = async (id: string) => {
  await deleteDoc(doc(db, 'equipment', id));
};

// ---------- REGULATIONS ----------
export const getAllRegulations = async (): Promise<Regulation[]> => {
  const snap = await getDocs(collection(db, 'regulations'));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Regulation));
};

export const addRegulation = async (code: string, description?: string, attachment?: { name: string; url: string; type?: string } | null, files?: any[]): Promise<string> => {
  const ref = await addDoc(collection(db, 'regulations'), {
    code,
    description: description || '',
    attachment: attachment || null,
    files: files || [],
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateRegulation = async (id: string, code: string, description?: string, attachment?: { name: string; url: string; type?: string } | null, files?: any[]) => {
  const data: Record<string, any> = {
    code,
    description: description || '',
    attachment: attachment || null,
    files: files || [],
    updatedAt: serverTimestamp(),
  };
  await updateDoc(doc(db, 'regulations', id), data);
};

export const deleteRegulation = async (id: string) => {
  await deleteDoc(doc(db, 'regulations', id));
};

// ---------- WORK LOG ----------
export const getAllWorkLogs = async (): Promise<WorkLogEntry[]> => {
  const q = query(collection(db, 'workLogs'), orderBy('reportedDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkLogEntry));
};

export const addWorkLog = async (data: Omit<WorkLogEntry, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'workLogs'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateWorkLog = async (id: string, data: Partial<WorkLogEntry>) => {
  await updateDoc(doc(db, 'workLogs', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteWorkLog = async (id: string) => {
  await deleteDoc(doc(db, 'workLogs', id));
};

// (Optionally add filter functions for records)