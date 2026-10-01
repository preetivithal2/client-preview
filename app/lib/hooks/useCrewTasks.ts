// lib/hooks/useCrewTasks.ts — tasks (clones) for one crew member
"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasksForCrew, updateTask } from "../firestore/duty.service";
import { DutyTask } from "../types";

type TaskPatch = Partial<Omit<DutyTask, "id" | "createdAt" | "updatedAt">>;

export function useCrewTasks(crewId: string | null) {
  const [data, setData] = useState<DutyTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!crewId) { setData([]); return; }
    setLoading(true);
    setError(null);
    try {
      const list = await getTasksForCrew(crewId);
      setData(list);
    } catch (err: any) {
      console.error("useCrewTasks:", err);
      setError(err.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [crewId]);

  useEffect(() => { refetch(); }, [refetch]);

  const save = useCallback(async (id: string, patch: TaskPatch): Promise<boolean> => {
    try {
      await updateTask(id, patch);
      await refetch();
      return true;
    } catch (err: any) {
      console.error("useCrewTasks.save:", err);
      return false;
    }
  }, [refetch]);

  return { data, loading, error, refetch, save };
}
