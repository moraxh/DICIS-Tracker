"use client";

import { User } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProfessorWithOccupancyInfo } from "@/backend/types";
import { isOutsideSchoolHours } from "@/backend/utils";
import HomeTableSection from "@/components/common/HomeTableSection";
import ProfessorCard from "@/components/common/ProfessorCard";
import { useProfessors } from "@/context/Professor/useProfessors";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

type ProfessorsProps = {
  title?: string;
};

export default function ProfessorsSection({
  title = "Profesores ocupados",
}: ProfessorsProps) {
  const { professorsWithState, isLoading } = useProfessors();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();

  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  const occupiedProfessors = [...professorsWithState.occupiedProfessors].sort(
    (a, b) => {
      if (a.occupiedUntilEnd && !b.occupiedUntilEnd) return 1;
      if (!a.occupiedUntilEnd && b.occupiedUntilEnd) return -1;
      return (a.timeUntilFree || 0) - (b.timeUntilFree || 0);
    },
  );

  return (
    <HomeTableSection
      title={title}
      icon={User}
      variant="side"
      showCount={false}
      isLoading={isLoading}
      isEmpty={occupiedProfessors.length === 0}
      emptyMessage="No hay profesores ocupados en este momento"
      contentLayout="stack"
      contentClassName="space-y-3 max-h-64 overflow-y-auto pr-2 scroll-custom min-h-[72px]"
      skeletonClassName="w-full h-[72px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
    >
      {occupiedProfessors.map((profInfo: ProfessorWithOccupancyInfo, index) => {
        return (
          <ProfessorCard
            key={profInfo.professor.id}
            professor={profInfo.professor}
            status="occupied"
            isOutsideHours={isOutsideHours}
            timeUntilFree={profInfo.timeUntilFree}
            timeUntilOccupancy={profInfo.timeUntilOccupancy}
            occupiedUntilEnd={profInfo.occupiedUntilEnd}
            currentOccupancy={profInfo.currentOccupancy}
            isFavorite={isFavorite(profInfo.professor.id)}
            onToggleFavorite={() => {
              toggleFavorite(profInfo.professor.id);
            }}
            onClick={() =>
              openScheduleModal({
                id: profInfo.professor.id,
                name: profInfo.professor.name,
                type: "professor",
                location: profInfo.currentOccupancy?.room.name,
              })
            }
            delay={0.3 + index * 0.05}
          />
        );
      })}
    </HomeTableSection>
  );
}
