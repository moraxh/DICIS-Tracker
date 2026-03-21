"use client";

import { Clock, Moon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { formatTimeRemaining, isOutsideSchoolHours } from "@/backend/utils";
import EmptyState from "@/components/common/EmptyState";
import FavoriteButton from "@/components/common/FavoriteButton";
import GlowCard from "@/components/common/GlowCard";
import { useRooms } from "@/context/Rooms/useRooms";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

export default function AvailableRoomsSection() {
  const { roomsWithState, isLoading } = useRooms();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();

  const availableRooms = roomsWithState.freeRooms;
  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  if (isLoading) {
    return (
      <motion.section layout className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
            Salones disponibles ahora
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[104px]">
          {Array.from({ length: 4 }).map((_, _i) => (
            <div
              key={crypto.randomUUID()}
              className="w-full h-[104px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </motion.section>
    );
  }

  if (availableRooms.length === 0) {
    return (
      <motion.section layout className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
            Salones disponibles ahora
          </h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {availableRooms.length} espacios
          </span>
        </div>
        <EmptyState message="No hay salones disponibles en este momento" />
      </motion.section>
    );
  }

  return (
    <motion.section layout className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
          Salones disponibles ahora
        </h2>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {availableRooms.length} espacios
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-160 overflow-y-auto pr-2 scroll-custom min-h-[104px]">
        {availableRooms.map((roomInfo, i) => (
          <GlowCard
            onClick={() =>
              openScheduleModal({
                id: roomInfo.room.id,
                name: roomInfo.room.name,
                type: "room",
              })
            }
            key={roomInfo.room.id}
            delay={i * 0.05}
            className="p-5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6 gap-3">
              <h3 className="text-xl font-medium text-zinc-900 dark:text-white flex-1 min-w-0 line-clamp-2">
                {roomInfo.room.name.toUpperCase()}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <FavoriteButton
                  isFavorite={isFavorite(roomInfo.room.id)}
                  onClick={() => {
                    toggleFavorite(roomInfo.room.id);
                  }}
                  className="p-1.5 shrink-0"
                />
                <div
                  className={`px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-medium ${isOutsideHours ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-700 dark:text-zinc-300"} flex items-center gap-1.5 shrink-0 whitespace-nowrap`}
                >
                  {isOutsideHours ? (
                    <>
                      <Moon className="w-3 h-3" />
                      Fuera de horario
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      Disponible
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {isOutsideHours
                    ? "Escuela cerrada"
                    : roomInfo.timeUntilOccupancy !== null
                      ? formatTimeRemaining(roomInfo.timeUntilOccupancy)
                      : "Libre el resto del día"}
                </span>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
    </motion.section>
  );
}
