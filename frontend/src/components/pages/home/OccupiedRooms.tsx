"use client";

import { Clock } from "lucide-react";
import { formatTimeRemaining } from "@/backend/utils";
import FavoriteButton from "@/components/common/FavoriteButton";
import GlowCard from "@/components/common/GlowCard";
import HomeTableSection from "@/components/common/HomeTableSection";
import { useRooms } from "@/context/Rooms/useRooms";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

type OccupiedRoomsProps = {
  title?: string;
};

export default function OccupiedRoomsSection({
  title = "Salones ocupados",
}: OccupiedRoomsProps) {
  const { roomsWithState, isLoading } = useRooms();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();

  const occupiedRooms = [...roomsWithState.occupiedRooms].sort((a, b) => {
    if (a.occupiedUntilEnd && !b.occupiedUntilEnd) return 1;
    if (!a.occupiedUntilEnd && b.occupiedUntilEnd) return -1;
    return (a.timeUntilFree || 0) - (b.timeUntilFree || 0);
  });

  return (
    <HomeTableSection
      title={title}
      variant="side"
      showCount={false}
      isLoading={isLoading}
      isEmpty={occupiedRooms.length === 0}
      emptyMessage="No hay salones ocupados en este momento"
      contentLayout="stack"
      contentClassName="space-y-3 max-h-96 overflow-y-auto pr-2 scroll-custom min-h-[88px]"
      skeletonClassName="w-full h-[88px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
    >
      {occupiedRooms.map((roomInfo) => (
        <GlowCard
          key={roomInfo.room.id}
          onClick={() =>
            openScheduleModal({
              id: roomInfo.room.id,
              name: roomInfo.room.name,
              type: "room",
            })
          }
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
              <div className="mt-0.5 space-y-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                <div className="truncate">
                  {roomInfo.currentOccupancy?.subject.subject}
                </div>
                {roomInfo.occupiedUntilEnd ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>Ocupado por el resto del día</span>
                  </div>
                ) : roomInfo.timeUntilFree !== null ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>
                      Se desocupa {formatTimeRemaining(roomInfo.timeUntilFree)}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </GlowCard>
      ))}
    </HomeTableSection>
  );
}
