"use client";

import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { isOutsideSchoolHours } from "@/backend/utils";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import ProfessorCard from "@/components/common/ProfessorCard";
import RoomCard from "@/components/common/RoomCard";
import { useProfessors } from "@/context/Professor/useProfessors";
import { useRooms } from "@/context/Rooms/useRooms";
import { useFavorites } from "@/hooks/useFavorites";
import { useFavoritesData } from "@/hooks/useFavoritesData";
import { useScheduleModal } from "@/hooks/useScheduleModal";

export default function FavoritesSection() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { rooms: favoriteRooms, professors: favoriteProfessors } =
    useFavoritesData();
  const { roomsWithState } = useRooms();
  const { professorsWithState } = useProfessors();
  const { openScheduleModal } = useScheduleModal();

  const hasAnyFavorites =
    favoriteRooms.length > 0 || favoriteProfessors.length > 0;
  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  const favoriteRoomState = useMemo(() => {
    const roomStateById = new Map(
      [...roomsWithState.freeRooms, ...roomsWithState.occupiedRooms].map(
        (item) => [item.room.id, item] as const,
      ),
    );

    return favoriteRooms
      .map((room) => {
        const roomInfo = roomStateById.get(room.id);
        if (!roomInfo) return null;

        return {
          room,
          roomInfo,
          status: roomsWithState.freeRooms.some(
            (item) => item.room.id === room.id,
          )
            ? ("available" as const)
            : ("occupied" as const),
        };
      })
      .filter((item) => item !== null);
  }, [favoriteRooms, roomsWithState]);

  const favoriteProfessorState = useMemo(() => {
    const professorStateById = new Map(
      [
        ...professorsWithState.freeProfessors,
        ...professorsWithState.occupiedProfessors,
      ].map((item) => [item.professor.id, item] as const),
    );

    return favoriteProfessors
      .map((professor) => {
        const professorInfo = professorStateById.get(professor.id);
        if (!professorInfo) return null;

        return {
          professor,
          professorInfo,
          status: professorsWithState.freeProfessors.some(
            (item) => item.professor.id === professor.id,
          )
            ? ("available" as const)
            : ("occupied" as const),
        };
      })
      .filter((item) => item !== null);
  }, [favoriteProfessors, professorsWithState]);

  return (
    <AnimatePresence>
      {hasAnyFavorites && (
        <motion.section
          layout
          initial={{
            opacity: 0,
            height: 0,
            overflow: "hidden",
            marginBottom: 0,
          }}
          animate={{
            opacity: 1,
            height: "auto",
            overflow: "visible",
            marginBottom: 16,
          }}
          exit={{ opacity: 0, height: 0, overflow: "hidden", marginBottom: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="mb-4"
        >
          <LayoutSection className="space-y-4">
            <PageHeader
              title="Tus Favoritos"
              icon={Heart}
              count={favoriteRoomState.length + favoriteProfessorState.length}
              countLabel="guardados"
            />
            <motion.div
              layout
              className="grid max-h-96 grid-cols-1 gap-4 overflow-y-auto pr-2 scroll-custom sm:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
                {favoriteRoomState.map(({ room, roomInfo, status }, index) => (
                  <RoomCard
                    key={`fav-room-${room.id}`}
                    room={room}
                    status={status}
                    isOutsideHours={isOutsideHours}
                    timeUntilFree={roomInfo.timeUntilFree}
                    timeUntilOccupancy={roomInfo.timeUntilOccupancy}
                    occupiedUntilEnd={roomInfo.occupiedUntilEnd}
                    currentOccupancy={roomInfo.currentOccupancy}
                    isFavorite={isFavorite(room.id)}
                    onToggleFavorite={() => {
                      toggleFavorite(room.id);
                    }}
                    onClick={() =>
                      openScheduleModal({
                        id: room.id,
                        name: room.name,
                        type: "room",
                      })
                    }
                    delay={index * 0.05}
                  />
                ))}

                {favoriteProfessorState.map(
                  ({ professor, professorInfo, status }, index) => (
                    <ProfessorCard
                      key={`fav-prof-${professor.id}`}
                      professor={professor}
                      status={status}
                      isOutsideHours={isOutsideHours}
                      timeUntilFree={professorInfo.timeUntilFree}
                      timeUntilOccupancy={professorInfo.timeUntilOccupancy}
                      occupiedUntilEnd={professorInfo.occupiedUntilEnd}
                      currentOccupancy={professorInfo.currentOccupancy}
                      isFavorite={isFavorite(professor.id)}
                      onToggleFavorite={() => {
                        toggleFavorite(professor.id);
                      }}
                      onClick={() =>
                        openScheduleModal({
                          id: professor.id,
                          name: professor.name,
                          type: "professor",
                          location: professorInfo.currentOccupancy?.room.name,
                        })
                      }
                      delay={(favoriteRoomState.length + index) * 0.05}
                    />
                  ),
                )}
              </AnimatePresence>
            </motion.div>
          </LayoutSection>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
