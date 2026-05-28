"use client";

import { BookOpen, DoorOpen, User } from "lucide-react";
import { memo } from "react";
import type { SubjectWithDetails } from "@/backend/repositories/subject.repository";
import { openScheduleModal } from "@/hooks/useScheduleModal";
import GlowCard from "./GlowCard";

interface SubjectCardProps {
  subject: SubjectWithDetails;
  delay?: number;
}

const SubjectCard = memo(function SubjectCard({
  subject,
  delay = 0,
}: SubjectCardProps) {
  return (
    <GlowCard
      delay={delay}
      className="p-5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm transition-colors flex flex-col h-full"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 truncate block">
            {subject.courseName}
          </span>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug uppercase tracking-tight line-clamp-2 mt-0.5">
            {subject.name}
          </h3>
        </div>
      </div>

      <div className="mt-auto pt-3 flex flex-col gap-2 border-t border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-white/5 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          </div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
            {subject.honorific} {subject.professor}
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-white/5 flex items-center justify-center shrink-0">
            <DoorOpen className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          </div>
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate uppercase tracking-tight">
            {subject.roomName}
          </span>
        </div>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openScheduleModal({
                id: subject.professorId,
                name: `${subject.honorific} ${subject.professor}`,
                type: "professor",
              });
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <User className="w-3 h-3" />
            Ver Profesor
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openScheduleModal({
                id: subject.roomId,
                name: subject.roomName,
                type: "room",
              });
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <DoorOpen className="w-3 h-3" />
            Ver Aula
          </button>
        </div>
      </div>
    </GlowCard>
  );
});

export default SubjectCard;
