// lib/firestore/bilgeWater.service.ts
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { BilgeWaterLog } from '../types';

const COLLECTION = 'bilgeWaterLogs';

export const getAllBilgeWaterLogs = async (): Promise<BilgeWaterLog[]> => {
  const q = query(collection(db, COLLECTION), orderBy('startDateTime', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BilgeWaterLog));
};

export const addBilgeWaterLog = async (data: Omit<BilgeWaterLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateBilgeWaterLog = async (id: string, data: Partial<Omit<BilgeWaterLog, 'id' | 'createdAt' | 'updatedAt'>>) => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteBilgeWaterLog = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION, id));
};