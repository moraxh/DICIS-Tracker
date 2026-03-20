"use client";

import { Moon, Search, DoorOpen } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  formatTimeRemaining,
  getSearchScore,
  isOutsideSchoolHours,
} from "@/backend/utils";
import EmptyState from "@/components/common/EmptyState";
import FavoriteButton from "@/components/common/FavoriteButton";
import GlowCard from "@/components/common/GlowCard";
import RoomCard from "@/components/common/RoomCard";
import PageHeader from "@/components/common/PageHeader";
import { useRooms } from "@/context/Rooms/useRooms";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import SearchBar from "@/components/common/SearchBar";
import Tabs from "@/components/common/Tabs";
import LayoutSection from "@/components/common/LayoutSection";

export default function RoomsPage() {
  const { roomsWithState, isLoading } = useRooms();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "occupied">("all");

  const setDebouncedSearchValue = useDebouncedCallback(
    (value: string) => setDebouncedSearch(value),
    { wait: 300 }
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setDebouncedSearchValue(value);
  };

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

    if (debouncedSearch) {
      return rooms
        .map((r) => ({
          ...r,
          _score: getSearchScore(debouncedSearch, r.room.name),
        }))
        .filter((r) => r._score > 0)
        .sort(
          (a, b) =>
            b._score - a._score || a.room.name.localeCompare(b.room.name),
        );
    }

    return rooms.sort((a, b) => a.room.name.localeCompare(b.room.name));
  }, [roomsWithState, filter, debouncedSearch]);

  const parentRef = useRef<HTMLDivElement>(null);

  const [columns, setColumns] = useState(3);
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 768) setColumns(1);
      else if (window.innerWidth < 1024) setColumns(2);
      else setColumns(3);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(filteredRooms.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
  });

  return (
    <LayoutSection className="h-[calc(100vh-140px)] flex flex-col space-y-6 mt-6">
      <div className="flex flex-col gap-6 shrink-0 px-1">
        <PageHeader 
          title="Explorar Aulas" 
          icon={DoorOpen} 
          count={filteredRooms.length} 
          countLabel="espacios en total"
        />
        <div className="flex flex-col sm:flex-row gap-5">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setDebouncedSearchValue(val);
            }}
            placeholder="Buscar aula..."
            className="flex-1"
          />
          <Tabs
            tabs={[
              { id: "all", label: "Todos" },
              { id: "available", label: "Disponibles" },
              { id: "occupied", label: "Ocupados" }
            ]}
            activeTab={filter}
            onChange={setFilter}
          />
        </div>
      </div>

      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto pr-2 scroll-custom"
        style={{ scrollBehavior: 'smooth' }}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-[152px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <EmptyState message="No se encontraron aulas con los filtros seleccionados." />
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * columns;
              const rowItems = filteredRooms.slice(startIndex, startIndex + columns);

              return (
                <div
                  key={virtualRow.key}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {rowItems.map((roomInfo) => (
                    <div key={roomInfo.room.id} className="py-2">
                      <RoomCard
                        room={roomInfo.room}
                        status={roomInfo.status}
                        isOutsideHours={isOutsideHours}
                        timeUntilFree={roomInfo.timeUntilFree}
                        timeUntilOccupancy={roomInfo.timeUntilOccupancy}
                        occupiedUntilEnd={roomInfo.occupiedUntilEnd}
                        currentOccupancy={roomInfo.currentOccupancy}
                        isFavorite={isFavorite(roomInfo.room.id)}
                        onToggleFavorite={() => toggleFavorite(roomInfo.room.id)}
                        onClick={() => openScheduleModal({
                          id: roomInfo.room.id,
                          name: roomInfo.room.name,
                          type: "room",
                        })}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LayoutSection>
  );
}
