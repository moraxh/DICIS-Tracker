"use client";

import { Heart, Moon, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { isOutsideSchoolHours } from "@/backend/utils";
import FavoriteButton from "@/components/common/FavoriteButton";
import GlowCard from "@/components/common/GlowCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useFavoritesData } from "@/hooks/useFavoritesData";
import { useScheduleModal } from "@/hooks/useScheduleModal";

export default function FavoritesSection() {
  const { toggleFavorite } = useFavorites();
  const { rooms: favoriteRooms, professors: favoriteProfessors } =
    useFavoritesData();
  const { openScheduleModal } = useScheduleModal();

  const hasAnyFavorites =
    favoriteRooms.length > 0 || favoriteProfessors.length > 0;

  // Use a state for the hydration-safe date variable
  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  return (
    <AnimatePresence>
      {hasAnyFavorites && (
        <motion.section
          layout
          initial={{
            opacity: 0,
            height: 0,
            overflow: "hidden",
            marginBottom: 0,
          }}
          animate={{
            opacity: 1,
            height: "auto",
            overflow: "visible",
            marginBottom: 16,
          }}
          exit={{ opacity: 0, height: 0, overflow: "hidden", marginBottom: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 pt-2">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              Tus Favoritos ({favoriteRooms.length + favoriteProfessors.length})
            </h2>
          </div>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 scroll-custom"
          >
            <AnimatePresence mode="popLayout">
              {/* Favorite Rooms */}
              {favoriteRooms.map((room) => {
                return (
                  <GlowCard
                    onClick={() =>
                      openScheduleModal({
                        id: room.id,
                        name: room.name,
                        type: "room",
                      })
                    }
                    key={`fav-room-${room.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-zinc-900 dark:text-white truncate">
                          {room.name.toUpperCase()}
                        </h3>
                      </div>
                      <FavoriteButton
                        isFavorite={true}
                        onClick={() => {
                          toggleFavorite(room.id);
                        }}
                        className="p-1.5 -mr-1.5 -mt-1.5 shrink-0"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div
                        className={`px-2 py-1 rounded-md bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] font-medium flex items-center gap-1.5 shrink-0 whitespace-nowrap ${isOutsideHours ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-700 dark:text-zinc-300"}`}
                      >
                        {isOutsideHours ? (
                          <>
                            <Moon className="w-3 h-3" />
                            Fuera de horario
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            Disponible
                          </>
                        )}
                      </div>
                    </div>
                  </GlowCard>
                );
              })}

              {/* Favorite Professors */}
              {favoriteProfessors.map((prof) => {
                return (
                  <GlowCard
                    onClick={() =>
                      openScheduleModal({
                        id: prof.id,
                        name: prof.name,
                        type: "professor",
                      })
                    }
                    key={`fav-prof-${prof.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-medium text-zinc-900 dark:text-white truncate">
                          {prof.honorific} {prof.name}
                        </h3>
                      </div>
                      <FavoriteButton
                        isFavorite={true}
                        onClick={() => {
                          toggleFavorite(prof.id);
                        }}
                        className="p-1.5 -mr-1.5 -mt-1.5 shrink-0"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div
                        className={`px-2 py-1 rounded-md bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] font-medium flex items-center gap-1.5 shrink-0 whitespace-nowrap ${isOutsideHours ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-700 dark:text-zinc-300"}`}
                      >
                        {isOutsideHours ? (
                          <>
                            <Moon className="w-3 h-3" />
                            Fuera de horario
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            Disponible
                          </>
                        )}
                      </div>
                    </div>
                  </GlowCard>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
