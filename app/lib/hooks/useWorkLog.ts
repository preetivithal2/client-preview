// lib/hooks/useWorkLog.ts
import { useState, useEffect, useCallback } from "react";
import {
  getAllWorkLogs,
  addWorkLog,
  updateWorkLog,
  deleteWorkLog,
} from "../firestore/workLog.service";
import { WorkLogEntry } from "../types";

export const useWorkLog = () => {
  const [data, setData] = useState<WorkLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const logs = await getAllWorkLogs();
      setData(logs);
    } catch (err: any) {
      console.error("useWorkLog.fetchAll:", err);
      setError(err.message || "Failed to load work logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const add = useCallback(
    async (entry: Omit<WorkLogEntry, "id">): Promise<string | null> => {
      try {
        const id = await addWorkLog(entry);
        await refetch();
        return id;
      } catch (err: any) {
        console.error("useWorkLog.add:", err);
        setError(err.message || "Failed to add work log.");
        return null;
      }
    },
    [refetch]
  );

  const update = useCallback(
    async (id: string, entry: Partial<WorkLogEntry>): Promise<boolean> => {
      try {
        await updateWorkLog(id, entry);
        await refetch();
        return true;
      } catch (err: any) {
        console.error("useWorkLog.update:", err);
        setError(err.message || "Failed to update work log.");
        return false;
      }
    },
    [refetch]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteWorkLog(id);
        await refetch();
        return true;
      } catch (err: any) {
        console.error("useWorkLog.delete:", err);
        setError(err.message || "Failed to delete work log.");
        return false;
      }
    },
    [refetch]
  );

  return { data, loading, error, refetch, add, update, remove };
};