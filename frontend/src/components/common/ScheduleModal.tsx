"use client";

import { Clock, Loader2, MapPin, User, X } from "lucide-react";
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-7xl max-h-[90vh] bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-white/10 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                  {selectedItem.type === "room"
                    ? selectedItem.name.toUpperCase()
                    : selectedItem.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
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

            <div className="p-6 overflow-y-auto bg-zinc-50/50 dark:bg-[#0A0A0A]">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="animate-spin w-8 h-8 text-zinc-500" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white uppercase tracking-wider">
                      Horario Semanal
                    </h3>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30"></div>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Clase programada
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                    <div className="min-w-[800px] bg-white dark:bg-[#121212] rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden shadow-sm">
                      <div className="flex ml-14 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02]">
                        {DAYS.map((day) => (
                          <div
                            key={day}
                            className={`flex-1 text-center py-3 text-sm font-bold border-l border-zinc-200 dark:border-white/10 first:border-l-0 uppercase tracking-tight ${
                              day === currentDay
                                ? "text-blue-700 dark:text-blue-300 bg-blue-500/5"
                                : "text-zinc-600 dark:text-zinc-300"
                            }`}
                          >
                            {DAY_MAP[day]}
                          </div>
                        ))}
                      </div>

                      <div className="relative flex h-[600px] overflow-hidden">
                        <div className="w-14 flex flex-col bg-zinc-50/50 dark:bg-white/[0.02] border-r border-zinc-200 dark:border-white/10 shrink-0">
                          {HOURS.slice(0, -1).map((hour) => (
                            <div
                              key={hour}
                              className="flex-1 relative border-b border-zinc-200 dark:border-white/10 last:border-b-0"
                            >
                              <span className="absolute top-1 right-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
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
                                className="flex-1 border-b border-zinc-100 dark:border-white/5 last:border-b-0"
                              ></div>
                            ))}
                          </div>

                          {/* Current Time Line */}
                          {isCurrentTimeVisible && (
                            <div
                              className="absolute left-0 right-0 h-[2px] bg-red-500 z-30 pointer-events-none"
                              style={{ top: `${currentTimeTop}px` }}
                            >
                              <div className="absolute left-0 -top-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                            </div>
                          )}

                          {/* Vertical Lines (Days) */}
                          {DAYS.map((day) => (
                            <div
                              key={day}
                              className={`flex-1 relative border-l border-zinc-100 dark:border-white/5 first:border-l-0 ${
                                day === currentDay ? "bg-blue-500/[0.03]" : ""
                              }`}
                            >
                              {/* Render Events for this day */}
                              {getOverlappingClasses(
                                classes.filter((cls) => cls.day === day),
                              ).map((cls) => {
                                const startDecimal =
                                  timeToMinutes(cls.start) / 60;
                                const endDecimal = timeToMinutes(cls.end) / 60;
                                const top = (startDecimal - 8) * 60;
                                const height = (endDecimal - startDecimal) * 60;

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
                                    className={`absolute text-start rounded-md p-1.5 px-2 text-xs leading-tight overflow-hidden transition-all duration-200 z-10 flex flex-col group cursor-pointer border shadow-sm ${
                                      hoveredSubjectId === cls.subject.id
                                        ? "bg-blue-100 border-blue-400 dark:bg-blue-500/30 dark:border-blue-400 text-blue-900 dark:text-blue-100 scale-[1.02] z-20 shadow-md"
                                        : "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300"
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
                                      className="font-bold line-clamp-2 uppercase text-[10px]"
                                      title={title}
                                    >
                                      {title}
                                    </div>
                                    <div
                                      className="line-clamp-2 opacity-90 hidden sm:block mt-0.5 text-[10px] font-medium"
                                      title={subtitle}
                                    >
                                      {subtitle}
                                    </div>
                                    <div className="opacity-80 mt-auto text-[9px] font-medium hidden group-hover:block transition-all">
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
