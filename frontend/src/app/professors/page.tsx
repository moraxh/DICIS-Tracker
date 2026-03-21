"use client";

import { User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSearchScore, isOutsideSchoolHours } from "@/backend/utils";
import EmptyState from "@/components/common/EmptyState";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import ProfessorCard from "@/components/common/ProfessorCard";
import SearchBar from "@/components/common/SearchBar";
import Tabs from "@/components/common/Tabs";
import { useProfessors } from "@/context/Professor/useProfessors";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

export default function ProfessorsPage() {
  const { professorsWithState, isLoading } = useProfessors();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "occupied">("all");

  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  const filteredProfessors = useMemo(() => {
    let professors = [
      ...professorsWithState.freeProfessors.map((p) => ({
        ...p,
        status: "available" as const,
      })),
      ...professorsWithState.occupiedProfessors.map((p) => ({
        ...p,
        status: "occupied" as const,
      })),
    ];

    if (filter === "available") {
      professors = professors.filter((p) => p.status === "available");
    } else if (filter === "occupied") {
      professors = professors.filter((p) => p.status === "occupied");
    }

    if (searchQuery) {
      return professors
        .map((p) => ({
          ...p,
          _score: getSearchScore(searchQuery, p.professor.name),
        }))
        .filter((p) => p._score > 0)
        .sort(
          (a, b) =>
            b._score - a._score ||
            a.professor.name.localeCompare(b.professor.name),
        );
    }

    return professors.sort((a, b) =>
      a.professor.name.localeCompare(b.professor.name),
    );
  }, [professorsWithState, filter, searchQuery]);

  return (
    <LayoutSection className="space-y-6 mt-6 pb-20">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Directorio de Profesores"
          icon={User}
          count={filteredProfessors.length}
          countLabel="profesores en total"
        />
        <div className="flex flex-col sm:flex-row gap-5">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar profesor..."
            className="flex-1"
          />
          <Tabs
            tabs={[
              { id: "all", label: "Todos" },
              { id: "available", label: "Disponibles" },
              { id: "occupied", label: "Ocupados" },
            ]}
            activeTab={filter}
            onChange={setFilter}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(
            { length: 9 },
            (_, index) => `professor-skeleton-${index}`,
          ).map((key) => (
            <div
              key={key}
              className="w-full h-[152px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredProfessors.length === 0 ? (
        <EmptyState message="No se encontraron profesores con los filtros seleccionados." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfessors.map((profInfo) => (
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
        </div>
      )}
    </LayoutSection>
  );
}
