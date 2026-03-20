"use client";

import { Moon, Search, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  formatTimeRemaining,
  getSearchScore,
  isOutsideSchoolHours,
} from "@/backend/utils";
import EmptyState from "@/components/common/EmptyState";
import FavoriteButton from "@/components/common/FavoriteButton";
import GlowCard from "@/components/common/GlowCard";
import ProfessorCard from "@/components/common/ProfessorCard";
import PageHeader from "@/components/common/PageHeader";
import { useProfessors } from "@/context/Professor/useProfessors";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import SearchBar from "@/components/common/SearchBar";
import Tabs from "@/components/common/Tabs";
import LayoutSection from "@/components/common/LayoutSection";

export default function ProfessorsPage() {
  const { professorsWithState, isLoading } = useProfessors();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "occupied">("all");

  const setDebouncedSearchValue = useDebouncedCallback(
    (value: string) => setDebouncedSearch(value),
    { wait: 300 }
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setDebouncedSearchValue(value);
  };

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

    if (debouncedSearch) {
      return professors
        .map((p) => ({
          ...p,
          _score: getSearchScore(debouncedSearch, p.professor.name),
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
  }, [professorsWithState, filter, debouncedSearch]);

  const parentRef = useRef<HTMLDivElement>(null);

  const [columns, setColumns] = useState(3);
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 768) setColumns(1);
      else if (window.innerWidth < 1024) setColumns(2);
      else setColumns(3);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(filteredProfessors.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
  });

  return (
    <LayoutSection className="h-[calc(100vh-140px)] flex flex-col space-y-6 mt-6">
      <div className="flex flex-col gap-6 shrink-0 px-1">
        <PageHeader 
          title="Directorio de Profesores" 
          icon={User} 
          count={filteredProfessors.length} 
          countLabel="profesores en total"
        />
        <div className="flex flex-col sm:flex-row gap-5">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setDebouncedSearchValue(val);
            }}
            placeholder="Buscar profesor..."
            className="flex-1"
          />
          <Tabs
            tabs={[
              { id: "all", label: "Todos" },
              { id: "available", label: "Disponibles" },
              { id: "occupied", label: "Ocupados" }
            ]}
            activeTab={filter}
            onChange={setFilter}
          />
        </div>
      </div>

      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto pr-2 scroll-custom"
        style={{ scrollBehavior: 'smooth' }}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-[152px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredProfessors.length === 0 ? (
          <EmptyState message="No se encontraron profesores con los filtros seleccionados." />
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * columns;
              const rowItems = filteredProfessors.slice(startIndex, startIndex + columns);

              return (
                <div
                  key={virtualRow.key}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {rowItems.map((profInfo) => (
                    <div key={profInfo.professor.id} className="py-2">
                      <ProfessorCard
                        professor={profInfo.professor}
                        status={profInfo.status}
                        isOutsideHours={isOutsideHours}
                        timeUntilFree={profInfo.timeUntilFree}
                        timeUntilOccupancy={profInfo.timeUntilOccupancy}
                        occupiedUntilEnd={profInfo.occupiedUntilEnd}
                        currentOccupancy={profInfo.currentOccupancy}
                        isFavorite={isFavorite(profInfo.professor.id)}
                        onToggleFavorite={() => toggleFavorite(profInfo.professor.id)}
                        onClick={() => openScheduleModal({
                          id: profInfo.professor.id,
                          name: profInfo.professor.name,
                          type: "professor",
                          location: profInfo.currentOccupancy?.room.name,
                        })}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LayoutSection>
  );
}
