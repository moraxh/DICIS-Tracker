"use client";

import { Clock, DoorOpen } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { RoomsWithState } from "@/backend/services/room.service";
import { DaysOfWeek } from "@/backend/types";
import {
  getMexicoCityDate,
  getSearchScore,
  getTodayOfWeek,
  isOutsideSchoolHours,
} from "@/backend/utils";
import Dropdown from "@/components/common/Dropdown";
import EmptyState from "@/components/common/EmptyState";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import RoomCard from "@/components/common/RoomCard";
import SearchBar from "@/components/common/SearchBar";
import Tabs from "@/components/common/Tabs";
import { useRooms } from "@/context/Rooms/useRooms";
import { useFavorites } from "@/hooks/useFavorites";
import { useScheduleModal } from "@/hooks/useScheduleModal";

const DURATION_OPTIONS = [
  { id: "0", label: "Cualquier tiempo" },
  { id: "30", label: "30+ min" },
  { id: "60", label: "1+ hora" },
  { id: "120", label: "2+ horas" },
];

const DAY_OPTIONS = DaysOfWeek.filter((d) => d !== "SUNDAY").map((d) => {
  const labels: Record<string, string> = {
    MONDAY: "Lunes",
    TUESDAY: "Martes",
    WEDNESDAY: "Miércoles",
    THURSDAY: "Jueves",
    FRIDAY: "Viernes",
    SATURDAY: "Sábado",
  };
  return { id: d, label: labels[d] ?? d };
});

const HOURS = Array.from({ length: 11 }, (_, i) => {
  const h = i + 8;
  return { id: `${h}:00`, label: `${h}:00` };
});

function getNowDefaults() {
  const now = getMexicoCityDate();
  const h = now.getHours();
  const m = now.getMinutes();
  const roundedH = m >= 30 ? h + 1 : h;
  const clampedH = Math.min(Math.max(roundedH, 8), 18);
  return {
    day: getTodayOfWeek(),
    time: `${clampedH}:00`,
  };
}

export default function RoomsPage() {
  const { roomsWithState: realtimeRooms, isLoading: realtimeLoading } =
    useRooms();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openScheduleModal } = useScheduleModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "occupied">("all");
  const [minDuration, setMinDuration] = useState("0");
  const [isOutsideHours, setIsOutsideHours] = useState(false);

  const defaults = useMemo(() => getNowDefaults(), []);
  const [selectedDay, setSelectedDay] = useState<string>(defaults.day);
  const [selectedTime, setSelectedTime] = useState(defaults.time);
  const isRealtime =
    selectedDay === defaults.day && selectedTime === defaults.time;

  const [customRooms, setCustomRooms] = useState<RoomsWithState | null>(null);
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  const fetchCustom = useCallback(async (day: string, time: string) => {
    setCustomLoading(true);
    try {
      const res = await fetch(
        `/api/v1/rooms?day=${day}&time=${encodeURIComponent(time)}`,
      );
      if (!res.ok) throw new Error("fetch failed");
      const data: RoomsWithState = await res.json();
      setCustomRooms(data);
    } catch {
      setCustomRooms(null);
    } finally {
      setCustomLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isRealtime) {
      fetchCustom(selectedDay, selectedTime);
    } else {
      setCustomRooms(null);
    }
  }, [selectedDay, selectedTime, isRealtime, fetchCustom]);

  const activeRooms = isRealtime
    ? realtimeRooms
    : (customRooms ?? realtimeRooms);
  const isLoading = isRealtime ? realtimeLoading : customLoading;

  const filteredRooms = useMemo(() => {
    let rooms = [
      ...activeRooms.freeRooms.map((r) => ({
        ...r,
        status: "available" as const,
      })),
      ...activeRooms.occupiedRooms.map((r) => ({
        ...r,
        status: "occupied" as const,
      })),
    ];

    if (filter === "available")
      rooms = rooms.filter((r) => r.status === "available");
    else if (filter === "occupied")
      rooms = rooms.filter((r) => r.status === "occupied");

    const min = Number.parseInt(minDuration, 10);
    if (min > 0) {
      rooms = rooms.filter(
        (r) =>
          r.status === "available" &&
          (r.timeUntilOccupancy === null ||
            r.timeUntilOccupancy === undefined ||
            r.timeUntilOccupancy >= min),
      );
    }

    if (searchQuery) {
      return rooms
        .map((r) => ({
          ...r,
          _score: getSearchScore(searchQuery, r.room.name),
        }))
        .filter((r) => r._score > 0)
        .sort(
          (a, b) =>
            b._score - a._score || a.room.name.localeCompare(b.room.name),
        );
    }

    return rooms.sort((a, b) => a.room.name.localeCompare(b.room.name));
  }, [activeRooms, filter, searchQuery, minDuration]);

  return (
    <LayoutSection className="space-y-5 mt-6 pb-20">
      {/* Header */}
      <PageHeader
        title="Explorar Aulas"
        icon={DoorOpen}
        count={filteredRooms.length}
        countLabel="espacios en total"
      />

      {/* Filter bar */}
      <div className="flex flex-col gap-3">
        {/* Row 1: search + status tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar aula..."
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

        {/* Row 2: time picker + duration — same visual weight */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Time picker pill */}
          <div className="flex items-center gap-2 flex-1 p-1 pl-3 rounded-2xl bg-zinc-100 dark:bg-white/5">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 hidden sm:block">
              Ver en:
            </span>
            <div className="flex gap-2 flex-1">
              <Dropdown
                options={DAY_OPTIONS}
                value={selectedDay}
                onChange={setSelectedDay}
                className="flex-1"
              />
              <Dropdown
                options={HOURS}
                value={selectedTime}
                onChange={setSelectedTime}
                className="flex-1"
              />
            </div>
            {isRealtime ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 shrink-0 pr-2">
                Ahora
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedDay(defaults.day);
                  setSelectedTime(defaults.time);
                }}
                className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink-0 pr-2 whitespace-nowrap"
              >
                ← Ahora
              </button>
            )}
          </div>

          {/* Duration dropdown — same height as pill */}
          <Dropdown
            options={DURATION_OPTIONS}
            value={minDuration}
            onChange={setMinDuration}
            placeholder="Tiempo libre"
            className="sm:w-44"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }, (_, i) => `room-skeleton-${i}`).map(
            (key) => (
              <div
                key={key}
                className="w-full h-[152px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
              />
            ),
          )}
        </div>
      ) : filteredRooms.length === 0 ? (
        <EmptyState message="No se encontraron aulas con los filtros seleccionados." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((roomInfo) => (
            <RoomCard
              key={roomInfo.room.id}
              room={roomInfo.room}
              status={roomInfo.status}
              isOutsideHours={isOutsideHours && isRealtime}
              timeUntilFree={roomInfo.timeUntilFree}
              timeUntilOccupancy={roomInfo.timeUntilOccupancy}
              occupiedUntilEnd={roomInfo.occupiedUntilEnd}
              currentOccupancy={roomInfo.currentOccupancy}
              isFavorite={isFavorite(roomInfo.room.id)}
              onToggleFavorite={() => toggleFavorite(roomInfo.room.id)}
              onClick={() =>
                openScheduleModal({
                  id: roomInfo.room.id,
                  name: roomInfo.room.name,
                  type: "room",
                })
              }
            />
          ))}
        </div>
      )}
    </LayoutSection>
  );
}
