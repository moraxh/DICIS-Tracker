"use client";

import { useEffect, useState } from "react";
import { isOutsideSchoolHours } from "@/backend/utils";
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

  const occupiedRooms = roomsWithState.occupiedRooms;
  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  return (
    <HomeTableSection
      title={title}
      count={occupiedRooms.length}
      countLabel="espacios"
      variant="side"
      isLoading={isLoading}
      isEmpty={occupiedRooms.length === 0}
      emptyMessage="No hay salones ocupados en este momento"
      contentClassName="max-h-[420px] overflow-y-auto pr-2 scroll-custom min-h-[104px]"
    >
      {occupiedRooms.map((roomInfo) => (
        <RoomCard
          key={roomInfo.room.id}
          room={roomInfo.room}
          status="occupied"
          isOutsideHours={isOutsideHours}
          timeUntilFree={roomInfo.timeUntilFree}
          currentOccupancy={roomInfo.currentOccupancy}
          occupiedUntilEnd={roomInfo.occupiedUntilEnd}
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
