"use client";

import { Moon, Search, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  formatTimeRemaining,
  getSearchScore,
  isOutsideSchoolHours,
} from "@/backend/utils";
import EmptyState from "@/components/common/EmptyState";
import FavoriteButton from "@/components/common/FavoriteButton";
import GlowCard from "@/components/common/GlowCard";
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
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
      transition={{ duration: 0.3 }}
      className="space-y-6 mt-6 pb-20"
    >
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Directorio de Profesores
        </h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar profesor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-2 sm:pb-0 scroll-custom">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-[#0A0A0A] dark:text-zinc-400 dark:border-white/10 dark:hover:bg-white/5"}`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilter("available")}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "available" ? "bg-emerald-500 text-white" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-[#0A0A0A] dark:text-zinc-400 dark:border-white/10 dark:hover:bg-white/5"}`}
            >
              Disponibles
            </button>
            <button
              type="button"
              onClick={() => setFilter("occupied")}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "occupied" ? "bg-rose-500 text-white" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-[#0A0A0A] dark:text-zinc-400 dark:border-white/10 dark:hover:bg-white/5"}`}
            >
              Ocupados
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, _i) => (
            <div
              key={crypto.randomUUID()}
              className="w-full h-[152px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredProfessors.length === 0 ? (
        <EmptyState message="No se encontraron profesores con los filtros seleccionados." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfessors.map((profInfo, i) => {
            const isOccupied = profInfo.status === "occupied";

            return (
              <GlowCard
                key={profInfo.professor.id}
                delay={searchQuery ? 0 : Math.min(i * 0.05, 0.5)}
                onClick={() =>
                  openScheduleModal({
                    id: profInfo.professor.id,
                    name: profInfo.professor.name,
                    type: "professor",
                    location: profInfo.currentOccupancy?.room.name,
                  })
                }
                className="p-5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm transition-colors cursor-pointer flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4 gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-2">
                        {profInfo.professor.honorific} {profInfo.professor.name}
                      </h3>
                    </div>
                  </div>
                  <FavoriteButton
                    isFavorite={isFavorite(profInfo.professor.id)}
                    onClick={() => toggleFavorite(profInfo.professor.id)}
                    className="p-1.5 -mr-1.5 -mt-1.5"
                  />
                </div>

                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div className="flex flex-col">
                    {isOutsideHours ? (
                      <>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Escuela Cerrada
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Fuera de horario
                        </span>
                      </>
                    ) : isOccupied ? (
                      <>
                        <span className="text-sm font-medium text-rose-500">
                          En clase
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {profInfo.occupiedUntilEnd
                            ? "Ocupado por el resto del día"
                            : `Se libera ${formatTimeRemaining(
                                profInfo.timeUntilFree || 0,
                              )}`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-emerald-500">
                          Disponible
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {profInfo.timeUntilOccupancy !== null
                            ? `Próxima clase ${formatTimeRemaining(profInfo.timeUntilOccupancy)}`
                            : "Libre el resto del día"}
                        </span>
                      </>
                    )}
                  </div>
                  <div
                    className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1.5 ${isOutsideHours ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20" : isOccupied ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"}`}
                  >
                    {isOutsideHours ? (
                      <>
                        <Moon className="w-3 h-3" />
                        CERRADO
                      </>
                    ) : (
                      <>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isOccupied ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`}
                        ></div>
                        {isOccupied ? "OCUPADO" : "LIBRE"}
                      </>
                    )}
                  </div>
                </div>
              </GlowCard>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
