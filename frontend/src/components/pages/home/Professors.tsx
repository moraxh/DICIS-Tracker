"use client";

import { Clock, Moon, User } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProfessorWithOccupancyInfo } from "@/backend/types";
import { formatTimeRemaining, isOutsideSchoolHours } from "@/backend/utils";
import FavoriteButton from "@/components/common/FavoriteButton";
import GlowCard from "@/components/common/GlowCard";
import HomeTableSection from "@/components/common/HomeTableSection";
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
        const isInClass = profInfo.currentOccupancy !== null;

        return (
          <GlowCard
            onClick={() =>
              openScheduleModal({
                id: profInfo.professor.id,
                name: profInfo.professor.name,
                type: "professor",
                location: profInfo.currentOccupancy?.room.name,
              })
            }
            key={profInfo.professor.id}
            delay={0.3 + index * 0.05}
            className="p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 shadow-sm hover:border-zinc-300 dark:hover:border-white/10 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-zinc-900 dark:text-white">
                    {profInfo.professor.honorific} {profInfo.professor.name}
                  </div>
                  {isOutsideHours ? (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                      <Moon className="h-3 w-3" />
                      <span>Escuela cerrada</span>
                    </div>
                  ) : isInClass ? (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Clock className="h-3 w-3" />
                      <span>
                        {profInfo.occupiedUntilEnd
                          ? "Ocupado por el resto del día"
                          : `Se libera ${formatTimeRemaining(
                              profInfo.timeUntilFree || 0,
                            )}`}
                      </span>
                    </div>
                  ) : profInfo.timeUntilOccupancy !== null ? (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Clock className="h-3 w-3" />
                      <span>
                        Próxima clase{" "}
                        {formatTimeRemaining(profInfo.timeUntilOccupancy)}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Clock className="h-3 w-3" />
                      <span>Libre el resto del día</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <FavoriteButton
                  isFavorite={isFavorite(profInfo.professor.id)}
                  onClick={() => {
                    toggleFavorite(profInfo.professor.id);
                  }}
                  className="p-1"
                  iconClassName="w-3 h-3"
                />
                <div
                  className={`px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] font-medium flex items-center gap-1.5 whitespace-nowrap ${
                    isOutsideHours
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {isOutsideHours ? (
                    <>Fuera de horario</>
                  ) : (
                    <>
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          isInClass
                            ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                            : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        }`}
                      ></div>
                      {isInClass ? "En clase" : "Disponible"}
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlowCard>
        );
      })}
    </HomeTableSection>
  );
}
