"use client";

import { Moon, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  formatTimeRemaining,
  getSearchScore,
  isOutsideSchoolHours,
} from "@/backend/utils";
import EmptyState from "@/components/common/EmptyState";
import FavoriteButton from "@/components/common/FavoriteButton";
import GlowCard from "@/components/common/GlowCard";
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
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
      transition={{ duration: 0.3 }}
      className="space-y-6 mt-6 pb-20"
    >
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Explorar Aulas
        </h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar aula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-2 sm:pb-0 scroll-custom">
            <button
              onClick={() => setFilter("all")}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-[#0A0A0A] dark:text-zinc-400 dark:border-white/10 dark:hover:bg-white/5"}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter("available")}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "available" ? "bg-emerald-500 text-white" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-[#0A0A0A] dark:text-zinc-400 dark:border-white/10 dark:hover:bg-white/5"}`}
            >
              Disponibles
            </button>
            <button
              onClick={() => setFilter("occupied")}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "occupied" ? "bg-rose-500 text-white" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-[#0A0A0A] dark:text-zinc-400 dark:border-white/10 dark:hover:bg-white/5"}`}
            >
              Ocupados
            </button>
          </div>
        </div>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((roomInfo, i) => {
            const isOccupied = roomInfo.status === "occupied";

            return (
              <GlowCard
                key={roomInfo.room.id}
                delay={searchQuery ? 0 : Math.min(i * 0.05, 0.5)}
                onClick={() =>
                  openScheduleModal({
                    id: roomInfo.room.id,
                    name: roomInfo.room.name,
                    type: "room",
                  })
                }
                className="p-5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm transition-colors cursor-pointer flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                      {roomInfo.room.name.toUpperCase()}
                    </h3>
                  </div>
                  <FavoriteButton
                    isFavorite={isFavorite(roomInfo.room.id)}
                    onClick={() => toggleFavorite(roomInfo.room.id)}
                    className="p-1.5 -mr-1.5 -mt-1.5 shrink-0"
                  />
                </div>

                <div className="mt-auto pt-4 flex items-end justify-between gap-2">
                  <div className="flex flex-col min-w-0 flex-1">
                    {isOutsideHours ? (
                      <>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                          Escuela Cerrada
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          Fuera de horario
                        </span>
                      </>
                    ) : isOccupied ? (
                      <>
                        <span className="text-sm font-medium text-rose-500 truncate">
                          Ocupado
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          Se libera{" "}
                          {formatTimeRemaining(roomInfo.timeUntilFree || 0)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-emerald-500 truncate">
                          Disponible
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          Próxima clase{" "}
                          {roomInfo.timeUntilOccupancy !== null
                            ? formatTimeRemaining(roomInfo.timeUntilOccupancy)
                            : "N/A"}
                        </span>
                      </>
                    )}
                  </div>
                  <div
                    className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1.5 shrink-0 whitespace-nowrap ${isOutsideHours ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20" : isOccupied ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"}`}
                  >
                    {isOutsideHours ? (
                      <>
                        <Moon className="w-3 h-3" />
                        CERRADO
                      </>
                    ) : (
                      <>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isOccupied ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`}
                        ></div>
                        {isOccupied ? "OCUPADO" : "LIBRE"}
                      </>
                    )}
                  </div>
                </div>
              </GlowCard>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
