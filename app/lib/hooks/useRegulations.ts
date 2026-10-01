// lib/hooks/useRegulations.ts (ALL IN ONE)
"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Regulation } from '../types';

export function useRegulations() {
  const [data, setData] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Firestore CRUD functions (inlined) ----
  const getAllRegulations = async (): Promise<Regulation[]> => {
    const snap = await getDocs(collection(db, 'regulations'));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Regulation));
  };

  const addRegulation = async (code: string, description?: string, attachment?: { name: string; url: string; type?: string } | null, files?: any[]): Promise<string> => {
    const ref = await addDoc(collection(db, 'regulations'), {
      code,
      description: description || '',
      attachment: attachment || null,
      files: files || [],
      createdAt: serverTimestamp(),
    });
    return ref.id;
  };

  const updateRegulation = async (id: string, code: string, description?: string, attachment?: { name: string; url: string; type?: string } | null, files?: any[]): Promise<void> => {
    await updateDoc(doc(db, 'regulations', id), {
      code,
      description: description || '',
      attachment: attachment || null,
      files: files || [],
      updatedAt: serverTimestamp(),
    });
  };

  const deleteRegulation = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'regulations', id));
  };

  // ---- Hook logic ----
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getAllRegulations();
      setData(items);
    } catch (err: any) {
      console.error("useRegulations.getAll:", err);
      setError(err.message || "Failed to load regulations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const add = useCallback(
    async (code: string, description?: string, attachment?: { name: string; url: string; type?: string } | null, files?: any[]): Promise<string | null> => {
      try {
        const id = await addRegulation(code, description, attachment, files);
        await refetch();
        return id;
      } catch (err: any) {
        console.error("useRegulations.add:", err);
        setError(err.message || "Failed to add regulation.");
        return null;
      }
    },
    [refetch]
  );

  const update = useCallback(
    async (id: string, code: string, description?: string, attachment?: { name: string; url: string; type?: string } | null, files?: any[]): Promise<boolean> => {
      try {
        await updateRegulation(id, code, description, attachment, files);
        await refetch();
        return true;
      } catch (err: any) {
        console.error("useRegulations.update:", err);
        setError(err.message || "Failed to update regulation.");
        return false;
      }
    },
    [refetch]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteRegulation(id);
        await refetch();
        return true;
      } catch (err: any) {
        console.error("useRegulations.remove:", err);
        setError(err.message || "Failed to delete regulation.");
        return false;
      }
    },
    [refetch]
  );

  return { data, loading, error, add, update, remove, refetch };
}