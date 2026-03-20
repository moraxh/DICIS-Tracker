"use client";

import { Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { ClassWithDetails } from "@/backend/types";
import { timeToMinutes } from "@/backend/utils";
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

export default function ScheduleModal() {
  const { selectedItem, closeScheduleModal } = useScheduleModal();
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const decimalCurrentTime = currentHour + currentMinute / 60;
  const isCurrentTimeVisible =
    decimalCurrentTime >= 8 && decimalCurrentTime <= 18;
  const currentTimeTop = (decimalCurrentTime - 8) * 60;

  const { getRoomScheduleById } = useRooms();
  const { getProfessorScheduleById } = useProfessors();

  useEffect(() => {
    if (!selectedItem) {
      setClasses([]);
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
    <AnimatePresence>
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
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {selectedItem.type === "room"
                    ? selectedItem.name.toUpperCase()
                    : selectedItem.name}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {selectedItem.type === "room"
                    ? "Salón de clases"
                    : `Ubicación actual: ${selectedItem.location || "Desconocida"}`}
                </p>
              </div>
              <button
                onClick={closeScheduleModal}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500 transition-colors"
                title="Cerrar"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
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
                            className="flex-1 text-center py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 border-l border-zinc-200 dark:border-white/10 first:border-l-0"
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
                              className="flex-1 relative border-l border-zinc-100 dark:border-white/5 first:border-l-0"
                            >
                              {/* Render Events for this day */}
                              {classes
                                .filter((cls) => cls.day === day)
                                .map((cls, i) => {
                                  const startDecimal =
                                    timeToMinutes(cls.start) / 60;
                                  const endDecimal =
                                    timeToMinutes(cls.end) / 60;
                                  const top = (startDecimal - 8) * 60;
                                  const height =
                                    (endDecimal - startDecimal) * 60;

                                  const title =
                                    selectedItem.type === "room"
                                      ? cls.subject.subject
                                      : cls.subject.subject;

                                  const subtitle =
                                    selectedItem.type === "room"
                                      ? cls.professor.name
                                      : cls.room.name.toUpperCase();

                                  return (
                                    <div
                                      key={`${cls.day}-${cls.start}-${i}`}
                                      className="absolute left-1 right-1 rounded-md p-1.5 px-2 text-xs leading-tight overflow-hidden bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300 transition-colors hover:bg-blue-100 dark:hover:bg-blue-500/20 shadow-sm z-10 flex flex-col group cursor-default"
                                      style={{
                                        top: `${top}px`,
                                        height: `${height - 2}px`,
                                        marginTop: "1px",
                                      }}
                                    >
                                      <div
                                        className="font-semibold line-clamp-2"
                                        title={title}
                                      >
                                        {title}
                                      </div>
                                      <div
                                        className="line-clamp-2 opacity-90 hidden sm:block"
                                        title={subtitle}
                                      >
                                        {subtitle}
                                      </div>
                                      <div className="opacity-80 mt-auto text-[9px] font-medium hidden group-hover:block transition-all">
                                        {cls.start} - {cls.end}
                                      </div>
                                    </div>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
