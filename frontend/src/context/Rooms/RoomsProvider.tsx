"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { 
  RoomService, 
  type RoomsWithState, 
  type RoomWithSchedule 
} from "@/backend/services/room.service";
import { RoomsContext } from "./RoomsContext";

export const RoomsProvider = ({ children }: { children: ReactNode }) => {
  const [roomsWithState, setRoomsWithState] = useState<RoomsWithState>({
    freeRooms: [],
    occupiedRooms: [],
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
      
      // Calculate state locally using RoomService
      const data = RoomService.getRoomsWithState();
      
      // Sort for consistent UI
      data.freeRooms.sort((a, b) => a.room.name.localeCompare(b.room.name));
      data.occupiedRooms.sort((a, b) => a.room.name.localeCompare(b.room.name));
      
      setRoomsWithState(data);
    } catch (error) {
      console.error("Error calculating rooms state locally:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  const getRoomScheduleById = useCallback(
    async (id: string): Promise<RoomWithSchedule | null> => {
      // Calculate schedule locally
      return RoomService.getRoomSchedule(id);
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
    <RoomsContext.Provider
      value={{
        roomsWithState,
        isLoading,
        filterRules,
        setFilterRules,
        refresh,
        getRoomScheduleById,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
};
