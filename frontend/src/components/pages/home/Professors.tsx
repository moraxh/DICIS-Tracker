"use client";

import { User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ProfessorWithOccupancyInfo } from "@/backend/types";
import { isOutsideSchoolHours } from "@/backend/utils";
import CardGrid from "@/components/common/CardGrid";
import EmptyState from "@/components/common/EmptyState";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import ProfessorCard from "@/components/common/ProfessorCard";
import { useProfessors } from "@/context/Professor/useProfessors";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

type ProfessorsProps = {
  hideTitle?: boolean;
  state?: "available" | "occupied" | "all";
};

export default function ProfessorsSection({
  hideTitle = false,
  state = "all",
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
    state === "occupied"
      ? "Profesores ocupados"
      : state === "available"
        ? "Profesores libres"
        : "Profesores";

  const countLabel =
    state === "occupied" || state === "available" ? "profesores" : "total";

  if (isLoading) {
    return (
      <LayoutSection className="space-y-4">
        {!hideTitle && <PageHeader title={sectionTitle} icon={User} />}
        <CardGrid columns={2}>
          {Array.from({ length: 4 }, (_, index) => `professor-${index}`).map(
            (key) => (
              <div
                key={key}
                className="w-full h-[152px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
              />
            ),
          )}
        </CardGrid>
      </LayoutSection>
    );
  }

  if (allProfessors.length === 0) {
    const emptyMessage =
      state === "occupied"
        ? "No hay profesores ocupados en este momento"
        : state === "available"
          ? "No hay profesores libres en este momento"
          : "No hay profesores registrados";

    return (
      <LayoutSection className="space-y-4">
        {!hideTitle && (
          <PageHeader
            title={sectionTitle}
            icon={User}
            count={allProfessors.length}
            countLabel={countLabel}
          />
        )}
        <EmptyState message={emptyMessage} />
      </LayoutSection>
    );
  }

  return (
    <LayoutSection className="space-y-4">
      {!hideTitle && (
        <PageHeader
          title={sectionTitle}
          icon={User}
          count={allProfessors.length}
          countLabel={countLabel}
        />
      )}

      <CardGrid
        columns={2}
        className="max-h-[1000px] overflow-y-auto pr-2 scroll-custom"
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
      </CardGrid>
    </LayoutSection>
  );
}
