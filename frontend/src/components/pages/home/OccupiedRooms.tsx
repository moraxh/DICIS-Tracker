"use client";

import { DoorOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { isOutsideSchoolHours } from "@/backend/utils";
import CardGrid from "@/components/common/CardGrid";
import EmptyState from "@/components/common/EmptyState";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import RoomCard from "@/components/common/RoomCard";
import { useRooms } from "@/context/Rooms/useRooms";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

type OccupiedRoomsProps = {
  hideTitle?: boolean;
};

export default function OccupiedRoomsSection({
  hideTitle = false,
}: OccupiedRoomsProps) {
  const { roomsWithState, isLoading } = useRooms();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();

  const occupiedRooms = roomsWithState.occupiedRooms;
  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  if (isLoading) {
    return (
      <LayoutSection className="space-y-4">
        {!hideTitle && <PageHeader title="Salones ocupados" icon={DoorOpen} />}
        <CardGrid columns={2} className="min-h-[104px]">
          {Array.from(
            { length: 4 },
            (_, index) => `occupied-room-skeleton-${index}`,
          ).map((key) => (
            <div
              key={key}
              className="w-full h-[152px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </CardGrid>
      </LayoutSection>
    );
  }

  if (occupiedRooms.length === 0) {
    return (
      <LayoutSection className="space-y-4">
        {!hideTitle && (
          <PageHeader
            title="Salones ocupados"
            icon={DoorOpen}
            count={occupiedRooms.length}
            countLabel="espacios"
          />
        )}
        <EmptyState message="No hay salones ocupados en este momento" />
      </LayoutSection>
    );
  }

  return (
    <LayoutSection className="space-y-4">
      {!hideTitle && (
        <PageHeader
          title="Salones ocupados"
          icon={DoorOpen}
          count={occupiedRooms.length}
          countLabel="espacios"
        />
      )}

      <CardGrid
        columns={2}
        className="max-h-[1000px] overflow-y-auto pr-2 scroll-custom min-h-[104px]"
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
      </CardGrid>
    </LayoutSection>
  );
}
