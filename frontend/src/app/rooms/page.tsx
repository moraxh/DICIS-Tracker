"use client";

import { DoorOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSearchScore, isOutsideSchoolHours } from "@/backend/utils";
import EmptyState from "@/components/common/EmptyState";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import RoomCard from "@/components/common/RoomCard";
import SearchBar from "@/components/common/SearchBar";
import Tabs from "@/components/common/Tabs";
import { useRooms } from "@/context/Rooms/useRooms";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

export default function RoomsPage() {
  const { roomsWithState, isLoading } = useRooms();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "occupied">("all");

  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  const filteredRooms = useMemo(() => {
    let rooms = [
      ...roomsWithState.freeRooms.map((r) => ({
        ...r,
        status: "available" as const,
      })),
      ...roomsWithState.occupiedRooms.map((r) => ({
        ...r,
        status: "occupied" as const,
      })),
    ];

    if (filter === "available") {
      rooms = rooms.filter((r) => r.status === "available");
    } else if (filter === "occupied") {
      rooms = rooms.filter((r) => r.status === "occupied");
    }

    if (searchQuery) {
      return rooms
        .map((r) => ({
          ...r,
          _score: getSearchScore(searchQuery, r.room.name),
        }))
        .filter((r) => r._score > 0)
        .sort(
          (a, b) =>
            b._score - a._score || a.room.name.localeCompare(b.room.name),
        );
    }

    return rooms.sort((a, b) => a.room.name.localeCompare(b.room.name));
  }, [roomsWithState, filter, searchQuery]);

  return (
    <LayoutSection className="space-y-6 mt-6 pb-20">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Explorar Aulas"
          icon={DoorOpen}
          count={filteredRooms.length}
          countLabel="espacios en total"
        />
        <div className="flex flex-col sm:flex-row gap-5">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar aula..."
            className="flex-1"
          />
          <Tabs
            tabs={[
              { id: "all", label: "Todos" },
              { id: "available", label: "Disponibles" },
              { id: "occupied", label: "Ocupados" },
            ]}
            activeTab={filter}
            onChange={setFilter}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(
            { length: 9 },
            (_, index) => `room-skeleton-${index}`,
          ).map((key) => (
            <div
              key={key}
              className="w-full h-[152px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <EmptyState message="No se encontraron aulas con los filtros seleccionados." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((roomInfo) => (
            <RoomCard
              key={roomInfo.room.id}
              room={roomInfo.room}
              status={roomInfo.status}
              isOutsideHours={isOutsideHours}
              timeUntilFree={roomInfo.timeUntilFree}
              timeUntilOccupancy={roomInfo.timeUntilOccupancy}
              occupiedUntilEnd={roomInfo.occupiedUntilEnd}
              currentOccupancy={roomInfo.currentOccupancy}
              isFavorite={isFavorite(roomInfo.room.id)}
              onToggleFavorite={() => toggleFavorite(roomInfo.room.id)}
              onClick={() =>
                openScheduleModal({
                  id: roomInfo.room.id,
                  name: roomInfo.room.name,
                  type: "room",
                })
              }
            />
          ))}
        </div>
      )}
    </LayoutSection>
  );
}
