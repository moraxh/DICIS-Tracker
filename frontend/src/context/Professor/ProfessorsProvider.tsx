"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ProfessorsWithState,
  ProfessorWithSchedule,
} from "@/backend/services/professor.service";
import { useHeadquarters } from "@/context/Headquarters/useHeadquarters";
import { ProfessorsContext } from "./ProfessorsContext";

export const ProfessorsProvider = ({ children }: { children: ReactNode }) => {
  const { selectedHeadquarters } = useHeadquarters();
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
  const scheduleCacheRef = useRef(
    new Map<string, ProfessorWithSchedule | null>(),
  );
  const pendingScheduleRequestsRef = useRef(
    new Map<string, Promise<ProfessorWithSchedule | null>>(),
  );

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/v1/professors?headquarters=${encodeURIComponent(selectedHeadquarters)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch professors");
      }
      const data: ProfessorsWithState = await response.json();
      data.freeProfessors.sort((a, b) =>
        a.professor.name.localeCompare(b.professor.name),
      );
      data.occupiedProfessors.sort((a, b) =>
        a.professor.name.localeCompare(b.professor.name),
      );
      setProfessorsWithState(data);
    } catch (error) {
      console.error("Error fetching professors:", error);
      setProfessorsWithState({ freeProfessors: [], occupiedProfessors: [] });
    } finally {
      setIsLoading(false);
    }
  }, [selectedHeadquarters]);

  const getProfessorScheduleById = useCallback(
    async (id: string): Promise<ProfessorWithSchedule | null> => {
      const cachedSchedule = scheduleCacheRef.current.get(id);
      if (cachedSchedule !== undefined) {
        return cachedSchedule;
      }

      const pendingRequest = pendingScheduleRequestsRef.current.get(id);
      if (pendingRequest) {
        return pendingRequest;
      }

      const request = (async () => {
        try {
          const response = await fetch(`/api/v1/professors/${id}/schedule`);
          if (!response.ok) {
            if (response.status === 404) {
              scheduleCacheRef.current.set(id, null);
              return null;
            }
            throw new Error("Failed to fetch professor schedule");
          }

          const data: ProfessorWithSchedule = await response.json();
          scheduleCacheRef.current.set(id, data);
          return data;
        } catch (error) {
          console.error(`Error fetching professor schedule for ${id}:`, error);
          return null;
        } finally {
          pendingScheduleRequestsRef.current.delete(id);
        }
      })();

      pendingScheduleRequestsRef.current.set(id, request);

      try {
        return await request;
      } finally {
        pendingScheduleRequestsRef.current.delete(id);
      }
    },
    [],
  );

  // Cargar datos al montar el componente
  useEffect(() => {
    scheduleCacheRef.current.clear();
    pendingScheduleRequestsRef.current.clear();
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
