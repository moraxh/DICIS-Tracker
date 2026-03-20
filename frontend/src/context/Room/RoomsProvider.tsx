"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  RoomsWithState,
  RoomWithSchedule,
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

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/rooms");
      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }
      const data: RoomsWithState = await response.json();
      setRoomsWithState(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRoomsWithState({ freeRooms: [], occupiedRooms: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRoomScheduleById = useCallback(
    async (id: string): Promise<RoomWithSchedule | null> => {
      try {
        const response = await fetch(`/api/v1/rooms/${id}/schedule`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error("Failed to fetch room schedule");
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching room schedule for ${id}:`, error);
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
