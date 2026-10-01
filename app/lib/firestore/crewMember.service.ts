// lib/firestore/crewMember.service.ts
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { CrewMember } from "../types";

const COLLECTION = "crewMembers";

/** All crew, on-board first then by joined date (newest first). */
export const getAllCrewMembers = async (): Promise<CrewMember[]> => {
  const q = query(collection(db, COLLECTION), orderBy("joinedDate", "desc"));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CrewMember));
  return list.sort((a, b) => (a.onBoard === b.onBoard ? 0 : a.onBoard ? -1 : 1));
};

export const addCrewMember = async (data: Omit<CrewMember, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    joinedDate: data.joinedDate || new Date().toISOString().slice(0, 10),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateCrewMember = async (
  id: string,
  data: Partial<Omit<CrewMember, "id" | "createdAt" | "updatedAt">>
) => {
  await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteCrewMember = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION, id));
};
