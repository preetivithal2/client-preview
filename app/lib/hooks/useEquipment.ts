// lib/hooks/useEquipment.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllEquipment,
  addEquipment as addEquipmentService,
  updateEquipment as updateEquipmentService,
  deleteEquipment as deleteEquipmentService,
} from "../firestore/equipment.service";
import { Equipment } from "../types";

export function useEquipment() {
  const [data, setData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getAllEquipment();
      setData(items);
    } catch (err: any) {
      console.error("useEquipment.getAll:", err);
      setError(err.message || "Failed to load equipment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const add = useCallback(
    async (newData: Omit<Equipment, "id">): Promise<string | null> => {
      try {
        const id = await addEquipmentService(newData);
        await refetch();
        return id;
      } catch (err: any) {
        console.error("useEquipment.add:", err);
        setError(err.message || "Failed to add equipment.");
        return null;
      }
    },
    [refetch]
  );

  const update = useCallback(
    async (id: string, data: Partial<Equipment>): Promise<boolean> => {
      try {
        await updateEquipmentService(id, data);
        await refetch();
        return true;
      } catch (err: any) {
        console.error("useEquipment.update:", err);
        setError(err.message || "Failed to update equipment.");
        return false;
      }
    },
    [refetch]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteEquipmentService(id);
        await refetch();
        return true;
      } catch (err: any) {
        console.error("useEquipment.remove:", err);
        setError(err.message || "Failed to delete equipment.");
        return false;
      }
    },
    [refetch]
  );

  return { data, loading, error, add, update, remove, refetch };
}
