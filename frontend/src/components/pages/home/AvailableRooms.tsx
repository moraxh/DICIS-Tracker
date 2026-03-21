"use client";

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
      count={availableRooms.length}
      countLabel="espacios"
      variant="main"
      isLoading={isLoading}
      isEmpty={availableRooms.length === 0}
      emptyMessage="No hay salones disponibles en este momento"
      contentClassName="max-h-[980px] overflow-y-auto pr-2 scroll-custom min-h-[104px]"
    >
      {availableRooms.map((roomInfo) => (
        <RoomCard
          key={roomInfo.room.id}
          room={roomInfo.room}
          status="available"
          isOutsideHours={isOutsideHours}
          timeUntilOccupancy={roomInfo.timeUntilOccupancy}
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
    </HomeTableSection>
  );
}
