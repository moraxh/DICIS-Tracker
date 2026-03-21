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

type AvailableRoomsProps = {
  hideTitle?: boolean;
};

export default function AvailableRoomsSection({
  hideTitle = false,
}: AvailableRoomsProps) {
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
      <LayoutSection className="space-y-4">
        {!hideTitle && <PageHeader title="Salones libres" icon={DoorOpen} />}
        <CardGrid columns={2} className="min-h-[104px]">
          {Array.from(
            { length: 4 },
            (_, index) => `available-room-skeleton-${index}`,
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

  if (availableRooms.length === 0) {
    return (
      <LayoutSection className="space-y-4">
        {!hideTitle && (
          <PageHeader
            title="Salones libres"
            icon={DoorOpen}
            count={availableRooms.length}
            countLabel="espacios"
          />
        )}
        <EmptyState message="No hay salones libres en este momento" />
      </LayoutSection>
    );
  }

  return (
    <LayoutSection className="space-y-4">
      {!hideTitle && (
        <PageHeader
          title="Salones libres"
          icon={DoorOpen}
          count={availableRooms.length}
          countLabel="espacios"
        />
      )}

      <CardGrid
        columns={2}
        className="max-h-[1000px] overflow-y-auto pr-2 scroll-custom min-h-[104px]"
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
      </CardGrid>
    </LayoutSection>
  );
}
