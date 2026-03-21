"use client";

import { DoorOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { isOutsideSchoolHours } from "@/backend/utils";
import HomeTableSection from "@/components/common/HomeTableSection";
import RoomCard from "@/components/common/RoomCard";
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
      icon={DoorOpen}
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
        <RoomCard
          key={roomInfo.room.id}
          room={roomInfo.room}
          status="available"
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
          delay={index * 0.05}
        />
      ))}
    </HomeTableSection>
  );
}
