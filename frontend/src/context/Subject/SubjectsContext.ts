import { createContext, type Dispatch, type SetStateAction } from "react";
import type { SubjectWithSchedule } from "@/backend/services/subject.service";

type SubjectsContextType = {
  subjects: SubjectWithSchedule[];
  isLoading: boolean;
  filterRules: {
    search: string;
  };
  setFilterRules: Dispatch<
    SetStateAction<{
      search: string;
    }>
  >;
  refresh: (silent?: boolean) => Promise<void>;
  getSubjectScheduleById: (id: string) => Promise<SubjectWithSchedule | null>;
};

export const SubjectsContext = createContext<SubjectsContextType>({
  subjects: [],
  isLoading: false,
  filterRules: { search: "" },
  setFilterRules: () => {},
  refresh: async () => {},
  getSubjectScheduleById: async () => null,
});
