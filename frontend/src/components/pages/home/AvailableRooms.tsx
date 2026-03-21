"use client";

import { Clock, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { formatTimeRemaining, isOutsideSchoolHours } from "@/backend/utils";
import FavoriteButton from "@/components/common/FavoriteButton";
import GlowCard from "@/components/common/GlowCard";
import HomeTableSection from "@/components/common/HomeTableSection";
import { useRooms } from "@/context/Rooms/useRooms";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

type AvailableRoomsProps = {
  title?: string;
};

export default function AvailableRoomsSection({
  title = "Salones disponibles ahora",
}: AvailableRoomsProps) {
  const { roomsWithState, isLoading } = useRooms();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();

  const availableRooms = roomsWithState.freeRooms;
  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  return (
    <HomeTableSection
      title={title}
      count={availableRooms.length}
      countLabel="espacios"
      variant="main"
      isLoading={isLoading}
      isEmpty={availableRooms.length === 0}
      emptyMessage="No hay salones disponibles en este momento"
      contentClassName="max-h-160 overflow-y-auto pr-2 scroll-custom min-h-[104px]"
      skeletonClassName="w-full h-[104px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
    >
      {availableRooms.map((roomInfo, index) => (
        <GlowCard
          key={roomInfo.room.id}
          onClick={() =>
            openScheduleModal({
              id: roomInfo.room.id,
              name: roomInfo.room.name,
              type: "room",
            })
          }
          delay={index * 0.05}
          className="p-5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between mb-6 gap-3">
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
                className={`px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-medium flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isOutsideHours
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
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
    </HomeTableSection>
  );
}
