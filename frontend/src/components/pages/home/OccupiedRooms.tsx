"use client";

import { DoorOpen } from "lucide-react";
import HomeTableSection from "@/components/common/HomeTableSection";
import RoomCard from "@/components/common/RoomCard";
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
      icon={DoorOpen}
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
        <RoomCard
          key={roomInfo.room.id}
          room={roomInfo.room}
          status="occupied"
          isOutsideHours={false}
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
          delay={0}
        />
      ))}
    </HomeTableSection>
  );
}
