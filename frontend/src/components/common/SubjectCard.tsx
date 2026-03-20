"use client";

import { memo } from "react";
import { Users, MapPin, Bookmark, BookmarkCheck } from "lucide-react";
import { SubjectWithSchedule, ClassWithDetails } from "@/backend/types";
import GlowCard from "./GlowCard";

interface SubjectCardProps {
  subjectData: SubjectWithSchedule;
  isMySubject: boolean;
  onToggleMySubject: (e: React.MouseEvent) => void;
  onClick: () => void;
  className?: string;
}

const SubjectCard = memo(function SubjectCard({
  subjectData,
  isMySubject,
  onToggleMySubject,
  onClick,
  className = ""
}: SubjectCardProps) {
  const { subject, classes } = subjectData;
  const professors = Array.from(new Set(classes.map((c: ClassWithDetails) => c.professor.name)));
  const rooms = Array.from(new Set(classes.map((c: ClassWithDetails) => c.room.name)));

  return (
    <GlowCard
      onClick={onClick}
      className={`p-6 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm transition-colors cursor-pointer flex flex-col h-full ${className}`}
    >
      <div className="flex justify-between items-start mb-1 gap-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex-1 min-w-0 line-clamp-2 uppercase tracking-tight leading-tight">
          {subject.subject}
        </h3>
        <button
          onClick={onToggleMySubject}
          className="p-1.5 -mr-1.5 -mt-1.5 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
        >
          {isMySubject ? (
            <BookmarkCheck className="w-5 h-5 text-red-500 fill-red-500" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>
      
      <div className="text-[10px] text-zinc-500 dark:text-zinc-500 font-bold uppercase mb-6 tracking-widest">
        {subject.course_name}
      </div>
      
      <div className="mt-auto space-y-2 pt-4 border-t border-zinc-50 dark:border-white/5 font-bold tracking-tight">
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
          <Users className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
          <span className="truncate font-semibold">{professors.join(", ") || "No asignado"}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
          <span className="truncate font-semibold">{rooms.join(", ") || "No asignado"}</span>
        </div>
      </div>
    </GlowCard>
  );
});

export default SubjectCard;
