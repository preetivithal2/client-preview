// lib/hooks/useCrewMembers.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllCrewMembers,
  addCrewMember,
  updateCrewMember,
  deleteCrewMember,
} from "../firestore/crewMember.service";
import { CrewMember } from "../types";

type NewCrew = Omit<CrewMember, "id" | "createdAt" | "updatedAt">;

export function useCrewMembers() {
  const [data, setData] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAllCrewMembers();
      setData(list);
    } catch (err: any) {
      console.error("useCrewMembers:", err);
      setError(err.message || "Failed to load crew roster.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const add = useCallback(async (member: NewCrew): Promise<string | null> => {
    try {
      const id = await addCrewMember(member);
      await refetch();
      return id;
    } catch (err: any) {
      console.error("useCrewMembers.add:", err);
      setError(err.message || "Failed to add crew member.");
      return null;
    }
  }, [refetch]);

  const update = useCallback(async (id: string, patch: Partial<NewCrew>): Promise<boolean> => {
    try {
      await updateCrewMember(id, patch);
      await refetch();
      return true;
    } catch (err: any) {
      console.error("useCrewMembers.update:", err);
      setError(err.message || "Failed to update crew member.");
      return false;
    }
  }, [refetch]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteCrewMember(id);
      await refetch();
      return true;
    } catch (err: any) {
      console.error("useCrewMembers.remove:", err);
      setError(err.message || "Failed to remove crew member.");
      return false;
    }
  }, [refetch]);

  return { data, loading, error, refetch, add, update, remove };
}
