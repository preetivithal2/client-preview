// lib/hooks/useAllCrewTasks.ts — every crew member's tasks at once.
// Sibling of useCrewTasks (which loads a single member); the crew-performance
// list needs the whole set so it can rate and filter every member before one
// of them is selected.
"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllTasks } from "../firestore/duty.service";
import { DutyTask } from "../types";

export function useAllCrewTasks() {
  const [data, setData] = useState<DutyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAllTasks();
      setData(list);
    } catch (err: any) {
      console.error("useAllCrewTasks:", err);
      setError(err.message || "Failed to load duties.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
