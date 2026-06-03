"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  RoomsWithState,
  RoomWithSchedule,
} from "@/backend/services/room.service";
import { useHeadquarters } from "@/context/Headquarters/useHeadquarters";
import { RoomsContext } from "./RoomsContext";

export const RoomsProvider = ({ children }: { children: ReactNode }) => {
  const { selectedHeadquarters } = useHeadquarters();
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
  const scheduleCacheRef = useRef(new Map<string, RoomWithSchedule | null>());
  const pendingScheduleRequestsRef = useRef(
    new Map<string, Promise<RoomWithSchedule | null>>(),
  );

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/v1/rooms?headquarters=${encodeURIComponent(selectedHeadquarters)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }
      const data: RoomsWithState = await response.json();
      data.freeRooms.sort((a, b) => a.room.name.localeCompare(b.room.name));
      data.occupiedRooms.sort((a, b) => a.room.name.localeCompare(b.room.name));
      setRoomsWithState(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRoomsWithState({ freeRooms: [], occupiedRooms: [] });
    } finally {
      setIsLoading(false);
    }
  }, [selectedHeadquarters]);

  const getRoomScheduleById = useCallback(
    async (id: string): Promise<RoomWithSchedule | null> => {
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
          const response = await fetch(`/api/v1/rooms/${id}/schedule`);
          if (!response.ok) {
            if (response.status === 404) {
              scheduleCacheRef.current.set(id, null);
              return null;
            }
            throw new Error("Failed to fetch room schedule");
          }

          const data: RoomWithSchedule = await response.json();
          scheduleCacheRef.current.set(id, data);
          return data;
        } catch (error) {
          console.error(`Error fetching room schedule for ${id}:`, error);
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
