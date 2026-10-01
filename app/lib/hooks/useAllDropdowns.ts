import { useState, useEffect, useCallback } from "react";
import { getAllDropdownsMap } from "../firestore/filters.service";
import { DropdownDoc } from "../types";

export const useAllDropdowns = () => {
  const [dropdowns, setDropdowns] = useState<Record<string, DropdownDoc>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const map = await getAllDropdownsMap();
      setDropdowns(map);
    } catch (err: any) {
      console.error("useAllDropdowns:", err);
      setError(err.message || "Failed to load dropdowns.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const getOptions = useCallback(
    (key: string): string[] => {
      return dropdowns[key]?.options ?? [];
    },
    [dropdowns]
  );

  return { dropdowns, loading, error, getOptions, refetch };
};
