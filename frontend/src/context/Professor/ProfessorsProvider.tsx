"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import type {
  ProfessorsWithState,
  ProfessorWithSchedule,
} from "@/backend/services/professor.service";
import { ProfessorsContext } from "./ProfessorsContext";

export const ProfessorsProvider = ({ children }: { children: ReactNode }) => {
  const [professorsWithState, setProfessorsWithState] =
    useState<ProfessorsWithState>({
      freeProfessors: [],
      occupiedProfessors: [],
    });
  const [isLoading, setIsLoading] = useState(true);
  const [filterRules, setFilterRules] = useState<{
    state: "all" | "free" | "occupied";
    search: string;
  }>({
    state: "all",
    search: "",
  });

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/professors");
      if (!response.ok) {
        throw new Error("Failed to fetch professors");
      }
      const data: ProfessorsWithState = await response.json();
      setProfessorsWithState(data);
    } catch (error) {
      console.error("Error fetching professors:", error);
      setProfessorsWithState({ freeProfessors: [], occupiedProfessors: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProfessorScheduleById = useCallback(
    async (id: string): Promise<ProfessorWithSchedule | null> => {
      try {
        const response = await fetch(`/api/v1/professors/${id}/schedule`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error("Failed to fetch professor schedule");
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching professor schedule for ${id}:`, error);
        return null;
      }
    },
    [],
  );

  // Cargar datos al montar el componente
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refrescar cada 30 minutos
  useEffect(() => {
    const interval = setInterval(
      () => {
        refresh();
      },
      30 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <ProfessorsContext.Provider
      value={{
        professorsWithState,
        isLoading,
        filterRules,
        setFilterRules,
        refresh,
        getProfessorScheduleById,
      }}
    >
      {children}
    </ProfessorsContext.Provider>
  );
};
