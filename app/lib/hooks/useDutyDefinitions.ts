// lib/hooks/useDutyDefinitions.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllDefinitions,
  archiveDefinition,
  dispatchOrder,
  materializeRecurring,
  updateOrder,
  deleteOrder,
  DispatchInput,
  OrderEdit,
} from "../firestore/duty.service";
import { DutyDefinition } from "../types";

export function useDutyDefinitions() {
  const [data, setData] = useState<DutyDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAllDefinitions();
      setData(list);
    } catch (err: any) {
      console.error("useDutyDefinitions:", err);
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const dispatch = useCallback(async (input: DispatchInput): Promise<string | null> => {
    try {
      const id = await dispatchOrder(input);
      await refetch();
      return id;
    } catch (err: any) {
      console.error("useDutyDefinitions.dispatch:", err);
      setError(err.message || "Failed to dispatch order.");
      return null;
    }
  }, [refetch]);

  const archive = useCallback(async (id: string): Promise<boolean> => {
    try {
      await archiveDefinition(id);
      await refetch();
      return true;
    } catch (err: any) {
      console.error("useDutyDefinitions.archive:", err);
      setError(err.message || "Failed to archive order.");
      return false;
    }
  }, [refetch]);

  /** Generate due daily/weekly/monthly clones that do not exist yet. */
  const ensureRecurring = useCallback(async (): Promise<void> => {
    try { await materializeRecurring(); } catch (err) { console.error("materializeRecurring:", err); }
  }, []);

  /** Edit an order (title / description / frequency / recipients / status). */
  const update = useCallback(
    async (id: string, edit: OrderEdit, addedCrew: { id: string; name: string; rank: string }[] = []): Promise<boolean> => {
      try {
        await updateOrder(id, edit, addedCrew);
        await refetch();
        return true;
      } catch (err: any) {
        console.error("useDutyDefinitions.update:", err);
        setError(err.message || "Failed to update order.");
        return false;
      }
    },
    [refetch]
  );

  /** Permanently delete an order and all of its per-crew clones. */
  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteOrder(id);
      await refetch();
      return true;
    } catch (err: any) {
      console.error("useDutyDefinitions.remove:", err);
      setError(err.message || "Failed to delete order.");
      return false;
    }
  }, [refetch]);

  return { data, loading, error, refetch, dispatch, archive, ensureRecurring, update, remove };
}
