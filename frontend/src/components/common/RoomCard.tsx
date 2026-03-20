"use client";

import { memo } from "react";
import { DoorOpen, Moon } from "lucide-react";
import { Room, ClassWithDetails } from "@/backend/types";
import { formatTimeRemaining } from "@/backend/utils";
import GlowCard from "./GlowCard";
import FavoriteButton from "./FavoriteButton";

interface RoomCardProps {
  room: Room;
  status: "available" | "occupied";
  isOutsideHours: boolean;
  timeUntilFree?: number | null;
  timeUntilOccupancy?: number | null;
  occupiedUntilEnd?: boolean;
  currentOccupancy?: ClassWithDetails | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

const RoomCard = memo(function RoomCard({
  room,
  status,
  isOutsideHours,
  timeUntilFree,
  timeUntilOccupancy,
  occupiedUntilEnd,
  isFavorite,
  onToggleFavorite,
  onClick
}: RoomCardProps) {
  const isOccupied = status === "occupied";

  return (
    <GlowCard
      onClick={onClick}
      className="p-5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm transition-colors cursor-pointer flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4 gap-2">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate uppercase tracking-tight">
            {room.name}
          </h3>
        </div>
        <FavoriteButton
          isFavorite={isFavorite}
          onClick={onToggleFavorite}
          className="p-1.5 -mr-1.5 -mt-1.5 shrink-0"
        />
      </div>

      <div className="mt-auto pt-4 flex items-end justify-between gap-2 border-t border-zinc-50 dark:border-white/5">
        <div className="flex flex-col min-w-0 flex-1">
          {isOutsideHours ? (
            <>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                Escuela Cerrada
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-semibold tracking-tight">
                Fuera de horario
              </span>
            </>
          ) : isOccupied ? (
            <>
              <span className="text-sm font-medium text-rose-500 truncate">
                Ocupado
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-semibold tracking-tight">
                {occupiedUntilEnd
                  ? "Resto del día"
                  : `Libre ${formatTimeRemaining(timeUntilFree || 0)}`}
              </span>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-emerald-500 truncate">
                Disponible
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-semibold tracking-tight">
                {timeUntilOccupancy !== null && timeUntilOccupancy !== undefined
                  ? `En ${formatTimeRemaining(timeUntilOccupancy)}`
                  : "Resto del día"}
              </span>
            </>
          )}
        </div>
        <div
          className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1.5 shrink-0 whitespace-nowrap ${isOutsideHours ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20" : isOccupied ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"}`}
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
});

export default RoomCard;
