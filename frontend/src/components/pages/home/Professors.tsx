"use client";

import { User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { isOutsideSchoolHours } from "@/backend/utils";
import EmptyState from "@/components/common/EmptyState";
import { useProfessors } from "@/context/Professor/useProfessors";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";
import ProfessorCard from "@/components/common/ProfessorCard";
import CardGrid from "@/components/common/CardGrid";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import { ProfessorWithOccupancyInfo } from "@/backend/types";

interface ProfessorsProps {
  hideTitle?: boolean;
  state?: "available" | "occupied" | "all";
}

export default function ProfessorsSection({ hideTitle = false, state = "all" }: ProfessorsProps) {
  const { professorsWithState, isLoading } = useProfessors();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();

  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  const allProfessors = useMemo(() => {
    const available = professorsWithState.freeProfessors.map((p) => ({ ...p, status: "available" as const }));
    const occupied = professorsWithState.occupiedProfessors.map((p) => ({ ...p, status: "occupied" as const }));
    
    let filtered = [];
    if (state === "available") filtered = available;
    else if (state === "occupied") filtered = occupied;
    else filtered = [...available, ...occupied];

    return filtered.sort((a, b) => a.professor.name.localeCompare(b.professor.name));
  }, [professorsWithState, state]);

  if (isLoading) {
    return (
      <LayoutSection className="space-y-4">
        {!hideTitle && (
          <PageHeader 
            title="Profesores" 
            icon={User}
          />
        )}
        <CardGrid columns={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[152px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </CardGrid>
      </LayoutSection>
    );
  }

  if (allProfessors.length === 0) {
    return (
      <LayoutSection className="space-y-4">
        {!hideTitle && (
          <PageHeader 
            title="Profesores" 
            icon={User}
            count={allProfessors.length}
            countLabel="total"
          />
        )}
        <EmptyState message="No hay profesores registrados" />
      </LayoutSection>
    );
  }

  return (
    <LayoutSection className="space-y-4">
      {!hideTitle && (
        <PageHeader 
          title="Profesores" 
          icon={User}
          count={allProfessors.length}
          countLabel="total"
        />
      )}

      <CardGrid columns={2} className="max-h-[1000px] overflow-y-auto pr-2 scroll-custom">
        {allProfessors.slice(0, 10).map((profInfo: ProfessorWithOccupancyInfo & { status: "available" | "occupied" }) => (
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
        ))}
      </CardGrid>
    </LayoutSection>
  );
}
