"use client";

import { Clock, Moon, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { formatTimeRemaining, isOutsideSchoolHours } from "@/backend/utils";
import EmptyState from "@/components/common/EmptyState";
import FavoriteButton from "@/components/common/FavoriteButton";
import GlowCard from "@/components/common/GlowCard";
import { useProfessors } from "@/context/Professor/useProfessors";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

export default function ProfessorsSection() {
  const { professorsWithState, isLoading } = useProfessors();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();

  const allProfessors = [
    ...professorsWithState.freeProfessors,
    ...professorsWithState.occupiedProfessors,
  ];

  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  if (isLoading) {
    return (
      <motion.section layout className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
            Profesores
          </h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[72px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </motion.section>
    );
  }

  if (allProfessors.length === 0) {
    return (
      <motion.section layout className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
            Profesores
          </h2>
        </div>
        <EmptyState message="No hay profesores disponibles en este momento" />
      </motion.section>
    );
  }

  return (
    <motion.section layout className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
          Profesores
        </h2>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scroll-custom">
        {allProfessors.map((profInfo, i) => {
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
              delay={0.3 + i * 0.05}
              className="p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 shadow-sm hover:border-zinc-300 dark:hover:border-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900 dark:text-white text-sm">
                      {profInfo.professor.honorific} {profInfo.professor.name}
                    </div>
                    {isOutsideHours ? (
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                        <Moon className="w-3 h-3" />
                        <span>Escuela cerrada</span>
                      </div>
                    ) : isInClass ? (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Se libera{" "}
                          {formatTimeRemaining(profInfo.timeUntilFree || 0)}
                        </span>
                      </div>
                    ) : profInfo.timeUntilOccupancy !== null ? (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Próxima clase{" "}
                          {formatTimeRemaining(profInfo.timeUntilOccupancy)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <FavoriteButton
                    isFavorite={isFavorite(profInfo.professor.id)}
                    onClick={() => {
                      toggleFavorite(profInfo.professor.id);
                    }}
                    className="p-1"
                    iconClassName="w-3 h-3"
                  />
                  <div
                    className={`px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] font-medium flex items-center gap-1.5 whitespace-nowrap ${isOutsideHours ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-700 dark:text-zinc-300"}`}
                  >
                    {isOutsideHours ? (
                      <>Fuera de horario</>
                    ) : (
                      <>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isInClass ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`}
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
      </div>
    </motion.section>
  );
}
