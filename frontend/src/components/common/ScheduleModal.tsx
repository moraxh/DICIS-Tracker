"use client";

import { CalendarDays, Clock, Loader2, MapPin, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { ClassWithDetails } from "@/backend/types";
import {
  getMexicoCityDate,
  getTodayOfWeek,
  timeToMinutes,
} from "@/backend/utils";
import Badge from "@/components/common/Badge";
import BaseButton from "@/components/common/BaseButton";
import { useProfessors } from "@/context/Professor/useProfessors";
import { useRooms } from "@/context/Rooms/useRooms";
import { useScheduleModal } from "@/hooks/useScheduleModal";

const DAY_MAP: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
};

const DAYS = Object.keys(DAY_MAP);
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

function getOverlappingClasses(
  dayClasses: ClassWithDetails[],
): (ClassWithDetails & { width: string; left: string })[] {
  if (dayClasses.length === 0) return [];

  const sorted = [...dayClasses].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
  );

  const positioned: (ClassWithDetails & { width: string; left: string })[] = [];
  let columns: ClassWithDetails[][] = [];
  let lastEventEnding: number | null = null;

  const packEvents = (cols: ClassWithDetails[][]) => {
    const numColumns = cols.length;
    cols.forEach((col, colIndex) => {
      col.forEach((cls) => {
        positioned.push({
          ...cls,
          // Leave a little margin so they don't touch each other directly
          width: `calc(${100 / numColumns}% - 4px)`,
          left: `calc(${(100 / numColumns) * colIndex}% + 2px)`,
        });
      });
    });
  };

  for (const ev of sorted) {
    const start = timeToMinutes(ev.start);
    const end = timeToMinutes(ev.end);

    if (lastEventEnding !== null && start >= lastEventEnding) {
      packEvents(columns);
      columns = [];
      lastEventEnding = null;
    }

    let placed = false;
    for (const col of columns) {
      const lastEventInCol = col[col.length - 1];
      if (timeToMinutes(lastEventInCol.end) <= start) {
        col.push(ev);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([ev]);
    }

    if (lastEventEnding === null || end > lastEventEnding) {
      lastEventEnding = end;
    }
  }

  if (columns.length > 0) {
    packEvents(columns);
  }

  return positioned;
}

export default function ScheduleModal() {
  const { selectedItem, closeScheduleModal, openScheduleModal } =
    useScheduleModal();
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => getMexicoCityDate());
  const [hoveredSubjectId, setHoveredSubjectId] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassWithDetails | null>(
    null,
  );
  const [view, setView] = useState<"week" | "today">("today");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getMexicoCityDate()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const decimalCurrentTime = currentHour + currentMinute / 60;
  const isCurrentTimeVisible =
    decimalCurrentTime >= 8 && decimalCurrentTime <= 18;
  const currentTimeTop = (decimalCurrentTime - 8) * 60;
  const currentDay = getTodayOfWeek();

  const { getRoomScheduleById } = useRooms();
  const { getProfessorScheduleById } = useProfessors();

  useEffect(() => {
    if (!selectedItem) {
      setClasses([]);
      setSelectedClass(null);
      return;
    }

    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        if (selectedItem.type === "room") {
          const data = await getRoomScheduleById(selectedItem.id);
          setClasses(data?.classes || []);
        } else {
          const data = await getProfessorScheduleById(selectedItem.id);
          setClasses(data?.classes || []);
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedItem, getRoomScheduleById, getProfessorScheduleById]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedItem) {
        closeScheduleModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, closeScheduleModal]);

  return (
    <AnimatePresence mode="wait">
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeScheduleModal}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            key={`${selectedItem.type}-${selectedItem.id}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            layout
            transition={{
              layout: { duration: 0.28, ease: "easeOut" },
              default: { duration: 0.28, ease: "easeOut" },
            }}
            className={`relative w-full ${view === "today" ? "max-w-3xl" : "max-w-7xl"} max-h-[90vh] bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 flex flex-col overflow-hidden`}
          >
            <div className="flex items-center justify-between gap-4 p-5 sm:p-6 border-b border-zinc-200 dark:border-white/10 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
                    {selectedItem.type === "room" ? (
                      <MapPin className="h-3.5 w-3.5" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                    Horario de{" "}
                    {selectedItem.type === "room" ? "aula" : "profesor"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight leading-tight">
                  {selectedItem.type === "room"
                    ? selectedItem.name.toUpperCase()
                    : selectedItem.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="neutral"
                    icon={
                      selectedItem.type === "room" ? (
                        <MapPin className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )
                    }
                    className="text-[10px] uppercase font-bold tracking-wider"
                  >
                    {selectedItem.type === "room"
                      ? "Salón de clases"
                      : `Ubicación: ${selectedItem.location || "Desconocida"}`}
                  </Badge>
                </div>
              </div>
              <BaseButton
                variant="ghost"
                size="icon"
                onClick={closeScheduleModal}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </BaseButton>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto bg-zinc-50/70 dark:bg-[#0A0A0A]">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="animate-spin w-8 h-8 text-zinc-500" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div className="inline-flex w-fit items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                      <button
                        type="button"
                        onClick={() => setView("today")}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.14em] transition-all ${view === "today" ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
                      >
                        Hoy
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("week")}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.14em] transition-all ${view === "week" ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
                      >
                        Semana
                      </button>
                    </div>
                    {view === "week" && (
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30"></div>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            Clase programada
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {view === "today" &&
                    (() => {
                      const todayClasses = classes
                        .filter((cls) => cls.day === currentDay)
                        .sort((a, b) => a.start.localeCompare(b.start));

                      if (todayClasses.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.02]">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/10 dark:text-zinc-500">
                              <CalendarDays className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                              Sin clases hoy
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
                              No hay actividades programadas para{" "}
                              {DAY_MAP[currentDay] ?? "hoy"}
                            </p>
                          </div>
                        );
                      }

                      const nowMinutes = currentHour * 60 + currentMinute;

                      return (
                        <div className="space-y-3">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                                Agenda de hoy
                              </p>
                              <h3 className="mt-1 text-lg font-bold capitalize tracking-tight text-zinc-900 dark:text-white">
                                {DAY_MAP[currentDay]}
                              </h3>
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                              {todayClasses.length}{" "}
                              {todayClasses.length === 1 ? "clase" : "clases"}
                            </span>
                          </div>
                          <div>
                            {todayClasses.map((cls) => {
                              const startMin = timeToMinutes(cls.start);
                              const endMin = timeToMinutes(cls.end);
                              const isActive =
                                nowMinutes >= startMin && nowMinutes < endMin;
                              const isPast = nowMinutes >= endMin;
                              const subtitle =
                                selectedItem?.type === "room"
                                  ? cls.professor.name
                                  : cls.room.name.toUpperCase();

                              return (
                                <button
                                  type="button"
                                  key={`today-${cls.day}-${cls.start}-${cls.room.id}-${cls.professor.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedClass(cls);
                                  }}
                                  className={`group relative w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all shadow-sm ${
                                    isActive
                                      ? "bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 shadow-emerald-900/5"
                                      : isPast
                                        ? "bg-zinc-50/80 dark:bg-white/[0.02] border-zinc-200/70 dark:border-white/5 opacity-55"
                                        : "bg-white dark:bg-[#121212] border-zinc-200 dark:border-white/10 hover:-translate-y-0.5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md"
                                  }`}
                                >
                                  <div className="flex w-[3.25rem] shrink-0 flex-col items-center justify-center border-r border-zinc-200 pr-4 dark:border-white/10">
                                    <span
                                      className={`text-sm font-bold tracking-tight ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-700 dark:text-zinc-200"}`}
                                    >
                                      {cls.start}
                                    </span>
                                    <span className="mt-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                                      hasta {cls.end}
                                    </span>
                                  </div>
                                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                                    <span className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight line-clamp-2">
                                      {cls.subject.subject}
                                    </span>
                                    <span className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                      {selectedItem?.type === "room" ? (
                                        <User className="h-3 w-3 shrink-0" />
                                      ) : (
                                        <MapPin className="h-3 w-3 shrink-0" />
                                      )}
                                      <span className="truncate">
                                        {subtitle}
                                      </span>
                                    </span>
                                  </div>
                                  {isActive && (
                                    <div className="flex shrink-0 items-center">
                                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                        Ahora
                                      </span>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                  {view === "week" && (
                    <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                      <div className="min-w-[800px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#121212]">
                        <div className="flex ml-14 border-b border-zinc-200 bg-zinc-50/70 dark:border-white/10 dark:bg-white/[0.03]">
                          {DAYS.map((day) => (
                            <div
                              key={day}
                              className={`flex flex-1 flex-col items-center justify-center gap-1 border-l border-zinc-200 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] first:border-l-0 dark:border-white/10 ${
                                day === currentDay
                                  ? "bg-indigo-50/80 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                                  : "text-zinc-500 dark:text-zinc-400"
                              }`}
                            >
                              {DAY_MAP[day]}
                              {day === currentDay && (
                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[8px] tracking-widest text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                                  Hoy
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="relative flex h-[600px] overflow-hidden bg-white dark:bg-[#121212]">
                          <div className="w-14 flex shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/50 dark:border-white/10 dark:bg-white/[0.02]">
                            {HOURS.slice(0, -1).map((hour) => (
                              <div
                                key={hour}
                                className="relative flex-1 border-b border-zinc-200/80 dark:border-white/10 last:border-b-0"
                              >
                                <span className="absolute right-2 top-2 text-[9px] font-bold tracking-tight text-zinc-400 dark:text-zinc-500">
                                  {hour}:00
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Grid Lines & Events */}
                          <div className="flex-1 relative flex">
                            {/* Horizontal Lines */}
                            <div className="absolute inset-0 flex flex-col pointer-events-none">
                              {HOURS.slice(0, -1).map((hour) => (
                                <div
                                  key={hour}
                                  className="flex-1 border-b border-zinc-100/80 dark:border-white/5 last:border-b-0"
                                ></div>
                              ))}
                            </div>

                            {/* Current Time Line */}
                            {isCurrentTimeVisible && (
                              <div
                                className="pointer-events-none absolute left-0 right-0 z-30 h-[2px] bg-rose-500"
                                style={{ top: `${currentTimeTop}px` }}
                              >
                                <div className="absolute -top-1 left-0 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                              </div>
                            )}

                            {/* Vertical Lines (Days) */}
                            {DAYS.map((day) => (
                              <div
                                key={day}
                                className={`flex-1 relative border-l border-zinc-100 dark:border-white/5 first:border-l-0 ${
                                  day === currentDay
                                    ? "bg-indigo-500/[0.035]"
                                    : ""
                                }`}
                              >
                                {/* Render Events for this day */}
                                {getOverlappingClasses(
                                  classes.filter((cls) => cls.day === day),
                                ).map((cls) => {
                                  const startDecimal =
                                    timeToMinutes(cls.start) / 60;
                                  const endDecimal =
                                    timeToMinutes(cls.end) / 60;
                                  const top = (startDecimal - 8) * 60;
                                  const height =
                                    (endDecimal - startDecimal) * 60;

                                  const title = cls.subject.subject;

                                  const subtitle =
                                    selectedItem.type === "room"
                                      ? cls.professor.name
                                      : cls.room.name.toUpperCase();

                                  return (
                                    <button
                                      type="button"
                                      key={`${cls.day}-${cls.start}-${cls.end}-${cls.room.id}-${cls.professor.id}-${cls.subject.id}`}
                                      onMouseEnter={() =>
                                        setHoveredSubjectId(cls.subject.id)
                                      }
                                      onMouseLeave={() =>
                                        setHoveredSubjectId(null)
                                      }
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedClass(cls);
                                      }}
                                      aria-label={`${title} by ${subtitle}`}
                                      className={`group absolute z-10 flex cursor-pointer flex-col overflow-hidden rounded-xl border p-2 text-start text-xs leading-tight shadow-sm transition-all duration-200 ${
                                        hoveredSubjectId === cls.subject.id
                                          ? "z-20 scale-[1.02] border-indigo-400 bg-indigo-100 text-indigo-900 shadow-md dark:border-indigo-400 dark:bg-indigo-500/30 dark:text-indigo-100"
                                          : "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
                                      }`}
                                      style={{
                                        top: `${top}px`,
                                        height: `${height - 2}px`,
                                        width: cls.width,
                                        left: cls.left,
                                        marginTop: "1px",
                                      }}
                                    >
                                      <div
                                        className="line-clamp-2 text-[10px] font-bold uppercase"
                                        title={title}
                                      >
                                        {title}
                                      </div>
                                      <div
                                        className="mt-1 line-clamp-2 hidden text-[10px] font-medium opacity-90 sm:block"
                                        title={subtitle}
                                      >
                                        {subtitle}
                                      </div>
                                      <div className="mt-auto hidden text-[9px] font-medium opacity-80 transition-all group-hover:block">
                                        {cls.start} - {cls.end}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Selection Menu (Quick View) */}
            <AnimatePresence>
              {selectedClass && (
                <div className="absolute inset-0 z-[110] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedClass(null)}
                    className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[2px]"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="relative w-full max-w-sm bg-white dark:bg-[#0A0A0A] rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden"
                  >
                    <div className="text-center space-y-1 mb-6">
                      <h4 className="font-bold text-zinc-900 dark:text-white line-clamp-2 text-base tracking-tight leading-snug">
                        {selectedClass.subject.subject}
                      </h4>
                      <p className="text-sm text-zinc-500">
                        {selectedClass.professor.name}
                      </p>
                    </div>

                    <div className="space-y-4 py-4 border-y border-zinc-100 dark:border-white/5 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-zinc-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                            Aula
                          </p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white uppercase">
                            {selectedClass.room.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-zinc-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
                            Horario Completo
                          </p>
                          <div className="space-y-1">
                            {/* Find all sessions for this specific subject across the current schedule */}
                            {(() => {
                              const subjectSessions = classes.filter(
                                (c) =>
                                  c.subject.id === selectedClass.subject.id,
                              );
                              return subjectSessions.map((session) => (
                                <div
                                  key={`${session.day}-${session.start}-${session.end}-${session.room.id}`}
                                  className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300"
                                >
                                  <span className="font-semibold">
                                    {DAY_MAP[session.day]}
                                  </span>
                                  <span>
                                    {session.start} - {session.end}
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedItem.type !== "professor" && (
                        <BaseButton
                          variant="secondary"
                          onClick={() => {
                            openScheduleModal({
                              id: selectedClass.professor.id,
                              name: selectedClass.professor.name,
                              type: "professor",
                              location: selectedClass.room.name,
                            });
                            setSelectedClass(null);
                          }}
                          className="w-full h-12"
                        >
                          <User className="w-4 h-4 mr-2" />
                          VER PROFESOR
                        </BaseButton>
                      )}

                      {selectedItem.type !== "room" && (
                        <BaseButton
                          variant="secondary"
                          onClick={() => {
                            openScheduleModal({
                              id: selectedClass.room.id,
                              name: selectedClass.room.name,
                              type: "room",
                            });
                            setSelectedClass(null);
                          }}
                          className="w-full h-12"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          VER AULA
                        </BaseButton>
                      )}

                      <BaseButton
                        variant="ghost"
                        onClick={() => setSelectedClass(null)}
                        className="w-full mt-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        CERRAR DETALLE
                      </BaseButton>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
