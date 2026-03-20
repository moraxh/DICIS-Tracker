"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { 
  SubjectService, 
  type SubjectWithSchedule 
} from "@/backend/services/subject.service";
import { SubjectsContext } from "./SubjectsContext";

export const SubjectsProvider = ({ children }: { children: ReactNode }) => {
  const [subjects, setSubjects] = useState<SubjectWithSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRules, setFilterRules] = useState<{
    search: string;
  }>({
    search: "",
  });

  const refresh = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      // Calculate subjects and schedules locally
      const data = SubjectService.getAllSubjectsWithSchedule();
      
      // Sort for consistent UI
      data.sort((a, b) => a.subject.subject.localeCompare(b.subject.subject));
      
      setSubjects(data);
    } catch (error) {
      console.error("Error calculating subjects locally:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  const getSubjectScheduleById = useCallback(
    async (id: string): Promise<SubjectWithSchedule | null> => {
      // Calculate schedule locally
      return SubjectService.getSubjectSchedule(id);
    },
    [],
  );

  // Initial calculation
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SubjectsContext.Provider
      value={{
        subjects,
        isLoading,
        filterRules,
        setFilterRules,
        refresh,
        getSubjectScheduleById,
      }}
    >
      {children}
    </SubjectsContext.Provider>
  );
};
