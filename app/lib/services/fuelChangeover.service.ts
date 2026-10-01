import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { FuelChangeoverLog } from '../types';

const COLLECTION = 'fuelChangeoverLogs';

export const getAllFuelChangeoverLogs = async (): Promise<FuelChangeoverLog[]> => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FuelChangeoverLog));
};

export const addFuelChangeoverLog = async (data: Omit<FuelChangeoverLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateFuelChangeoverLog = async (id: string, data: Partial<Omit<FuelChangeoverLog, 'id' | 'createdAt' | 'updatedAt'>>) => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteFuelChangeoverLog = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION, id));
};