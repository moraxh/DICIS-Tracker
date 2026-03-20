import { createContext, type Dispatch, type SetStateAction } from "react";
import type {
  RoomsWithState,
  RoomWithSchedule,
} from "@/backend/services/room.service";

type RoomContextType = {
  roomsWithState: RoomsWithState;
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
  getRoomScheduleById: (id: string) => Promise<RoomWithSchedule | null>;
};

export const RoomsContext = createContext<RoomContextType>({
  roomsWithState: { freeRooms: [], occupiedRooms: [] },
  isLoading: false,
  filterRules: { state: "all", search: "" },
  setFilterRules: () => {},
  refresh: async () => {},
  getRoomScheduleById: async () => null,
});
