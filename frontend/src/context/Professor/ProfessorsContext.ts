import { createContext, type Dispatch, type SetStateAction } from "react";
import type {
  ProfessorsWithState,
  ProfessorWithSchedule,
} from "@/backend/services/professor.service";

type ProfessorContextType = {
  professorsWithState: ProfessorsWithState;
  isLoading: boolean;
  filterRules: {
    state: "all" | "free" | "occupied";
    search: string;
  };
  setFilterRules: Dispatch<
    SetStateAction<{
      state: "all" | "free" | "occupied";
      search: string;
    }>
  >;
  refresh: () => Promise<void>;
  getProfessorScheduleById: (
    id: string,
  ) => Promise<ProfessorWithSchedule | null>;
};

export const ProfessorsContext = createContext<ProfessorContextType>({
  professorsWithState: { freeProfessors: [], occupiedProfessors: [] },
  isLoading: false,
  filterRules: { state: "all", search: "" },
  setFilterRules: () => {},
  refresh: async () => {},
  getProfessorScheduleById: async () => null,
});
