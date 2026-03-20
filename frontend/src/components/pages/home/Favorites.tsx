"use client";

import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { isOutsideSchoolHours } from "@/backend/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useFavoritesData } from "@/hooks/useFavoritesData";
import { useScheduleModal } from "@/hooks/useScheduleModal";
import { useRooms } from "@/context/Rooms/useRooms";
import { useProfessors } from "@/context/Professor/useProfessors";
import RoomCard from "@/components/common/RoomCard";
import ProfessorCard from "@/components/common/ProfessorCard";
import PageHeader from "@/components/common/PageHeader";

export default function FavoritesSection() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { rooms: favRoomData, professors: favProfData } = useFavoritesData();
  const { roomsWithState } = useRooms();
  const { professorsWithState } = useProfessors();
  const { openScheduleModal } = useScheduleModal();

  const hasAnyFavorites = favRoomData.length > 0 || favProfData.length > 0;
  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  return (
    <AnimatePresence>
      {hasAnyFavorites && (
        <motion.section
          layout
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 mb-16"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 pt-2">
            <PageHeader 
              title="Tus Favoritos" 
              icon={Heart} 
              className="border-none pb-0 pt-0"
            />
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">
              {favRoomData.length + favProfData.length} items
            </span>
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[800px] overflow-y-auto pr-2 scroll-custom"
          >
            <AnimatePresence mode="popLayout">
              {/* Favorite Rooms */}
              {favRoomData.map((room) => {
                const isFree = roomsWithState.freeRooms.some(r => r.room.id === room.id);
                const roomState = isFree 
                  ? roomsWithState.freeRooms.find(r => r.room.id === room.id) 
                  : roomsWithState.occupiedRooms.find(r => r.room.id === room.id);

                return (
                  <RoomCard
                    key={`fav-room-${room.id}`}
                    room={room}
                    status={isFree ? "available" : "occupied"}
                    isOutsideHours={isOutsideHours}
                    timeUntilFree={roomState?.timeUntilFree}
                    timeUntilOccupancy={roomState?.timeUntilOccupancy}
                    occupiedUntilEnd={roomState?.occupiedUntilEnd}
                    currentOccupancy={roomState?.currentOccupancy}
                    isFavorite={isFavorite(room.id)}
                    onToggleFavorite={() => toggleFavorite(room.id)}
                    onClick={() =>
                      openScheduleModal({
                        id: room.id,
                        name: room.name,
                        type: "room",
                      })
                    }
                  />
                );
              })}

              {/* Favorite Professors */}
              {favProfData.map((prof) => {
                const isFree = professorsWithState.freeProfessors.some(p => p.professor.id === prof.id);
                const profState = isFree
                  ? professorsWithState.freeProfessors.find(p => p.professor.id === prof.id)
                  : professorsWithState.occupiedProfessors.find(p => p.professor.id === prof.id);

                return (
                  <ProfessorCard
                    key={`fav-prof-${prof.id}`}
                    professor={prof}
                    status={isFree ? "available" : "occupied"}
                    isOutsideHours={isOutsideHours}
                    timeUntilFree={profState?.timeUntilFree}
                    timeUntilOccupancy={profState?.timeUntilOccupancy}
                    occupiedUntilEnd={profState?.occupiedUntilEnd}
                    currentOccupancy={profState?.currentOccupancy}
                    isFavorite={isFavorite(prof.id)}
                    onToggleFavorite={() => toggleFavorite(prof.id)}
                    onClick={() =>
                      openScheduleModal({
                        id: prof.id,
                        name: prof.name,
                        type: "professor",
                        location: profState?.currentOccupancy?.room.name
                      })
                    }
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
