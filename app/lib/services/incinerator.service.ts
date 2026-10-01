import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { IncineratorLog } from '../types';

const COLLECTION = 'incineratorLogs';

export const getAllIncineratorLogs = async (): Promise<IncineratorLog[]> => {
  const q = query(collection(db, COLLECTION), orderBy('startDateTime', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as IncineratorLog));
};

export const addIncineratorLog = async (data: Omit<IncineratorLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateIncineratorLog = async (id: string, data: Partial<Omit<IncineratorLog, 'id' | 'createdAt' | 'updatedAt'>>) => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteIncineratorLog = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION, id));
};