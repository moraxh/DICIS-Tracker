"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { type SubjectWithSchedule } from "@/backend/services/subject.service";
import { timeToMinutes, getMexicoCityDate, getTodayOfWeek } from "@/backend/utils";
import { AlertCircle } from "lucide-react";

interface CalendarViewProps {
  subjects: SubjectWithSchedule[];
  onSubjectClick: (subject: SubjectWithSchedule) => void;
}

const DAY_MAP: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
};

const DAYS = Object.keys(DAY_MAP);
const START_HOUR = 8;
const END_HOUR = 19;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

export default function CalendarView({ subjects, onSubjectClick }: CalendarViewProps) {
  const [currentTime, setCurrentTime] = useState(getMexicoCityDate());
  const currentDay = getTodayOfWeek();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getMexicoCityDate()), 60000);
    return () => clearInterval(timer);
  }, []);

  const decimalCurrentTime = currentTime.getHours() + currentTime.getMinutes() / 60;
  const isCurrentTimeVisible = decimalCurrentTime >= START_HOUR && decimalCurrentTime <= END_HOUR;
  const currentTimeTop = (decimalCurrentTime - START_HOUR) * 60;

  // Process data and detect collisions
  const { scheduleData, collisions } = useMemo(() => {
    const data: Record<string, any[]> = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
    };
    const collisionList: { s1: string; s2: string; day: string; time: string }[] = [];

    subjects.forEach((subject) => {
      subject.classes.forEach((clr) => {
        const dayKey = clr.day;
        if (dayKey && data[dayKey]) {
          // Collision check
          const clrStart = timeToMinutes(clr.start);
          const clrEnd = timeToMinutes(clr.end);

          data[dayKey].forEach((existing) => {
            const exStart = timeToMinutes(existing.start);
            const exEnd = timeToMinutes(existing.end);

            if ((clrStart < exEnd && clrEnd > exStart)) {
              if (!collisionList.find(c => (c.s1 === existing.subjectName && c.s2 === subject.subject.subject) || (c.s1 === subject.subject.subject && c.s2 === existing.subjectName))) {
                collisionList.push({
                   s1: existing.subjectName,
                   s2: subject.subject.subject,
                   day: clr.day,
                   time: `${clr.start} - ${clr.end}`
                });
              }
            }
          });

          data[dayKey].push({
            ...clr,
            subjectName: subject.subject.subject,
            fullSubject: subject,
          });
        }
      });
    });

    return { scheduleData: data, collisions: collisionList };
  }, [subjects]);

  return (
    <div className="space-y-6">
      <div className="w-full overflow-x-auto pb-4 scroll-custom">
        <div className="min-w-[800px] bg-white dark:bg-[#121212] rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex ml-14 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02]">
            {DAYS.map((day) => (
              <div
                key={day}
                className={`flex-1 text-center py-3 text-xs font-bold uppercase tracking-wider border-l border-zinc-200 dark:border-white/10 first:border-l-0 ${
                  day === currentDay
                    ? "text-red-500 bg-red-500/5"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {DAY_MAP[day]}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="relative flex h-[600px] overflow-hidden">
            {/* Time Column */}
            <div className="w-14 flex flex-col bg-zinc-50/50 dark:bg-white/[0.02] border-r border-zinc-200 dark:border-white/10 shrink-0">
              {HOURS.slice(0, -1).map((hour) => (
                <div key={hour} className="flex-1 relative border-b border-zinc-200 dark:border-white/10 last:border-b-0">
                  <span className="absolute top-1 right-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                    {hour}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Grid Content */}
            <div className="flex-1 relative flex">
              {/* Horizontal Guidelines */}
              <div className="absolute inset-0 flex flex-col pointer-events-none">
                {HOURS.slice(0, -1).map((hour) => (
                  <div key={hour} className="flex-1 border-b border-zinc-100 dark:border-white/5 last:border-b-0"></div>
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

              {/* Day Columns */}
              {DAYS.map((day) => (
                <div
                  key={day}
                  className={`flex-1 relative border-l border-zinc-100 dark:border-white/5 first:border-l-0 ${
                    day === currentDay ? "bg-red-500/[0.02]" : ""
                  }`}
                >
                  {scheduleData[day].map((cls, idx) => {
                    const startDecimal = timeToMinutes(cls.start) / 60;
                    const endDecimal = timeToMinutes(cls.end) / 60;
                    const top = (startDecimal - START_HOUR) * 60;
                    const height = (endDecimal - startDecimal) * 60;

                    return (
                      <motion.div
                        key={`${cls.subjectName}-${idx}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, zIndex: 10 }}
                        onClick={() => onSubjectClick(cls.fullSubject)}
                        className="absolute inset-x-1 rounded-md p-1.5 px-2 text-[10px] leading-tight cursor-pointer overflow-hidden border transition-shadow hover:shadow-lg bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 group"
                        style={{
                          top: `${top}px`,
                          height: `${height - 2}px`,
                          marginTop: "1px",
                        }}
                      >
                        <div className="font-bold truncate uppercase leading-tight mb-1">{cls.subjectName}</div>
                        <div className="opacity-90 truncate font-bold text-[8px] uppercase">{cls.professor.name}</div>
                        <div className="mt-0.5 opacity-80 truncate text-[8px] uppercase font-medium">
                          {cls.room.name} • {cls.start} - {cls.end}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collisions Warning */}
      {collisions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex gap-3 text-amber-800 dark:text-amber-200"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-tight">Colisión de horarios detectada</h4>
            <div className="space-y-1">
              {collisions.map((c, i) => (
                <p key={i} className="text-xs">
                  <span className="font-bold underline">{c.s1}</span> y <span className="font-bold underline">{c.s2}</span> coinciden los <span className="font-bold">{c.day}</span> a las <span className="font-bold">{c.time}</span>.
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
