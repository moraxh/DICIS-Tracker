"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProfessorWithOccupancyInfo } from "@/backend/types";
import { isOutsideSchoolHours } from "@/backend/utils";
import HomeTableSection from "@/components/common/HomeTableSection";
import ProfessorCard from "@/components/common/ProfessorCard";
import { useProfessors } from "@/context/Professor/useProfessors";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

type ProfessorsProps = {
  state?: "available" | "occupied" | "all";
  title?: string;
  variant?: "main" | "side";
};

export default function ProfessorsSection({
  state = "all",
  title,
  variant = "main",
}: ProfessorsProps) {
  const { professorsWithState, isLoading } = useProfessors();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();

  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  const allProfessors = useMemo(() => {
    const available = professorsWithState.freeProfessors.map((p) => ({
      ...p,
      status: "available" as const,
    }));
    const occupied = professorsWithState.occupiedProfessors.map((p) => ({
      ...p,
      status: "occupied" as const,
    }));

    let filtered = [];
    if (state === "available") filtered = available;
    else if (state === "occupied") filtered = occupied;
    else filtered = [...available, ...occupied];

    return filtered.sort((a, b) =>
      a.professor.name.localeCompare(b.professor.name),
    );
  }, [professorsWithState, state]);

  const sectionTitle =
    title ??
    (state === "occupied"
      ? "Profesores ocupados"
      : state === "available"
        ? "Profesores libres"
        : "Profesores");

  const countLabel =
    state === "occupied" || state === "available" ? "profesores" : "total";
  const emptyMessage =
    state === "occupied"
      ? "No hay profesores ocupados en este momento"
      : state === "available"
        ? "No hay profesores libres en este momento"
        : "No hay profesores registrados";

  return (
    <HomeTableSection
      title={sectionTitle}
      count={allProfessors.length}
      countLabel={countLabel}
      variant={variant}
      isLoading={isLoading}
      isEmpty={allProfessors.length === 0}
      emptyMessage={emptyMessage}
      contentClassName={
        variant === "side"
          ? "max-h-[420px] overflow-y-auto pr-2 scroll-custom"
          : "max-h-[1000px] overflow-y-auto pr-2 scroll-custom"
      }
    >
      {allProfessors.slice(0, 10).map(
        (
          profInfo: ProfessorWithOccupancyInfo & {
            status: "available" | "occupied";
          },
        ) => (
          <ProfessorCard
            key={profInfo.professor.id}
            professor={profInfo.professor}
            status={profInfo.status}
            isOutsideHours={isOutsideHours}
            timeUntilFree={profInfo.timeUntilFree}
            timeUntilOccupancy={profInfo.timeUntilOccupancy}
            occupiedUntilEnd={profInfo.occupiedUntilEnd}
            currentOccupancy={profInfo.currentOccupancy}
            isFavorite={isFavorite(profInfo.professor.id)}
            onToggleFavorite={() => toggleFavorite(profInfo.professor.id)}
            onClick={() =>
              openScheduleModal({
                id: profInfo.professor.id,
                name: profInfo.professor.name,
                type: "professor",
                location: profInfo.currentOccupancy?.room.name,
              })
            }
          />
        ),
      )}
    </HomeTableSection>
  );
}
