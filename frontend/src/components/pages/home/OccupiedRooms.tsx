"use client";

import { Clock } from "lucide-react";
import { motion } from "motion/react";
import { formatTimeRemaining } from "@/backend/utils";
import EmptyState from "@/components/common/EmptyState";
import FavoriteButton from "@/components/common/FavoriteButton";
import GlowCard from "@/components/common/GlowCard";
import { useRooms } from "@/context/Rooms/useRooms";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

export default function OccupiedRoomsSection() {
  const { roomsWithState, isLoading } = useRooms();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();

  const occupiedRooms = roomsWithState.occupiedRooms;

  if (isLoading) {
    return (
      <motion.section layout className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
            Salones ocupados
          </h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[88px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </motion.section>
    );
  }

  if (occupiedRooms.length === 0) {
    return (
      <motion.section layout className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
            Salones ocupados
          </h2>
        </div>
        <EmptyState message="No hay salones ocupados en este momento" />
      </motion.section>
    );
  }

  return (
    <motion.section layout className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
          Salones ocupados
        </h2>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scroll-custom">
        {occupiedRooms.map((roomInfo) => (
          <GlowCard
            onClick={() =>
              openScheduleModal({
                id: roomInfo.room.id,
                name: roomInfo.room.name,
                type: "room",
              })
            }
            key={roomInfo.room.id}
            className="p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 shadow-sm hover:border-zinc-300 dark:hover:border-white/10 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between h-full">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-900 dark:text-white flex items-center gap-2.5">
                  <span className="truncate">
                    {roomInfo.room.name.toUpperCase()}
                  </span>
                  <FavoriteButton
                    isFavorite={isFavorite(roomInfo.room.id)}
                    onClick={() => {
                      toggleFavorite(roomInfo.room.id);
                    }}
                    className="p-1 shrink-0"
                    iconClassName="w-3.5 h-3.5"
                  />
                  <div className="px-2 py-0.5 rounded-md bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                    Ocupado
                  </div>
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 space-y-1 truncate">
                  <div className="truncate">
                    {roomInfo.currentOccupancy?.subject.subject}
                  </div>
                  {roomInfo.timeUntilFree !== null && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>
                        Se desocupa{" "}
                        {formatTimeRemaining(roomInfo.timeUntilFree)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
    </motion.section>
  );
}
