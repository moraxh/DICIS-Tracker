"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { 
  ProfessorService, 
  type ProfessorsWithState, 
  type ProfessorWithSchedule 
} from "@/backend/services/professor.service";
import { ProfessorsContext } from "./ProfessorsContext";

export const ProfessorsProvider = ({ children }: { children: ReactNode }) => {
  const [professorsWithState, setProfessorsWithState] = useState<ProfessorsWithState>({
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

  const refresh = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      // Calculate state locally using ProfessorService
      const data = ProfessorService.getProfessorsWithState();
      
      // Sort for consistent UI
      data.freeProfessors.sort((a, b) => a.professor.name.localeCompare(b.professor.name));
      data.occupiedProfessors.sort((a, b) => a.professor.name.localeCompare(b.professor.name));
      
      setProfessorsWithState(data);
    } catch (error) {
      console.error("Error calculating professors state locally:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  const getProfessorScheduleById = useCallback(
    async (id: string): Promise<ProfessorWithSchedule | null> => {
      // Calculate schedule locally
      return ProfessorService.getProfessorSchedule(id);
    },
    [],
  );

  // Initial calculation and 1-minute refresh for "Live" status
  useEffect(() => {
    refresh();
    const interval = setInterval(() => refresh(true), 60000);
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
